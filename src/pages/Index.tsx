// CaptionCraft - AI-Powered Instagram Caption Generator
// Redesigned with Federated Learning via Sora Engine and 3D Designer Carousel

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Wand2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThreeDPhotoCarousel } from '@/components/ui/3d-carousel';
import TrainModel from '@/components/TrainModel';
import Inference from '@/components/Inference';
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
                <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-gradient leading-tight tracking-tight">
                  Personalized AI Caption Generator — Powered by Federated Learning
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
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                  <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Train AI Model</CardTitle>
                    <CardDescription className="text-base">
                      Connect to Sora Engine and train your personalized caption model using your Instagram data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4" />
                        <span>Federated Learning</span>
                      </div>
                      <Button className="w-full bg-gradient-primary hover:opacity-90">
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
                  <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-ai rounded-full flex items-center justify-center">
                      <Wand2 className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Generate Captions</CardTitle>
                    <CardDescription className="text-base">
                      Use your trained model to generate personalized, engaging captions for new images
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4" />
                        <span>Real-time Generation</span>
                      </div>
                      <Button className="w-full bg-gradient-ai hover:opacity-90">
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
          }} className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="text-center space-y-2 glass-card p-6 rounded-lg">
                <h3 className="font-semibold text-lg">Personalized AI</h3>
                <p className="text-sm text-muted-foreground">
                  Your model learns from your unique style and voice
                </p>
              </div>
              <div className="text-center space-y-2 glass-card p-6 rounded-lg">
                <h3 className="font-semibold text-lg">Federated Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Privacy-first training with Sora Engine infrastructure
                </p>
              </div>
              <div className="text-center space-y-2 glass-card p-6 rounded-lg">
                <h3 className="font-semibold text-lg">Instant Generation</h3>
                <p className="text-sm text-muted-foreground">
                  Generate captions in seconds with Liquid AI LFM
                </p>
              </div>
            </motion.div>
          </div>;
    }
  };
  return <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-card mx-4 mt-4 rounded-2xl p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div onClick={() => setCurrentMode('home')} className="cursor-pointer" whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CaptionCraft
            </h1>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <Button variant={currentMode === 'train' ? 'default' : 'ghost'} onClick={() => setCurrentMode('train')} className={currentMode === 'train' ? 'bg-gradient-primary' : 'glass-card'}>
              <Brain className="w-4 h-4 mr-2" />
              Train
            </Button>
            <Button variant={currentMode === 'inference' ? 'default' : 'ghost'} onClick={() => setCurrentMode('inference')} className={currentMode === 'inference' ? 'bg-gradient-ai' : 'glass-card'}>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
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

      {/* Floating Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-float"></div>
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-gradient-ai rounded-full blur-3xl opacity-20 animate-float" style={{
      animationDelay: '2s'
    }}></div>
    </div>;
};
export default Index;