# Instagram Data Parser Utility

This utility parses Instagram data exports (ZIP files) and extracts images with their associated captions for training AI caption models.

## Features

- 🔍 **ZIP Extraction**: Automatically extracts Instagram data export ZIP files
- 📄 **Metadata Parsing**: Parses JSON metadata files to extract post information
- 🖼️ **Image Matching**: Matches images with their captions using URI patterns
- 📊 **Data Validation**: Validates data structure and provides detailed feedback
- 🧹 **Memory Management**: Efficient memory usage with cleanup capabilities

## Usage

### Basic Usage

```typescript
import { InstagramDataParser } from '@/utils/instagramDataParser';

const parser = new InstagramDataParser();

try {
  const result = await parser.parseInstagramData(zipFile);
  console.log(`Found ${result.totalPosts} posts with ${result.totalImages} images`);
  
  // Access parsed posts
  result.posts.forEach(post => {
    console.log(`Post ${post.id}: ${post.caption}`);
    // post.image contains the data URL for the image
  });
  
} catch (error) {
  console.error('Failed to parse Instagram data:', error);
}
```

### Integration with React Component

```typescript
import { useState } from 'react';
import { InstagramDataParser, InstagramPost } from '@/utils/instagramDataParser';

function InstagramUploader() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const parser = new InstagramDataParser();
      const result = await parser.parseInstagramData(file);
      setPosts(result.posts);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        accept=".zip" 
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      />
      
      <div className="grid grid-cols-3 gap-4">
        {posts.map(post => (
          <div key={post.id} className="border rounded-lg p-4">
            <img src={post.image} alt={post.caption} className="w-full h-32 object-cover" />
            <p className="mt-2 text-sm">{post.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Data Structure

### Expected ZIP Structure

```
instagram_export.zip
├── media/
│   └── posts/
│       ├── post_1/
│       │   └── IMG_001.jpg
│       └── post_2/
│           └── IMG_002.jpg
└── your_instagram_activity/
    └── media/
        ├── posts_1.json
        ├── posts.json
        └── media.json
```

### Metadata File Formats

The parser supports multiple JSON structures:

#### Array Structure
```json
[
  {
    "title": "Post caption",
    "media": [
      {
        "uri": "media/posts/post_1/IMG_001.jpg",
        "creation_timestamp": 1234567890
      }
    ]
  }
]
```

#### Object with Nested Media
```json
{
  "media": [
    {
      "title": "Post caption",
      "uri": "media/posts/post_1/IMG_001.jpg",
      "created_time": 1234567890
    }
  ]
}
```

#### Single Post
```json
{
  "title": "Post caption",
  "file_path": "media/posts/post_1/IMG_001.jpg",
  "date": "2024-01-01T00:00:00Z"
}
```

## API Reference

### InstagramDataParser

#### Methods

- `parseInstagramData(zipFile: File): Promise<ParsedInstagramData>`
  - Parses Instagram data from a ZIP file
  - Returns structured data with posts and metadata

- `cleanup(): void`
  - Cleans up resources and frees memory
  - Call this when done with the parser

#### Returns

```typescript
interface ParsedInstagramData {
  posts: InstagramPost[];           // Array of parsed posts
  totalPosts: number;               // Total number of posts found
  totalImages: number;              // Total number of images found
  metadataFiles: string[];          // Names of parsed metadata files
  extractedFiles: { [key: string]: ArrayBuffer }; // Raw extracted files
}

interface InstagramPost {
  id: string;                       // Unique post identifier
  image: string;                    // Data URL for the image
  caption: string;                  // Post caption/text
  timestamp?: number;               // Post timestamp (if available)
  selected: boolean;                // Selection state for UI
  originalData?: any;               // Original metadata
}
```

## Error Handling

The parser provides detailed error messages for common issues:

- **Missing directories**: When required folders aren't found
- **Invalid metadata**: When JSON files can't be parsed
- **No images found**: When no image files are located
- **ZIP extraction failed**: When the ZIP file is corrupted

## Testing

Use the included test utilities to verify functionality:

```typescript
import { testInstagramParser, testDifferentDataStructures } from '@/utils/testInstagramParser';

// Test the parser with sample data
await testInstagramParser();

// Test different data structures
testDifferentDataStructures();
```

## Browser Compatibility

- ✅ Modern browsers (Chrome 80+, Firefox 75+, Safari 13+)
- ✅ Supports File API and ArrayBuffer
- ✅ Uses JSZip for ZIP extraction
- ✅ Creates object URLs for image display

## Performance Considerations

- **Memory Usage**: Large ZIP files are stored in memory
- **Image Processing**: Images are converted to object URLs
- **Cleanup**: Always call `cleanup()` to free resources
- **Batch Processing**: Consider processing large datasets in chunks

## Troubleshooting

### Common Issues

1. **"Could not find required directories"**
   - Ensure your ZIP contains `media/` and `your_instagram_activity/` folders

2. **"No posts found"**
   - Check that metadata files contain valid JSON
   - Verify image files are in supported formats (jpg, png, etc.)

3. **"Failed to parse Instagram data"**
   - Validate ZIP file integrity
   - Check browser console for detailed error messages

### Debug Mode

Enable detailed logging:

```typescript
// In browser console
localStorage.setItem('debug', 'instagram-parser');

// Or set environment variable
process.env.DEBUG = 'instagram-parser';
```

## Contributing

When extending the parser:

1. Follow the existing code structure
2. Add comprehensive error handling
3. Include unit tests for new features
4. Update this documentation
5. Consider memory usage implications
