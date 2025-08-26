import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Server, FileText, Zap, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InstagramDataParser, InstagramPost, ParsedInstagramData } from '@/utils/instagramDataParser';

interface TrainingPost {
  id: string;
  image: string;
  caption: string;
  selected: boolean;
}

export default function TrainModel() {
  const [isConnected, setIsConnected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [posts, setPosts] = useState<TrainingPost[]>([]);
  const [parsedData, setParsedData] = useState<ParsedInstagramData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const parser = useRef<InstagramDataParser>(new InstagramDataParser());

  // Mock posts data for demonstration
  const mockPosts: TrainingPost[] = [
    { id: '1', image: 'https://picsum.photos/200/200?random=1', caption: 'Beautiful sunset vibes ✨ #golden #memories', selected: true },
    { id: '2', image: 'https://picsum.photos/200/200?random=2', caption: 'Coffee and contemplation ☕ #mindful #moments', selected: true },
    { id: '3', image: 'https://picsum.photos/200/200?random=3', caption: 'Adventure awaits around every corner 🌍 #explore #wanderlust', selected: false },
    { id: '4', image: 'https://picsum.photos/200/200?random=4', caption: 'Simple joys, profound happiness 💫 #grateful #lifestyle', selected: true },
    { id: '5', image: 'https://picsum.photos/200/200?random=5', caption: 'Creating magic in the everyday ✨ #creative #inspiration', selected: false },
    { id: '6', image: 'https://picsum.photos/200/200?random=6', caption: 'Weekend mood: activated 🌟 #relax #goodvibes', selected: true },
  ];

  const handleConnect = async () => {
    setIsConnected(true);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedFile(file);
    setError(null);
    
    try {
      // Parse the Instagram data
      const data = await parser.current.parseInstagramData(file);
      setParsedData(data);
      setPosts(data.posts);
      
      console.log('Parsed Instagram data:', data);
    } catch (err) {
      console.error('Error parsing Instagram data:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse Instagram data');
      setPosts([]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const togglePostSelection = (id: string) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, selected: !post.selected } : post
    ));
  };

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      if (parser.current) {
        parser.current.cleanup();
      }
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Train Your AI Model
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect to our Federated Learning infrastructure powered by Sora Engine to create your personalized caption generator.
        </p>
      </div>

      {/* Step 1: Connect to Sora Engine */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-ai-accent" />
            Connect to Federated Learning Server
          </CardTitle>
          <CardDescription>
            Establish secure connection to Sora Engine infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleConnect}
            disabled={isConnected}
            className="w-full bg-gradient-ai hover:opacity-90 transition-opacity"
          >
            {isConnected ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Connected to Sora Engine
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Connect to Sora Engine
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Upload Instagram Data */}
      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Instagram Data
                </CardTitle>
                <CardDescription>
                  Upload your Instagram data export (ZIP file) to train your personalized model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {isUploading ? (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p>Processing your Instagram data...</p>
                      <p className="text-xs text-muted-foreground">Extracting and parsing metadata...</p>
                    </motion.div>
                  ) : uploadedFile ? (
                    <div className="space-y-2">
                      <FileText className="w-8 h-8 text-primary mx-auto" />
                      <p className="text-sm font-medium">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {posts.length} posts extracted
                      </p>
                      {parsedData && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>📁 {parsedData.totalImages} images found</p>
                          <p>📄 {parsedData.metadataFiles.length} metadata files parsed</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm font-medium">Click to upload Instagram ZIP</p>
                      <p className="text-xs text-muted-foreground">
                        Drag and drop your Instagram data export here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Card className="glass-card border-red-200 bg-red-50/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <p className="font-medium">Error Processing File</p>
                    </div>
                    <p className="text-sm text-red-500 mt-2">{error}</p>
                    <p className="text-xs text-red-400 mt-1">
                      Please ensure you're uploading a valid Instagram data export ZIP file
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Post Selection & Training */}
      <AnimatePresence>
        {posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Select Training Data
                </CardTitle>
                <CardDescription>
                  Choose which posts to include in your training dataset
                </CardDescription>
                {parsedData && (
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>📊 {posts.length} posts available</span>
                    <span>🖼️ {parsedData.totalImages} total images</span>
                    <span>📁 {parsedData.metadataFiles.length} metadata files</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No posts found in the uploaded data</p>
                    <p className="text-sm">Please check that your Instagram export contains valid image and metadata files</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {posts.map((post) => (
                      <motion.div
                        key={post.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative cursor-pointer rounded-lg overflow-hidden ${
                          post.selected ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => togglePostSelection(post.id)}
                      >
                        <img 
                          src={post.image} 
                          alt={`Post ${post.id}`}
                          className="w-full aspect-square object-cover"
                          onError={(e) => {
                            // Fallback for broken images
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.image-fallback');
                            if (fallback) {
                              (fallback as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                        <div className="image-fallback absolute inset-0 bg-gray-100 flex items-center justify-center" style={{ display: 'none' }}>
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs text-center p-2">
                            {post.caption}
                          </p>
                        </div>
                        {post.selected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-5 h-5 text-primary bg-white rounded-full" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {posts.filter(p => p.selected).length} of {posts.length} posts selected
                  </p>
                  <Button 
                    onClick={handleStartTraining}
                    disabled={isTraining || posts.filter(p => p.selected).length === 0}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    {isTraining ? 'Training...' : 'Start Training'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Training Progress */}
            {isTraining && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-ai-accent animate-pulse" />
                      Training in Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={trainingProgress} className="w-full" />
                    <p className="text-sm text-center">
                      {Math.round(trainingProgress)}% complete
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Training Complete */}
            {trainingProgress === 100 && !isTraining && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="glass-card border-success">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <CheckCircle className="w-12 h-12 text-success mx-auto" />
                      <h3 className="text-lg font-semibold">Training Complete!</h3>
                      <p className="text-muted-foreground">
                        Your personalized AI model is ready to generate captions!
                      </p>
                      <Button 
                        onClick={() => {
                          // Navigate to inference mode - you'll need to pass this callback from parent
                          window.dispatchEvent(new CustomEvent('switchToInference'));
                        }}
                        className="bg-gradient-ai hover:opacity-90"
                      >
                        Start Generating Captions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}