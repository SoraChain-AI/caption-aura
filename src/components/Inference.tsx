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
      
      console.log('Starting camera with facing mode:', facingMode);
      
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
          video.onloadedmetadata = () => {
            console.log('Video metadata loaded, playing...');
            video.play().catch(e => console.error('Video play error:', e));
          };
          setIsCameraActive(true);
          console.log('Camera started successfully');
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
            video.onloadedmetadata = () => {
              console.log('Video metadata loaded (fallback), playing...');
              video.play().catch(e => console.error('Video play error (fallback):', e));
            };
            setIsCameraActive(true);
            console.log('Camera started successfully with fallback');
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
    <main className="relative min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(59,130,246,0.15),transparent),radial-gradient(900px_500px_at_80%_100%,rgba(168,85,247,0.12),transparent),radial-gradient(800px_400px_at_10%_80%,rgba(20,184,166,0.12),transparent)] text-foreground">
      {/* Aurora Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-3xl bg-gradient-to-tr from-teal-500/20 via-cyan-500/10 to-purple-500/20" />
        <div className="absolute right-10 bottom-0 h-72 w-72 rounded-full blur-2xl bg-teal-500/20" />
        <div className="absolute left-10 top-1/3 h-60 w-60 rounded-full blur-2xl bg-purple-500/20" />
      </div>

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden">
        <div className="container mx-auto max-w-5xl px-6 pt-20 pb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-balance text-3xl font-bold tracking-tight md:text-5xl text-center"
          >
            Federated Learning + Live Context = Hyper-Personalization
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground text-center mx-auto"
          >
            Your captions shouldn't just describe the photo. They should capture the entire moment — in your voice.
          </motion.p>
        </div>
      </section>

      {/* How It Works Process */}
      <section className="relative border-t border-white/10">
        <div className="container mx-auto max-w-6xl px-6 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-semibold md:text-3xl text-center mb-10"
          >
            Generate Your Perfect Caption
          </motion.h2>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left side - Step-by-step Process */}
            <div className="space-y-6">
              {/* Step 1: Upload Subject Image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`relative overflow-hidden rounded-xl border ${
                  currentStep === 'upload' 
                    ? 'border-teal-400/40 bg-gradient-to-br from-teal-500/10 via-transparent to-purple-500/10' 
                    : 'border-white/10 bg-white/[0.03]'
                } p-6 backdrop-blur`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    image ? 'bg-teal-500 text-white' : 
                    currentStep === 'upload' ? 'bg-teal-500/20 text-teal-300' : 'bg-white/10 text-white/60'
                  }`}>
                    1
                  </span>
                  <h3 className="text-lg font-semibold">Upload Subject Image</h3>
                  {currentStep === 'upload' && <span className="text-xs text-teal-300">→ Active</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload the main subject or image you want to create captions for
                </p>

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
                    className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:bg-white/5 transition-colors"
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
              </motion.div>

              {/* Step 2: Capture Environment */}
              {image && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className={`relative overflow-hidden rounded-xl border ${
                    currentStep === 'environment' 
                      ? 'border-teal-400/40 bg-gradient-to-br from-teal-500/10 via-transparent to-purple-500/10' 
                      : 'border-white/10 bg-white/[0.03]'
                  } p-6 backdrop-blur`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      environmentImage ? 'bg-teal-500 text-white' : 
                      currentStep === 'environment' ? 'bg-teal-500/20 text-teal-300' : 'bg-white/10 text-white/60'
                    }`}>
                      2
                    </span>
                    <h3 className="text-lg font-semibold">Live Context Capture</h3>
                    {currentStep === 'environment' && <span className="text-xs text-teal-300">→ Active</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Capture your environment to add personalized context
                  </p>

                  {cameraMode ? (
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden min-h-[300px]">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                        webkit-playsinline="true"
                        style={{ 
                          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                          backgroundColor: '#000'
                        }}
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
                          className="h-14 w-14 rounded-full bg-gradient-to-r from-teal-500 to-purple-500"
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
                        className="w-full border-teal-500/30 text-teal-300 hover:bg-teal-500/10"
                        onClick={toggleCameraMode}
                        disabled={isCameraInitializing}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capture Live Context
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full text-white/70 hover:bg-white/5"
                        onClick={skipEnvironment}
                      >
                        Skip Context Capture
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Complete step 1 first</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Generate Captions */}
              {image && currentStep === 'generate' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="relative overflow-hidden rounded-xl border border-teal-400/40 bg-gradient-to-br from-teal-500/10 via-transparent to-purple-500/10 p-6 backdrop-blur"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-teal-500/20 text-teal-300">
                      3
                    </span>
                    <h3 className="text-lg font-semibold">Generate Personalized Captions</h3>
                    <span className="text-xs text-teal-300">→ Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {environmentImage 
                      ? "Using federated learning to create personalized captions with live context"
                      : "Generating base captions using your trained model"
                    }
                  </p>

                  <Button 
                    onClick={generateCaptions}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Captions'
                    )}
                  </Button>

                  {captions.length > 0 && (
                    <Button 
                      onClick={resetWorkflow}
                      variant="outline"
                      className="w-full mt-3 border-white/20 text-white/70 hover:bg-white/5"
                    >
                      Start Over
                    </Button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right side - Generated Captions */}
            <div className="space-y-6">
              {/* Live Demo or Results */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-teal-400">✨</span>
                  {captions.length > 0 ? 'Generated Captions' : 'Live Caption Demo'}
                </h3>

                {captions.length > 0 ? (
                  <div className="space-y-4">
                    {captions.map((caption) => (
                      <motion.div
                        key={caption.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: parseInt(caption.id) * 0.1 }}
                        className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
                      >
                        <p className="text-sm mb-3 leading-relaxed">{caption.text}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {caption.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsDown className="h-3 w-3" />
                              {caption.dislikes}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => rateCaption(caption.id, 'up')}
                              disabled={caption.userRating === 'up'}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => rateCaption(caption.id, 'down')}
                              disabled={caption.userRating === 'down'}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => copyCaption(caption.text)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-xs text-teal-300">
                        Base caption vs Personalized
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      See how live context transforms generic captions into personalized ones
                    </p>
                    <div className="space-y-3">
                      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left">
                        <div className="text-xs text-white/50 mb-1">Base:</div>
                        <div className="text-sm">"Beautiful sunset at the beach 🌅"</div>
                      </div>
                      <div className="rounded-lg border border-teal-500/20 bg-gradient-to-r from-teal-500/5 to-purple-500/5 p-3 text-left">
                        <div className="text-xs text-teal-300 mb-1">+ Live Context:</div>
                        <div className="text-sm">"Perfect end to an amazing surf session! The golden hour lighting here at Malibu never gets old 🌅🏄‍♂️ #surflife #malibusunset"</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Federated Learning Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-purple-400">🔒</span>
                  Privacy-First Learning
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Your data trains models locally on your device. Only encrypted model updates are shared, never your personal photos or captions.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-white/[0.02] p-2">
                      <div className="text-xs text-teal-300">Local Training</div>
                      <div className="text-xs">On-device</div>
                    </div>
                    <div className="rounded-lg bg-white/[0.02] p-2">
                      <div className="text-xs text-purple-300">Federated Updates</div>
                      <div className="text-xs">Encrypted</div>
                    </div>
                    <div className="rounded-lg bg-white/[0.02] p-2">
                      <div className="text-xs text-cyan-300">Global Model</div>
                      <div className="text-xs">Improved</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
};

// TypewriterText component
const TypewriterText = ({ 
  text, 
  delay = 50, 
  className = "" 
}: { 
  text: string; 
  delay?: number; 
  className?: string; 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return <span className={className}>{displayText}</span>;
};

export default Inference;