import { useState, useRef, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Copy, FlipHorizontal2, Image, Loader2, RefreshCw, ThumbsDown, ThumbsUp, Upload, Video, VideoOff, Wand2, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error in Camera component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
          <p className="font-medium">Camera Error</p>
          <p className="text-sm">Failed to load camera. Please refresh the page and try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// TypewriterText component
const TypewriterText = ({ text, delay = 50 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, delay);

    return () => clearInterval(timer);
  }, [text, delay]);

  return <span>{displayText}</span>;
};

// Caption display component that handles typewriter effect
const CaptionDisplay = ({ caption, showTypewriter }: { caption: any; showTypewriter: boolean }) => {
  if (showTypewriter) {
    return (
      <div className="min-h-[120px] w-full p-4 rounded-lg border border-input bg-background/50 backdrop-blur-sm text-sm glass-card">
        <TypewriterText text={caption.text} />
      </div>
    );
  }
  
  return (
    <Textarea
      value={caption.text}
      readOnly
      className="min-h-[120px] resize-none glass-card bg-background/50 backdrop-blur-sm"
    />
  );
};

interface GeneratedCaption {
  id: string;
  text: string;
  timestamp: Date;
  rating?: 'up' | 'down';
  model: 'trained' | 'default';
}

const trainedModelCaptions = [
  "Another adventure with my favorite humans ✨ Always grateful for these spontaneous moments that remind me why life is so beautiful #blessed #adventures #gratitude",
  "Coffee dates and deep conversations ☕ Nothing beats those moments when time stops and you're exactly where you need to be #mindfulness #connection #peace",
  "Chasing sunsets and dreams tonight 🌅 Sometimes the most magical experiences happen when you follow your heart without a plan #dreaming #spontaneous #magic",
  "Weekend vibes: activated 💫 Ready to embrace whatever this beautiful day brings with open arms and endless curiosity #weekendmood #openheartopen mind #joy",
  "Creating memories, one laugh at a time ✨ These are the moments that make everything worth it, surrounded by love and laughter #precious #laughter #heart"
];

const defaultModelCaptions = [
  "Beautiful sunset captured in this moment. The golden light creates perfect atmosphere for photography. #sunset #photography #nature #beautiful",
  "Coffee time with friends at a cozy café. Enjoying good company and warm beverages on this lovely day. #coffee #friends #café #goodtimes", 
  "Exploring new places and discovering hidden gems. Travel opens our minds to different experiences and cultures. #travel #adventure #exploration #discovery",
  "Weekend relaxation mode activated. Taking time to unwind and recharge for the week ahead. #weekend #relaxation #selfcare #recharge",
  "Sharing moments of joy and happiness with loved ones. These connections make life meaningful and worthwhile. #joy #happiness #family #love"
];

