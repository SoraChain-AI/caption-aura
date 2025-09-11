import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Wand2, Copy, ThumbsUp, ThumbsDown, RefreshCw, Camera, TrendingUp, BarChart3, Zap, Target } from 'lucide-react';
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
  const [showTypewriter, setShowTypewriter] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

      {/* Benchmark Results Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <Card className="glass-card border-primary/20 bg-gradient-to-r from-primary/5 via-background to-ai-accent/5">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <BarChart3 className="w-6 h-6 text-primary" />
              Model Performance Benchmarks
            </CardTitle>
            <CardDescription className="text-base">
              Your trained model vs. Default Liquid AI Model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-primary">+24%</div>
                <div className="text-sm text-muted-foreground">Caption Relevance</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-ai-accent to-ai-accent/80 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-ai-accent">+31%</div>
                <div className="text-sm text-muted-foreground">Style Matching</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-success">+18%</div>
                <div className="text-sm text-muted-foreground">Engagement Score</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-ai-accent rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">+27%</div>
                <div className="text-sm text-muted-foreground">Personalization</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Image Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Upload Image
              </CardTitle>
              <CardDescription>
                Select an image for AI caption generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed border-primary/20 rounded-xl p-8 text-center hover:border-primary/40 transition-all duration-300 cursor-pointer bg-gradient-to-br from-primary/5 to-transparent"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {selectedImage ? (
                  <div className="space-y-4">
                    <img 
                      src={selectedImage} 
                      alt="Selected" 
                      className="max-w-full max-h-48 mx-auto rounded-lg object-cover shadow-lg"
                    />
                    <p className="text-sm text-muted-foreground">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary/20 to-ai-accent/20 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">Upload Your Image</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Drag and drop or click to select
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={generateCaption}
                disabled={!selectedImage || isGenerating}
                className="w-full bg-gradient-ai hover:opacity-90 text-white font-medium py-3"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Captions...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Captions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Caption Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trained Model Results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <Wand2 className="w-4 h-4 text-white" />
                  </div>
                  Your Trained Model
                </CardTitle>
                <CardDescription>
                  Personalized captions crafted from your Instagram writing style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
        </div>
      </div>
    </div>
  );
}