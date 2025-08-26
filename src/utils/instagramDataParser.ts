export interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  timestamp?: number;
  selected: boolean;
  originalData?: any;
}

export interface ParsedInstagramData {
  posts: InstagramPost[];
  totalPosts: number;
  totalImages: number;
  metadataFiles: string[];
  extractedFiles: { [key: string]: ArrayBuffer };
}

export class InstagramDataParser {
  private extractedFiles: { [key: string]: ArrayBuffer } = {};

  /**
   * Parse Instagram data from a ZIP file
   */
  async parseInstagramData(zipFile: File): Promise<ParsedInstagramData> {
    try {
      // Extract the ZIP file
      await this.extractZipFile(zipFile);
      
      // Find media and activity directories
      const { mediaDir, activityDir } = this.findDirectories();
      
      // Parse metadata files
      const metadataFiles = this.findMetadataFiles(activityDir);
      const postsData = this.parseMetadata(metadataFiles);
      
      // Find and match images
      const imageFiles = this.findImageFiles(mediaDir);
      const matchedPosts = this.matchPostsWithImages(postsData, imageFiles);
      
      // Convert to InstagramPost format with proper image URLs
      const posts: InstagramPost[] = await Promise.all(
        matchedPosts.map(async (post, index) => {
          const imageUrl = await this.createImageDataUrl(post.imagePath);
          return {
            id: `post_${index}`,
            image: imageUrl,
            caption: post.caption,
            timestamp: post.timestamp,
            selected: true,
            originalData: post.originalData
          };
        })
      );

      return {
        posts,
        totalPosts: posts.length,
        totalImages: imageFiles.length,
        metadataFiles: metadataFiles.map(f => f.name),
        extractedFiles: this.extractedFiles
      };
      
    } catch (error) {
      console.error('Error parsing Instagram data:', error);
      throw new Error(`Failed to parse Instagram data: ${error}`);
    }
  }