export default function Inference() {
  const [cameraMode, setCameraMode] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [captions, setCaptions] = useState<GeneratedCaption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      // Stop any existing stream
      if (stream) {
        console.log('Stopping existing stream');
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped track:', track.kind);
        });
        setStream(null);
      }
      
      // Request camera access with more flexible constraints
      console.log('Requesting camera with constraints');
      
      let mediaStream;
      try {
        // First try with ideal constraints
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        console.log('Got media stream with ideal constraints');
      } catch (firstTryError) {
        console.log('First attempt failed, trying with minimal constraints');
        // If that fails, try with minimal constraints
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode }
          });
          console.log('Got media stream with minimal constraints');
        } catch (secondTryError) {
          console.error('Both constraint attempts failed');
          if (firstTryError.name === 'NotAllowedError') {
            throw new Error('Camera access was denied. Please allow camera access to use this feature.');
          } else if (firstTryError.name === 'NotFoundError' || firstTryError.name === 'DevicesNotFoundError') {
            throw new Error('No camera found. Please connect a camera and try again.');
          } else if (firstTryError.name === 'NotReadableError' || firstTryError.name === 'TrackStartError') {
            throw new Error('Camera is already in use by another application.');
          } else {
            throw new Error(`Camera error: ${firstTryError.message}`);
          }
        }
      }
      
      console.log('Got media stream with tracks:', mediaStream.getTracks().map(t => t.kind));
          throw new Error('No camera found. Please connect a camera and try again.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          throw new Error('Camera is already in use by another application.');
        } else {
          throw new Error(`Camera error: ${err.message}`);
        }
      }
      
      // Set the new stream
      setStream(mediaStream);
      
      // Update video element if it exists
      const video = videoRef.current;
      if (video) {
        console.log('Setting video srcObject');
        video.srcObject = mediaStream;
        
        // Play the video
        try {
          console.log('Attempting to play video');
          await video.play();
          console.log('Video play successful');
          setIsCameraActive(true);
        } catch (playErr) {
          console.error('Error playing video:', playErr);
          throw new Error('Failed to start camera preview.');
        }
      }
      
      return mediaStream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize camera';
      console.error('Camera initialization error:', errorMessage, err);
      
      // Stop any tracks that might have been created before the error
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      // Update UI state
      setIsCameraActive(false);
      setCameraMode(false);
      
      // Show error to user
      toast({
        title: 'Camera Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return null;
    }
  }, [facingMode, stream, toast]);

  // Toggle camera facing mode (front/back)
  const toggleCameraFacingMode = useCallback(async () => {
    if (!stream) return;
    
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    // Stop all tracks in the current stream
    stream.getTracks().forEach(track => track.stop());
    
    // Reinitialize camera with new facing mode
    await initializeCamera();
  }, [facingMode, initializeCamera, stream]);

  // Toggle between camera and upload modes
  const toggleCameraMode = useCallback(async () => {
    // If we're currently in camera mode, stop all tracks
    if (cameraMode && stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
    
    // Toggle the mode
    const newMode = !cameraMode;
    setCameraMode(newMode);
    
    // If switching to camera mode, initialize it
    if (newMode) {
      try {
        await initializeCamera();
      } catch (err) {
        console.error('Failed to initialize camera:', err);
        setCameraMode(false);
      }
    } else {
      // If switching to upload mode, clear the current image
      setImage(null);
    }
  }, [cameraMode, initializeCamera, stream]);

  // Capture image from camera
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL and set as image
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setImage(imageDataUrl);
    
    // Stop the video stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
    
    // Show success message
    toast({
      title: 'Photo captured!',
      description: 'Your photo has been captured successfully.',
    });
  }, [stream, toast]);

  // Handle image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
        setCameraMode(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle video element updates and stream attachment
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Set up event listeners
    const onloadedmetadata = () => {
      console.log('Video metadata loaded');
    };
    
    const onplay = () => {
      console.log('Video started playing');
      setIsCameraActive(true);
    };
    
    const onerror = (e: any) => {
      console.error('Video error:', e);
      setIsCameraActive(false);
    };
    
    video.addEventListener('loadedmetadata', onloadedmetadata);
    video.addEventListener('play', onplay);
    video.addEventListener('error', onerror);
    
    // Set the stream directly when it's available
    if (stream) {
      console.log('Stream available with', stream.getTracks().length, 'tracks');
      if (video.srcObject !== stream) {
        console.log('Setting video source to stream');
        video.srcObject = stream;
        
        // Log video element state after setting source
        setTimeout(() => {
          console.log('Video element state after stream set:', {
            readyState: video.readyState,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            srcObject: video.srcObject,
            error: video.error,
            seeking: video.seeking,
            paused: video.paused
          });
        }, 1000);
      }
    }
    
    // Clean up
    return () => {
      video.removeEventListener('loadedmetadata', onloadedmetadata);
      video.removeEventListener('play', onplay);
      video.removeEventListener('error', onerror);
    };
  }, [stream]);

  // Initialize camera when component mounts or when cameraMode changes
  useEffect(() => {
    let mounted = true;
    
    const initCamera = async () => {
      if (cameraMode) {
        try {
          await initializeCamera();
        } catch (err) {
          console.error('Failed to initialize camera:', err);
          if (mounted) {
            setCameraMode(false);
          }
        }
      }
    };
    
    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      initCamera();
    }, 100);
    
    // Clean up on unmount
    return () => {
      mounted = false;
      clearTimeout(timer);
      
      // Clean up any active streams
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraMode, initializeCamera, stream]);

  // Generate caption for the uploaded/captured image
  const generateCaption = useCallback(async () => {
    if (!image) return;
    
    setIsGenerating(true);
    setShowTypewriter(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a random caption for demo purposes
      const randomTrainedCaption = trainedModelCaptions[Math.floor(Math.random() * trainedModelCaptions.length)];
      const randomDefaultCaption = defaultModelCaptions[Math.floor(Math.random() * defaultModelCaptions.length)];
      
      const newCaptions: GeneratedCaption[] = [
        {
          id: `trained-${Date.now()}`,
          text: randomTrainedCaption,
          timestamp: new Date(),
          model: 'trained'
        },
        {
          id: `default-${Date.now()}`,
          text: randomDefaultCaption,
          timestamp: new Date(),
          model: 'default'
        }
      ];
      
      setCaptions(newCaptions);
      
      toast({
        title: 'Captions generated!',
        description: 'AI has generated captions for your image.',
      });
    } catch (error) {
      console.error('Error generating captions:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate captions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      
      // Auto-hide typewriter effect after a delay
      setTimeout(() => {
        setShowTypewriter(false);
      }, 5000);
    }
  }, [image, toast]);

  // Copy caption to clipboard
  const copyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: 'The caption has been copied to your clipboard.',
    });
  };

  // Rate a caption (thumbs up/down)
  const rateCaption = (id: string, rating: 'up' | 'down') => {
    setCaptions(prevCaptions =>
      prevCaptions.map(caption =>
        caption.id === id ? { ...caption, rating } : caption
      )
    );

    toast({
      title: rating === 'up' ? 'Thanks for the feedback!' : 'Feedback noted',
      description: 'Your rating helps improve our AI model.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <ErrorBoundary>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-ai bg-clip-text text-transparent"
            >
              AI Caption Generator
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-3xl mx-auto"
            >
              Experience the power of personalized AI. Upload an image and compare captions between your trained model and the default AI.
            </motion.p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Image Upload/Capture */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Image Input</CardTitle>
                  <CardDescription>
                    {cameraMode 
                      ? 'Position your subject and take a photo' 
                      : 'Upload an image or take a photo to generate a caption'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cameraMode ? (
                    <div className="space-y-4">
                      <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-black/5 border border-dashed border-border/50">
                        <video
                          ref={videoRef}
                          className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                          playsInline
                          muted
                          autoPlay
                        />
                        {!isCameraActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="text-center p-4 bg-black/50 text-white rounded-lg">
                              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                              <p>Initializing camera...</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          size="lg" 
                          className="flex-1 h-12"
                          onClick={captureImage}
                          disabled={!isCameraActive}
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Take Photo
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="flex-1 h-12"
                          onClick={toggleCameraMode}
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Upload Instead
                        </Button>
                      </div>
                      
                      <div className="flex justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={toggleCameraFacingMode}
                          className="gap-2"
                        >
                          <FlipHorizontal2 className="w-4 h-4" />
                          Switch Camera
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="relative aspect-[4/3] w-full rounded-xl bg-black/5 dark:bg-white/5 border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 transition-colors group"
                      >
                        {image ? (
                          <img 
                            src={image} 
                            alt="Uploaded preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="text-center space-y-1">
                              <p className="font-medium">Click to upload or drag and drop</p>
                              <p className="text-sm text-muted-foreground">
                                JPG, PNG, or WEBP (max. 5MB)
                              </p>
                            </div>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          size="lg" 
                          className="flex-1 h-12"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Image className="w-5 h-5 mr-2" />
                          {image ? 'Change Image' : 'Select Image'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="flex-1 h-12"
                          onClick={toggleCameraMode}
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Use Camera
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    size="lg" 
                    className="w-full h-12 mt-4" 
                    disabled={!image || isGenerating}
                    onClick={generateCaption}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Generate Caption
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Hidden canvas for image capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            {/* Right Column - Caption Results */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Caption Results</CardTitle>
                  <CardDescription>
                    Compare captions generated by different AI models
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {captions.length > 0 ? (
                    <div className="space-y-6">
                      {captions.map((caption) => (
                        <div key={caption.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                caption.model === 'trained' 
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {caption.model === 'trained' ? 'Your Model' : 'Default Model'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(caption.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={`h-8 w-8 ${caption.rating === 'up' ? 'text-green-600 hover:text-green-700' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => rateCaption(caption.id, 'up')}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={`h-8 w-8 ${caption.rating === 'down' ? 'text-red-600 hover:text-red-700' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => rateCaption(caption.id, 'down')}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => copyCaption(caption.text)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <CaptionDisplay caption={caption} showTypewriter={showTypewriter} />
                          
                          {caption.model === 'trained' && (
                            <div className="text-xs text-muted-foreground">
                              <p>Your custom model generates more personalized and engaging captions.</p>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-3">Model Performance</h4>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                { name: 'Your Model', Accuracy: 92, Engagement: 88, Speed: 85 },
                                { name: 'Default Model', Accuracy: 78, Engagement: 72, Speed: 90 },
                              ]}
                              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="Accuracy" fill="#8884d8" radius={[4, 4, 0, 0]} className="opacity-90 hover:opacity-100 transition-opacity" />
                              <Bar dataKey="Engagement" fill="#82ca9d" radius={[4, 4, 0, 0]} className="opacity-90 hover:opacity-100 transition-opacity" />
                              <Bar dataKey="Speed" fill="#ffc658" radius={[4, 4, 0, 0]} className="opacity-90 hover:opacity-100 transition-opacity" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Wand2 className="w-10 h-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-1">No captions generated yet</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Upload an image or take a photo to generate AI-powered captions.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}
