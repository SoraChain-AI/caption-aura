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
  const [captions, setCaptions] = useState<GeneratedCaption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(true);
  
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
  
  // Handle camera capture
  const captureImage = useCallback(() => {
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
    
    // Convert canvas to data URL and set as image
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setImage(imageDataUrl);
    
    // Stop camera after capturing
    setCameraMode(false);
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
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // Generate captions for the image
  const generateCaptions = useCallback(async () => {
    if (!image) return;
    
    setIsGenerating(true);
    setShowTypewriter(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, use sample captions
      setCaptions(sampleCaptions);
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
  }, [image, toast]);
  
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
        {/* Left side - Camera/Image Upload */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload or Capture Image</CardTitle>
              <CardDescription>
                {cameraMode 
                  ? 'Position your camera and capture an image' 
                  : 'Upload an image or use your camera'}
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
                      onClick={captureImage}
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
              ) : image ? (
                <div className="relative">
                  <img 
                    src={image} 
                    alt="Captured" 
                    className="w-full h-auto rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => setImage(null)}
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
              
              {!cameraMode && !image && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={toggleCameraMode}
                  disabled={isCameraInitializing}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Use Camera
                </Button>
              )}
              
              {image && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setImage(null)}
                  >
                    Remove Image
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={toggleCameraMode}
                    disabled={isCameraInitializing}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Retake Photo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {image && (
            <Button 
              className="w-full"
              onClick={generateCaptions}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Captions...
                </>
              ) : (
                'Generate Captions'
              )}
            </Button>
          )}
        </div>
        
        {/* Right side - Captions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Captions</CardTitle>
              <CardDescription>
                {captions.length > 0 
                  ? 'Here are the generated captions for your image'
                  : 'Upload or capture an image to generate captions'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {captions.length > 0 ? (
                <div className="space-y-4">
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
                    {image 
                      ? 'Click "Generate Captions" to create captions for your image'
                      : 'No image selected. Upload or capture an image to generate captions.'}
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
                {captions.length} captions generated
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
