import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Copy, FlipHorizontal2, Image, Loader2, ThumbsDown, ThumbsUp, Upload, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Types
interface GeneratedCaption {
  id: string;
  text: string;
  likes: number;
  dislikes: number;
  userRating?: 'up' | 'down';
}

// Sample data
const sampleCaptions = [
  {
    id: '1',
    text: 'Enjoying a beautiful sunset at the beach! 🌅 #beachvibes #sunsetlover',
    likes: 42,
    dislikes: 2,
  },
  {
    id: '2',
    text: 'Coffee and coding, the perfect combination! ☕️ #programming #developerlife',
    likes: 28,
    dislikes: 1,
  },
];

const Inference = () => {
  // Camera state
  const [cameraMode, setCameraMode] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraInitializing, setIsCameraInitializing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  // App state
  const [image, setImage] = useState<string | null>(null);
  const [environmentImage, setEnvironmentImage] = useState<string | null>(null);
  const [captions, setCaptions] = useState<GeneratedCaption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(true);
  const [currentStep, setCurrentStep] = useState<'upload' | 'environment' | 'generate'>('upload');
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Hooks
  const { toast } = useToast();
  
  // Stop camera and clean up resources
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraInitializing(false);
  }, []);

  // Initialize camera with proper error handling
  const startCamera = useCallback(async () => {
    if (isCameraInitializing) return;
    
    try {
      setIsCameraInitializing(true);
      
      // Stop any existing stream first
      stopCamera();
      
      // Try with ideal constraints first
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      try {
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = newStream;
        
        const video = videoRef.current;
        if (video) {
          video.srcObject = newStream;
          await video.play();
          setIsCameraActive(true);
        }
      } catch (error) {
        console.error('Error with ideal constraints, trying basic constraints:', error);
        
        // Fallback to basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode } 
          });
          
          streamRef.current = basicStream;
          const video = videoRef.current;
          if (video) {
            video.srcObject = basicStream;
            await video.play();
            setIsCameraActive(true);
          }
        } catch (fallbackError) {
          console.error('Failed to initialize camera:', fallbackError);
          throw fallbackError;
        }
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
      toast({
        title: 'Camera Error',
        description: 'Could not access the camera. Please check permissions and try again.',
        variant: 'destructive'
      });
      setCameraMode(false);
    } finally {
      setIsCameraInitializing(false);
    }
  }, [facingMode, isCameraInitializing, stopCamera, toast]);
  
  // Toggle camera mode (on/off)
  const toggleCameraMode = useCallback(() => {
    setCameraMode(prev => !prev);
    setImage(null);
  }, []);
  
  // Toggle between front and back camera
  const toggleCameraFacingMode = useCallback(() => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  }, []);
  
  // Handle camera capture for environment
  const captureEnvironment = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL and set as environment image
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setEnvironmentImage(imageDataUrl);
    
    // Stop camera after capturing and move to generate step
    setCameraMode(false);
    setCurrentStep('generate');
  }, []);
  
  // Handle file upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
        setCameraMode(false);
        setCurrentStep('environment');
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // Generate captions for both images
  const generateCaptions = useCallback(async () => {
    if (!image) return;
    
    setIsGenerating(true);
    setShowTypewriter(true);
    
    try {
      // Simulate API call with timeout - in real implementation, send both images
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Enhanced captions that reference both subject and environment
      const enhancedCaptions = [
        {
          id: '1',
          text: `Perfect moment captured! ${environmentImage ? 'The ambient lighting and surroundings really complement the main subject. ' : ''}✨ #photography #lifestyle`,
          likes: 45,
          dislikes: 1,
        },
        {
          id: '2', 
          text: `${environmentImage ? 'Love how the environment adds context to this shot! ' : ''}Amazing composition and great vibes 📸 #photooftheday`,
          likes: 32,
          dislikes: 0,
        },
        {
          id: '3',
          text: `${environmentImage ? 'The setting perfectly frames the main subject. ' : ''}Incredible capture! 🔥 #artistic #creative`,
          likes: 28,
          dislikes: 2,
        }
      ];
      
      setCaptions(enhancedCaptions);
    } catch (error) {
      console.error('Error generating captions:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate captions. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [image, environmentImage, toast]);

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    setImage(null);
    setEnvironmentImage(null);
    setCaptions([]);
    setCurrentStep('upload');
    setCameraMode(false);
  }, []);

  // Skip environment capture
  const skipEnvironment = useCallback(() => {
    setCurrentStep('generate');
  }, []);
  
  // Copy caption to clipboard
  const copyCaption = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Caption copied to clipboard.',
    });
  }, [toast]);
  
  // Rate a caption
  const rateCaption = useCallback((id: string, rating: 'up' | 'down') => {
    setCaptions(prevCaptions => 
      prevCaptions.map(caption => 
        caption.id === id 
          ? { 
              ...caption, 
              likes: rating === 'up' ? caption.likes + 1 : caption.likes,
              dislikes: rating === 'down' ? caption.dislikes + 1 : caption.dislikes,
              userRating: rating
            } 
          : caption
      )
    );
  }, []);
  
  // Effect to handle camera mode changes
  useEffect(() => {
    if (cameraMode) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [cameraMode, startCamera, stopCamera]);
  
  // Effect to handle facing mode changes
  useEffect(() => {
    if (cameraMode) {
      startCamera();
    }
  }, [facingMode, cameraMode, startCamera]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Step-by-step Image Collection */}
        <div className="space-y-4">
          {/* Step 1: Upload Subject Image */}
          <Card className={currentStep === 'upload' ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                  image ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  1
                </span>
                Upload Subject Image
              </CardTitle>
              <CardDescription>
                Upload the main subject or image you want to create captions for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {image ? (
                <div className="relative">
                  <img 
                    src={image} 
                    alt="Subject" 
                    className="w-full h-auto rounded-lg max-h-64 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => {
                      setImage(null);
                      setCurrentStep('upload');
                      setEnvironmentImage(null);
                      setCaptions([]);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG, or WebP (max. 5MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Capture Environment */}
          {image && (
            <Card className={currentStep === 'environment' ? 'ring-2 ring-primary' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    environmentImage ? 'bg-primary text-primary-foreground' : 
                    currentStep === 'environment' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    2
                  </span>
                  Capture Environment (Optional)
                </CardTitle>
                <CardDescription>
                  Capture your current environment to add personalized context to your captions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cameraMode ? (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    {isCameraInitializing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <Button 
                        variant="secondary" 
                        size="icon"
                        onClick={toggleCameraFacingMode}
                        disabled={isCameraInitializing}
                      >
                        <FlipHorizontal2 className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="default" 
                        size="icon"
                        className="h-14 w-14 rounded-full"
                        onClick={captureEnvironment}
                        disabled={!isCameraActive || isCameraInitializing}
                      >
                        <Camera className="h-6 w-6" />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon"
                        onClick={toggleCameraMode}
                        disabled={isCameraInitializing}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ) : environmentImage ? (
                  <div className="relative">
                    <img 
                      src={environmentImage} 
                      alt="Environment" 
                      className="w-full h-auto rounded-lg max-h-64 object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => {
                        setEnvironmentImage(null);
                        setCurrentStep('environment');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : currentStep === 'environment' ? (
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={toggleCameraMode}
                      disabled={isCameraInitializing}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Environment
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={skipEnvironment}
                    >
                      Skip Environment Capture
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Complete step 1 first</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Generate Captions */}
          {image && currentStep === 'generate' && (
            <Card className="ring-2 ring-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                    3
                  </span>
                  Generate Personalized Captions
                </CardTitle>
                <CardDescription>
                  {environmentImage 
                    ? 'Generate captions using both your subject and environment for maximum personalization'
                    : 'Generate captions for your subject image'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button 
                    className="flex-1"
                    onClick={generateCaptions}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Personalized Captions...
                      </>
                    ) : (
                      `Generate ${environmentImage ? 'Personalized ' : ''}Captions`
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={resetWorkflow}
                  >
                    Start Over
                  </Button>
                </div>
                
                {/* Preview both images */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Subject</p>
                    <img 
                      src={image} 
                      alt="Subject" 
                      className="w-full h-24 object-cover rounded border"
                    />
                  </div>
                  {environmentImage && (
                    <div>
                      <p className="text-sm font-medium mb-2">Environment</p>
                      <img 
                        src={environmentImage} 
                        alt="Environment" 
                        className="w-full h-24 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right side - Captions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Captions</CardTitle>
              <CardDescription>
                {captions.length > 0 
                  ? `Personalized captions ${environmentImage ? 'using both subject and environment context' : 'for your image'}`
                  : 'Follow the steps on the left to generate personalized captions'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {captions.length > 0 ? (
                <div className="space-y-4">
                  {environmentImage && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-primary mb-1">✨ Personalized Captions</p>
                      <p className="text-xs text-muted-foreground">
                        These captions were generated using both your subject image and environmental context for maximum personalization.
                      </p>
                    </div>
                  )}
                  {captions.map((caption) => (
                    <div key={caption.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <p className="text-sm">
                          {showTypewriter ? (
                            <TypewriterText text={caption.text} />
                          ) : (
                            caption.text
                          )}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => copyCaption(caption.text)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-8 px-2 ${caption.userRating === 'up' ? 'text-green-500' : ''}`}
                            onClick={() => rateCaption(caption.id, 'up')}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {caption.likes}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-8 px-2 ${caption.userRating === 'down' ? 'text-red-500' : ''}`}
                            onClick={() => rateCaption(caption.id, 'down')}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            {caption.dislikes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {!image 
                      ? 'Start by uploading a subject image in step 1'
                      : currentStep === 'environment'
                      ? 'Optionally capture your environment in step 2, then generate captions'
                      : currentStep === 'generate'
                      ? 'Click "Generate Captions" to create personalized captions'
                      : 'Follow the steps to generate captions'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {captions.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowTypewriter(!showTypewriter)}
                >
                  {showTypewriter ? 'Show Full Text' : 'Show Typewriter Effect'}
                </Button>
              </div>
              <div className="text-xs">
                {captions.length} {environmentImage ? 'personalized ' : ''}captions generated
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

// Typewriter effect component
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

export default Inference;
