import { useState, useRef, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Copy, FlipHorizontal2, Image, Loader2, RefreshCw, ThumbsDown, ThumbsUp, Upload, Video, VideoOff, Wand2, Zap } from "lucide-react";

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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Separate TypewriterText component to avoid hooks violations
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<GeneratedCaption[]>([]);
  const [showTypewriter, setShowTypewriter] = useState(true);
  const [cameraMode, setCameraMode] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  // Model performance data
  const modelPerformance = [
    {
      name: 'Default Model',
      accuracy: 75,
      improvement: 0
    },
    {
      name: 'Your Model',
      accuracy: 92,
      improvement: 17
    }
  ];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize camera
  const initializeCamera = async () => {
    try {
      console.log('Initializing camera...');
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      console.log('Requesting camera with constraints:', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained:', mediaStream.id);
      
      // Set the stream to state
      setStream(mediaStream);
      
      // Set the stream to the video element
      if (videoRef.current) {
        console.log('Setting stream to video element');
        videoRef.current.srcObject = mediaStream;
        
        // Play the video
        try {
          await videoRef.current.play();
          console.log('Video is playing');
          setIsCameraActive(true);
        } catch (playError) {
          console.error('Error playing video:', playError);
          throw new Error('Could not play video stream');
        }
      }
      
      return mediaStream;
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: 'Camera Error',
        description: err instanceof Error ? err.message : 'Could not access the camera. Please check permissions and try again.',
        variant: 'destructive',
      });
      setCameraMode(false);
      throw err; // Re-throw to be caught by the caller
    }
  };

  // Toggle camera facing mode (front/back)
  const toggleCameraFacingMode = async () => {
    if (!stream) {
      console.log('No active stream to toggle');
      return;
    }
    
    try {
      console.log('Toggling camera facing mode');
      setIsCameraActive(false);
      
      // Store the current stream
      const currentStream = stream;
      
      // Toggle the facing mode
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      console.log('Switching to camera:', newFacingMode);
      setFacingMode(newFacingMode);
      
      // Stop the current stream
      currentStream.getTracks().forEach(track => track.stop());
      
      // Request new stream with updated facing mode
      try {
        await initializeCamera();
      } catch (err) {
        console.error('Failed to initialize camera after flip:', err);
        setCameraMode(false);
        throw err;
      }
      
    } catch (error) {
      console.error('Error switching camera:', error);
      toast({
        title: 'Camera Error',
        description: error instanceof Error ? error.message : 'Could not switch camera. Please try again.',
        variant: 'destructive',
      });
      setIsCameraActive(false);
    }
  };

  // Toggle between camera and upload modes
  const toggleCameraMode = async () => {
    try {
      const newCameraMode = !cameraMode;
      console.log('Toggling camera mode to:', newCameraMode);
      
      // Clean up existing stream if any
      if (stream) {
        console.log('Cleaning up existing camera stream');
        stream.getTracks().forEach(track => {
          console.log('Stopping track:', track.kind);
          track.stop();
        });
        setStream(null);
      }
      
      // Update the camera mode state
      setCameraMode(newCameraMode);
      setIsCameraActive(false);
      
      // If switching to camera mode, request camera access
      if (newCameraMode) {
        try {
          await initializeCamera();
        } catch (err) {
          console.error('Failed to initialize camera:', err);
          setCameraMode(false);
          return;
        }
      } else {
        setSelectedImage(null);
      }
      
      setShowTypewriter(false);
      setGeneratedCaptions([]);
    } catch (error) {
      console.error('Error toggling camera mode:', error);
      toast({
        title: 'Error',
        description: 'Could not access the camera. Please check permissions and try again.',
        variant: 'destructive',
      });
      setCameraMode(false);
    }
  };

  // Capture image from camera
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL and set as selected image
      const imageDataUrl = canvas.toDataURL('image/png');
      setSelectedImage(imageDataUrl);
      setShowTypewriter(false);
      setGeneratedCaptions([]);
    }
  }, []);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setShowTypewriter(false);
        setGeneratedCaptions([]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle video element updates and stream attachment
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Log video element state
    const logVideoState = () => {
      console.log('Video element state:', {
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        srcObject: video.srcObject,
        error: video.error,
        paused: video.paused,
        ended: video.ended,
        currentTime: video.currentTime
      });
    };

    // Set up event listeners
    video.onloadedmetadata = () => {
      console.log('Video metadata loaded');
      logVideoState();
      video.play().catch(e => console.error('Play error:', e));
    };

    video.onplay = () => {
      console.log('Video started playing');
      setIsCameraActive(true);
    };

    video.onerror = (e) => {
      console.error('Video error:', e, video.error);
      setIsCameraActive(false);
    };

    // Set the stream directly when it's available
    if (stream && video.srcObject !== stream) {
      console.log('Setting video source to stream');
      video.srcObject = stream;
      logVideoState();
    }

    return () => {
      // Clean up event listeners
      video.onloadedmetadata = null;
      video.onplay = null;
      video.onerror = null;
    };
  }, [stream]);

  // Handle video element updates and stream attachment
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // If we have a stream, set it to the video element
    if (stream) {
      console.log('Setting stream to video element');
      
      // Set the stream to the video element
      video.srcObject = stream;
      
      // Force a reflow to ensure the video element is in the DOM
      void video.offsetHeight;
      
      // Set up a simple play promise
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video playback started');
            setIsCameraActive(true);
          })
          .catch(error => {
            console.error('Error playing video:', error);
            // Try again after a short delay
            setTimeout(() => {
              video.play().catch(e => console.error('Retry play failed:', e));
            }, 100);
            setIsCameraActive(false);
          });
      }
      
      // Clean up function
      return () => {
        video.pause();
        video.srcObject = null;
      };
    }
  }, [stream]);
  
  // Initialize camera when cameraMode or facingMode changes
  useEffect(() => {
    let isMounted = true;
    
    const initCamera = async () => {
      if (cameraMode) {
        try {
          console.log('Initializing camera...');
          await initializeCamera();
        } catch (error) {
          console.error('Failed to initialize camera:', error);
          if (isMounted) {
            setCameraMode(false);
            toast({
              title: 'Camera Error',
              description: 'Failed to access the camera. Please check permissions and try again.',
              variant: 'destructive',
            });
          }
        }
      }
    };
    
    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      initCamera();
    }, 100);
    
    // Clean up on unmount or when dependencies change
    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      // Clean up any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraMode, facingMode]);

  const generateCaption = async () => {
    if (!selectedImage) return;

    setIsGenerating(true);
    setShowTypewriter(false);

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate both trained and default model captions
    const trainedCaption = trainedModelCaptions[Math.floor(Math.random() * trainedModelCaptions.length)];
    const defaultCaption = defaultModelCaptions[Math.floor(Math.random() * defaultModelCaptions.length)];
    
    const newCaptions: GeneratedCaption[] = [
      {
        id: Date.now().toString() + '-trained',
        text: trainedCaption,
        timestamp: new Date(),
        model: 'trained'
      },
      {
        id: Date.now().toString() + '-default',
        text: defaultCaption,
        timestamp: new Date(),
        model: 'default'
      }
    ];

    setShowTypewriter(true);
    setIsGenerating(false);
    setGeneratedCaptions(newCaptions);
  };

  const copyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Caption copied!",
      description: "Caption has been copied to your clipboard.",
    });
  };

  const rateCaption = (id: string, rating: 'up' | 'down') => {
    setGeneratedCaptions(prev => 
      prev.map(caption => 
        caption.id === id ? { ...caption, rating } : caption
      )
    );

    toast({
      title: rating === 'up' ? "Thanks for the feedback!" : "Feedback noted",
      description: "Your rating helps improve our AI model.",
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
        >
          <Card className="glass-card h-full">
            <CardHeader className="p-6 border-b border-border/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {cameraMode ? (
                      <Camera className="w-6 h-6 text-primary" />
                    ) : (
                      <Upload className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl">
                      {cameraMode ? 'Camera Capture' : 'Upload Image'}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      {cameraMode ? 'Take a photo or switch to upload' : 'Select an image for AI caption generation'}
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={toggleCameraMode}
                  className="gap-2 hidden sm:flex"
                >
                  {cameraMode ? (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Upload Instead</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5" />
                      <span>Use Camera</span>
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {cameraMode ? (
                <div className="max-w-4xl mx-auto p-4 md:p-6">
                  <ErrorBoundary>
                    <div className="grid gap-6">
                      <div className="relative aspect-[4/3] w-full rounded-xl bg-black/10 border-2 border-dashed border-border/50 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 w-full h-full">
                        {isCameraActive ? (
                          <>
                            <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
                              <div className="absolute inset-0 w-full h-full">
                                <video
                                  ref={videoRef}
                                  autoPlay
                                  playsInline
                                  muted
                                  className="absolute inset-0 w-full h-full object-cover"
                                  style={{
                                    transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)',
                                    backgroundColor: 'black',
                                    opacity: isCameraActive ? 1 : 0,
                                    transition: 'opacity 0.3s ease-in-out',
                                    width: '100%',
                                    height: '100%',
                                    display: 'block'
                                  }}
                                />
                                {!isCameraActive && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <div className="animate-pulse text-white/70 text-center">
                                      <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin" />
                                      <p>Initializing camera feed...</p>
                                    </div>
                                  </div>
                                )}
                            {!isCameraActive && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <div className="animate-pulse text-white/70 text-center">
                                  <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin" />
                                  <p>Initializing camera feed...</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={toggleCameraFacingMode}
                          className="absolute bottom-4 right-4 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10"
                          aria-label="Switch camera"
                        >
                          <FlipHorizontal2 className="w-6 h-6" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-6">
                        <VideoOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {stream ? 'Initializing camera...' : 'Click below to enable camera access'}
                        </p>
                      </div>
                    )}
                  </div>
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
                </div>
                </ErrorBoundary>
                </div>
              ) : (
                <div className="space-y-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative aspect-[4/3] w-full rounded-xl bg-black/5 dark:bg-white/5 border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 transition-colors group"
                  >
                    <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="text-center space-y-1">
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">JPG, PNG, or WebP (max. 5MB)</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {selectedImage && (
                      <div className="absolute inset-0">
                        <img 
                          src={selectedImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="flex-1 h-12"
                      onClick={toggleCameraMode}
                    >
                      <Video className="w-5 h-5 mr-2" />
                      Use Camera Instead
                    </Button>
                    {selectedImage && (
                      <Button 
                        size="lg" 
                        className="flex-1 h-12"
                        onClick={generateCaption}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5 mr-2" />
                            Generate Caption
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Caption Results */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
        {/* Trained Model Results */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  Your Trained Model
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Personalized captions crafted from your Instagram writing style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                {generatedCaptions.filter(c => c.model === 'trained').length > 0 ? (
                  <AnimatePresence>
                    {generatedCaptions.filter(c => c.model === 'trained').map((caption) => (
                      <motion.div
                        key={caption.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <CaptionDisplay caption={caption} showTypewriter={showTypewriter} />
                        
                        <div className="flex gap-3 justify-between">
                          <Button
                            variant="outline"
                            onClick={() => copyCaption(caption.text)}
                            className="glass-card hover:bg-primary/10"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Caption
                          </Button>
                          
                          <div className="flex gap-2">
                            <Button
                              variant={caption.rating === 'up' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => rateCaption(caption.id, 'up')}
                              className="glass-card"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={caption.rating === 'down' ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => rateCaption(caption.id, 'down')}
                              className="glass-card"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary/20 to-ai-accent/20 rounded-full flex items-center justify-center mb-4">
                      <Wand2 className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Upload an image to see your personalized caption
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Default Model Results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card border-ai-accent/30 bg-gradient-to-r from-ai-accent/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-ai-accent to-ai-accent/80 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  Default Liquid AI Model
                </CardTitle>
                <CardDescription>
                  Standard captions from the base AI model for comparison
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedCaptions.filter(c => c.model === 'default').length > 0 ? (
                  <AnimatePresence>
                    {generatedCaptions.filter(c => c.model === 'default').map((caption) => (
                      <motion.div
                        key={caption.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <Textarea
                          value={caption.text}
                          readOnly
                          className="min-h-[120px] resize-none glass-card bg-background/50 backdrop-blur-sm"
                        />
                        
                        <div className="flex gap-3 justify-between">
                          <Button
                            variant="outline"
                            onClick={() => copyCaption(caption.text)}
                            className="glass-card hover:bg-ai-accent/10"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Caption
                          </Button>
                          
                          <div className="flex gap-2">
                            <Button
                              variant={caption.rating === 'up' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => rateCaption(caption.id, 'up')}
                              className="glass-card"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={caption.rating === 'down' ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => rateCaption(caption.id, 'down')}
                              className="glass-card"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-ai-accent/20 to-primary/20 rounded-full flex items-center justify-center mb-4">
                      <Zap className="w-8 h-8 text-ai-accent" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Upload an image to see the default AI caption
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Regenerate Button */}
          {generatedCaptions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <Button
                variant="outline"
                onClick={generateCaption}
                disabled={isGenerating}
                className="glass-card hover:bg-primary/5 px-8 py-3"
                size="lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Regenerate Both Captions
              </Button>
            </motion.div>
          )}
          
          {/* Benchmark Results Section - Show after inference completes */}
          {generatedCaptions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8"
            >
              <Card className="glass-card border-primary/20 bg-gradient-to-r from-primary/5 via-background to-ai-accent/5">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <BarChart className="w-6 h-6 text-primary" />
                    Model Performance Benchmarks
                  </CardTitle>
                  <CardDescription className="text-base">
                    Your trained model vs. Default Liquid AI Model
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={modelPerformance}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <YAxis 
                          domain={[0, 100]}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          formatter={(value, name) => [`${value}%`, name === 'improvement' ? 'Improvement' : name]}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                          }}
                        />
                        <Legend 
                          verticalAlign="top"
                          height={36}
                          formatter={(value) => {
                            if (value === 'improvement') return 'Improvement';
                            return value;
                          }}
                        />
                        <Bar 
                          dataKey="Base Model" 
                          name="Base Model"
                          fill="#8884d8"
                          radius={[4, 4, 0, 0]}
                          className="opacity-90 hover:opacity-100 transition-opacity"
                        />
                        <Bar 
                          dataKey="Trained Model" 
                          name="Trained Model"
                          fill="#82ca9d"
                          radius={[4, 4, 0, 0]}
                          className="opacity-90 hover:opacity-100 transition-opacity"
                        />
                        <Bar 
                          dataKey="improvement" 
                          name="Improvement"
                          fill="#ffc658"
                          radius={[4, 4, 0, 0]}
                          className="opacity-90 hover:opacity-100 transition-opacity"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}