  /**
   * Extract ZIP file contents
   */
  private async extractZipFile(zipFile: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          
          // Use JSZip library to extract the ZIP file
          const JSZip = await import('jszip');
          const zip = new JSZip.default();
          
          const zipContent = await zip.loadAsync(arrayBuffer);
          
          // Extract all files
          for (const [filename, file] of Object.entries(zipContent.files)) {
            if (!file.dir) {
              // Store file content in memory
              const fileContent = await file.async('arraybuffer');
              this.extractedFiles[filename] = fileContent;
            }
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read ZIP file'));
      reader.readAsArrayBuffer(zipFile);
    });
  }

  /**
   * Find media and activity directories
   */
  private findDirectories(): { mediaDir: string; activityDir: string } {
    const paths = Object.keys(this.extractedFiles);
    
    let mediaDir = '';
    let activityDir = '';
    
    // Look for media directory (contains posts folder)
    for (const path of paths) {
      if (path.includes('media') && path.includes('posts')) {
        mediaDir = path.substring(0, path.indexOf('posts'));
        break;
      }
    }
    
    // Look for activity directory
    for (const path of paths) {
      if (path.includes('your_instagram_activity')) {
        activityDir = path.substring(0, path.indexOf('your_instagram_activity')) + 'your_instagram_activity';
        break;
      }
    }
    
    if (!mediaDir || !activityDir) {
      throw new Error('Could not find required directories in Instagram data');
    }
    
    return { mediaDir, activityDir };
  }

  /**
   * Find metadata JSON files
   */
  private findMetadataFiles(activityDir: string): ArrayBuffer[] {
    const metadataFiles: ArrayBuffer[] = [];
    
    // Priority order for metadata files
    const priorityFiles = ['posts_1.json', 'posts.json', 'media.json', 'saved_posts.json'];
    
    for (const [filePath, content] of Object.entries(this.extractedFiles)) {
      if (filePath.startsWith(activityDir) && filePath.endsWith('.json')) {
        metadataFiles.push(content);
      }
    }
    
    // Sort by priority
    metadataFiles.sort((a, b) => {
      const aPath = Object.keys(this.extractedFiles).find(path => this.extractedFiles[path] === a) || '';
      const bPath = Object.keys(this.extractedFiles).find(path => this.extractedFiles[path] === b) || '';
      const aName = aPath.split('/').pop() || '';
      const bName = bPath.split('/').pop() || '';
      
      const aPriority = priorityFiles.indexOf(aName);
      const bPriority = priorityFiles.indexOf(bName);
      
      if (aPriority === -1 && bPriority === -1) return 0;
      if (aPriority === -1) return 1;
      if (bPriority === -1) return -1;
      return aPriority - bPriority;
    });
    
    return metadataFiles;
  }

  /**
   * Parse metadata files to extract post information
   */
  private parseMetadata(metadataFiles: ArrayBuffer[]): any[] {
    const postsData: any[] = [];
    
    for (const metadataFile of metadataFiles) {
      try {
        const text = new TextDecoder().decode(metadataFile);
        const data = JSON.parse(text);
        
        // Handle different JSON structures
        let items: any[] = [];
        
        if (Array.isArray(data)) {
          items = data;
        } else if (typeof data === 'object') {
          // Look for common keys that might contain posts
          for (const key of ['media', 'posts', 'data', 'items']) {
            if (data[key] && Array.isArray(data[key])) {
              items = data[key];
              break;
            }
          }
          if (items.length === 0) {
            items = [data]; // Single post
          }
        }
        
        // Process each item
        for (const item of items) {
          if (typeof item === 'object' && item !== null) {
            const postInfo = this.extractPostInfo(item);
            if (postInfo) {
              postsData.push(postInfo);
            }
          }
        }
        
      } catch (error) {
        console.warn('Error parsing metadata file:', error);
        continue;
      }
    }
    
    return postsData;
  }

  /**
   * Extract relevant information from a single post item
   */
  private extractPostInfo(item: any): any | null {
    // Try to extract title/caption
    let caption = '';
    for (const key of ['title', 'caption', 'description', 'text', 'content']) {
      if (item[key] && item[key].toString().trim()) {
        caption = item[key].toString().trim();
        break;
      }
    }
    
    // Default caption if none exists
    if (!caption) {
      caption = 'Instagram post';
    }
    
    // Try to extract media URI
    let mediaUri = '';
    for (const key of ['uri', 'media_uri', 'file_path', 'path', 'url']) {
      if (item[key] && item[key].toString().trim()) {
        mediaUri = item[key].toString().trim();
        break;
      }
    }
    
    // Try to extract timestamp
    let timestamp: number | undefined;
    for (const key of ['creation_timestamp', 'timestamp', 'created_time', 'date', 'time']) {
      if (item[key]) {
        const timeValue = item[key];
        if (typeof timeValue === 'number') {
          timestamp = timeValue;
        } else if (typeof timeValue === 'string') {
          timestamp = new Date(timeValue).getTime();
        }
        break;
      }
    }
    
    // Only return post info if we have a media URI
    if (!mediaUri) {
      return null;
    }
    
    return {
      caption,
      mediaUri,
      timestamp,
      originalData: item
    };
  }

  /**
   * Find image files in the media directory
   */
  private findImageFiles(mediaDir: string): string[] {
    const imageFiles: string[] = [];
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.webp'];
    
    for (const filePath of Object.keys(this.extractedFiles)) {
      if (filePath.startsWith(mediaDir)) {
        const extension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
        if (imageExtensions.includes(extension)) {
          imageFiles.push(filePath);
        }
      }
    }
    
    return imageFiles;
  }

  /**
   * Match posts with images
   */
  private matchPostsWithImages(postsData: any[], imageFiles: string[]): any[] {
    const matchedPosts: any[] = [];
    
    // Create a mapping of filenames to full paths
    const imageMap: { [key: string]: string } = {};
    for (const imgPath of imageFiles) {
      const filename = imgPath.split('/').pop() || '';
      imageMap[filename] = imgPath;
    }
    
    // Try to match posts with images
    for (const post of postsData) {
      if (post.mediaUri) {
        // Try to match by URI
        const matchedImage = this.findImageByUri(post.mediaUri, imageMap);
        if (matchedImage) {
          matchedPosts.push({
            imagePath: matchedImage,
            caption: post.caption,
            timestamp: post.timestamp,
            originalData: post.originalData
          });
          continue;
        }
      }
      
      // Try to match by timestamp if available
      if (post.timestamp) {
        const matchedImage = this.findImageByTimestamp(post.timestamp, imageFiles);
        if (matchedImage) {
          matchedPosts.push({
            imagePath: matchedImage,
            caption: post.caption,
            timestamp: post.timestamp,
            originalData: post.originalData
          });
          continue;
        }
      }
    }
    
    // If no matches found, create posts for all available images
    if (matchedPosts.length === 0 && imageFiles.length > 0) {
      for (let i = 0; i < Math.min(imageFiles.length, 20); i++) { // Limit to 20 posts
        matchedPosts.push({
          imagePath: imageFiles[i],
          caption: `Instagram post ${i + 1}`,
          timestamp: Date.now() - (i * 86400000), // Spread timestamps over days
          originalData: {}
        });
      }
    }
    
    return matchedPosts;
  }

  /**
   * Find image by matching URI patterns
   */
  private findImageByUri(uri: string, imageMap: { [key: string]: string }): string | null {
    // Extract filename from URI
    const uriParts = uri.split('/');
    if (uriParts.length > 0) {
      const filename = uriParts[uriParts.length - 1];
      if (imageMap[filename]) {
        return imageMap[filename];
      }
    }
    
    // Try to match partial filenames
    for (const [imgFilename, imgPath] of Object.entries(imageMap)) {
      if (uriParts.some(part => part && imgFilename.includes(part))) {
        return imgPath;
      }
    }
    
    return null;
  }

  /**
   * Find image by timestamp (simplified implementation)
   */
  private findImageByTimestamp(timestamp: number, imageFiles: string[]): string | null {
    // This is a simplified implementation
    // In a real scenario, you'd need to parse image metadata for timestamps
    if (imageFiles.length > 0) {
      return imageFiles[0]; // Return first available image
    }
    return null;
  }

  /**
   * Create a data URL for an image file
   */
  private async createImageDataUrl(imagePath: string): Promise<string> {
    const fileContent = this.extractedFiles[imagePath];
    if (fileContent) {
      const blob = new Blob([fileContent]);
      return URL.createObjectURL(blob);
    }
    return '';
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    // Revoke all object URLs to free memory
    for (const [filePath, content] of Object.entries(this.extractedFiles)) {
      if (filePath.match(/\.(jpg|jpeg|png|bmp|webp)$/i)) {
        // Note: We can't revoke URLs we created since we don't store them
        // In a real implementation, you'd want to track and revoke them
      }
    }
    
    this.extractedFiles = {};
  }
}
