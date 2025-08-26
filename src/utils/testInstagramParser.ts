/**
 * Test script for Instagram Data Parser
 * This demonstrates how the parser works with sample data
 */

import { InstagramDataParser } from './instagramDataParser';

// Sample Instagram data structure for testing
const createSampleInstagramData = () => {
  // Create a mock ZIP file structure
  const mockFiles: { [key: string]: ArrayBuffer } = {};
  
  // Sample metadata JSON
  const sampleMetadata = [
    {
      title: "Beautiful sunset vibes ✨",
      media: [
        {
          uri: "media/posts/post_1/IMG_001.jpg",
          creation_timestamp: Date.now() - 86400000
        }
      ]
    },
    {
      title: "Coffee and contemplation ☕",
      media: [
        {
          uri: "media/posts/post_2/IMG_002.jpg",
          creation_timestamp: Date.now() - 172800000
        }
      ]
    }
  ];
  
  // Add metadata files
  mockFiles['your_instagram_activity/media/posts_1.json'] = new TextEncoder().encode(JSON.stringify(sampleMetadata));
  
  // Add sample images (mock data)
  const mockImageData = new ArrayBuffer(1024); // 1KB mock image data
  mockFiles['media/posts/post_1/IMG_001.jpg'] = mockImageData;
  mockFiles['media/posts/post_2/IMG_002.jpg'] = mockImageData;
  
  return mockFiles;
};

/**
 * Test the Instagram data parser
 */
export const testInstagramParser = async () => {
  console.log('🧪 Testing Instagram Data Parser...');
  
  try {
    // Create a mock File object (this would normally come from file upload)
    const mockZipFile = new File(['mock zip content'], 'instagram_data.zip', { type: 'application/zip' });
    
    // Create parser instance
    const parser = new InstagramDataParser();
    
    // Mock the extracted files (in real usage, this would come from ZIP extraction)
    (parser as any).extractedFiles = createSampleInstagramData();
    
    // Parse the data
    const result = await parser.parseInstagramData(mockZipFile);
    
    console.log('✅ Parsing successful!');
    console.log('📊 Results:', {
      totalPosts: result.totalPosts,
      totalImages: result.totalImages,
      metadataFiles: result.metadataFiles,
      posts: result.posts.map(p => ({
        id: p.id,
        caption: p.caption,
        hasImage: !!p.image
      }))
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Parsing failed:', error);
    throw error;
  }
};

/**
 * Test with different Instagram data structures
 */
export const testDifferentDataStructures = () => {
  console.log('🔍 Testing different Instagram data structures...');
  
  // Test 1: Array structure
  const arrayStructure = [
    {
      title: "Post 1",
      media_uri: "media/posts/post1.jpg",
      timestamp: Date.now()
    }
  ];
  
  // Test 2: Object with nested media
  const objectStructure = {
    media: [
      {
        title: "Post 2",
        uri: "media/posts/post2.jpg",
        created_time: Date.now()
      }
    ]
  };
  
  // Test 3: Single post structure
  const singlePostStructure = {
    title: "Single Post",
    file_path: "media/posts/single.jpg",
    date: new Date().toISOString()
  };
  
  console.log('📋 Test structures created successfully');
  console.log('Array structure:', arrayStructure);
  console.log('Object structure:', objectStructure);
  console.log('Single post structure:', singlePostStructure);
};

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).testInstagramParser = testInstagramParser;
  (window as any).testDifferentDataStructures = testDifferentDataStructures;
}
