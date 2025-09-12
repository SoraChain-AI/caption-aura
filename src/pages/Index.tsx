// CaptionCraft - AI-Powered Instagram Caption Generator
// Redesigned with Federated Learning via Sora Engine and 3D Designer Carousel

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Wand2, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThreeDPhotoCarousel } from '@/components/ui/3d-carousel';
import TrainModel from '@/components/TrainModel';
import Inference from '@/components/Inference';
import { Link } from 'react-router-dom';
type AppMode = 'home' | 'train' | 'inference';
const Index = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>('home');

  // Listen for custom event to switch to inference
  useEffect(() => {
    const handleSwitchToInference = () => setCurrentMode('inference');
    window.addEventListener('switchToInference', handleSwitchToInference);
    return () => window.removeEventListener('switchToInference', handleSwitchToInference);
  }, []);
  const renderContent = () => {
    switch (currentMode) {
      case 'train':
        return <TrainModel />;
      case 'inference':
        return <Inference />;
      default:
        return <div className="space-y-12">
            {/* Hero Section with 3D Carousel */}
            <div className="text-center space-y-8">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8
            }} className="space-y-6">
                <h1 className="text-4xl sm:text-6xl font-bold leading-tight tracking-tight mb-6">
                  <span className="text-primary font-extrabold">
                    Personalized InstaCaptions
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground font-medium">Powered by Federated Learning and Liquid AI</p>
              </motion.div>

              {/* 3D Designer Carousel */}
              <motion.div initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              duration: 1,
              delay: 0.3
            }} className="glass-card p-4 rounded-xl">
                <ThreeDPhotoCarousel />
              </motion.div>

              {/* Feature Description */}
              <motion.div initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              delay: 0.6
            }} className="max-w-4xl mx-auto">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Train your own AI model using your Instagram history, then generate 
                  captions that match your unique style and voice. Experience the future 
                  of personalized content creation.
                </p>
              </motion.div>
            </div>

            {/* Mode Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
              <motion.div initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.6,
              delay: 0.8
            }} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }}>
                <Card className="glass-card hover:glass-strong transition-all duration-300 cursor-pointer h-full" onClick={() => setCurrentMode('train')}>
                  <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-2xl">Train AI Model</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Connect to Sora Engine and train your personalized caption model using your Instagram data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center p-4 sm:p-6 pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Federated Learning</span>
                      </div>
                      <Button className="w-full bg-gradient-primary hover:opacity-90 text-sm sm:text-base py-2 sm:py-3">
                        Start Training
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.6,
              delay: 1
            }} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }}>
                <Card className="glass-card hover:glass-strong transition-all duration-300 cursor-pointer h-full" onClick={() => setCurrentMode('inference')}>
                  <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-ai rounded-full flex items-center justify-center">
                      <Wand2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-2xl">Generate Captions</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Use your trained model to generate personalized, engaging captions for new images
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center p-4 sm:p-6 pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Real-time Generation</span>
                      </div>
                      <Button className="w-full bg-gradient-ai hover:opacity-90 text-sm sm:text-base py-2 sm:py-3">
                        Start Generating
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Features Grid */}
            <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 1.2
          }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto px-4 sm:px-0">
              <div className="text-center space-y-2 glass-card p-4 sm:p-6 rounded-lg">
                <h3 className="font-semibold text-base sm:text-lg">Personalized AI</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your model learns from your unique style and voice
                </p>
              </div>
              <div className="text-center space-y-2 glass-card p-4 sm:p-6 rounded-lg">
                <h3 className="font-semibold text-base sm:text-lg">Federated Learning</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Privacy-first training with Sora Engine infrastructure
                </p>
              </div>
              <div className="text-center space-y-2 glass-card p-4 sm:p-6 rounded-lg sm:col-span-2 lg:col-span-1">
                <h3 className="font-semibold text-base sm:text-lg">Instant Generation</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Generate captions in seconds with Liquid AI LFM
                </p>
              </div>
            </motion.div>
          </div>;
    }
  };
  return <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-card mx-2 sm:mx-4 mt-2 sm:mt-4 rounded-2xl p-3 sm:p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div onClick={() => setCurrentMode('home')} className="cursor-pointer" whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <h1 className="text-lg sm:text-2xl font-bold text-primary">
              CaptionCraft
            </h1>
          </motion.div>
          
          <div className="flex items-center space-x-1 sm:space-x-4">
            <Link to="/how-it-works" className="hidden sm:block">
              <Button variant="ghost" className="glass-card">
                <BookOpen className="w-4 h-4 mr-2" />
                How it Works
              </Button>
            </Link>
            <Link to="/how-it-works" className="sm:hidden">
              <Button variant="ghost" size="sm" className="glass-card p-2">
                <BookOpen className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              variant={currentMode === 'train' ? 'default' : 'ghost'} 
              onClick={() => setCurrentMode('train')} 
              className={`${currentMode === 'train' ? 'bg-gradient-primary' : 'glass-card'} hidden sm:flex`}
            >
              <Brain className="w-4 h-4 mr-2" />
              Train
            </Button>
            <Button 
              variant={currentMode === 'train' ? 'default' : 'ghost'} 
              onClick={() => setCurrentMode('train')} 
              size="sm"
              className={`${currentMode === 'train' ? 'bg-gradient-primary' : 'glass-card'} sm:hidden p-2`}
            >
              <Brain className="w-4 h-4" />
            </Button>
            <Button 
              variant={currentMode === 'inference' ? 'default' : 'ghost'} 
              onClick={() => setCurrentMode('inference')} 
              className={`${currentMode === 'inference' ? 'bg-gradient-ai' : 'glass-card'} hidden sm:flex`}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate
            </Button>
            <Button 
              variant={currentMode === 'inference' ? 'default' : 'ghost'} 
              onClick={() => setCurrentMode('inference')} 
              size="sm"
              className={`${currentMode === 'inference' ? 'bg-gradient-ai' : 'glass-card'} sm:hidden p-2`}
            >
              <Wand2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-12">
        <AnimatePresence mode="wait">
          <motion.div key={currentMode} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} transition={{
          duration: 0.3
        }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Elements - Hidden on mobile for better performance */}
      <div className="hidden sm:block fixed top-20 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-float"></div>
      <div className="hidden sm:block fixed bottom-20 right-10 w-40 h-40 bg-gradient-ai rounded-full blur-3xl opacity-20 animate-float" style={{
      animationDelay: '2s'
    }}></div>
    </div>;
};
export default Index;