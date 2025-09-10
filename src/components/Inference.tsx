import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Wand2, Copy, ThumbsUp, ThumbsDown, RefreshCw, History, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

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
  const [currentCaption, setCurrentCaption] = useState<string>('');
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [captionHistory, setCaptionHistory] = useState<GeneratedCaption[]>([]);
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

    setCurrentCaption(trainedCaption);
    setShowTypewriter(true);
    setIsGenerating(false);

    setGeneratedCaptions(newCaptions);
    setCaptionHistory(prev => [...newCaptions, ...prev.slice(0, 8)]); // Keep last 10
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
    setCaptionHistory(prev => 
      prev.map(caption => 
        caption.id === id ? { ...caption, rating } : caption
      )
    );

    toast({
      title: rating === 'up' ? "Thanks for the feedback!" : "Feedback noted",
      description: "Your rating helps improve our AI model.",
    });
  };

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

    return displayText;
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-ai bg-clip-text text-transparent">
          Generate Captions
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload an image and let your trained AI model generate personalized, engaging captions.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Upload Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Upload Image
            </CardTitle>
            <CardDescription>
              Select an image for caption generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
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
                    className="max-w-full max-h-64 mx-auto rounded-lg object-cover"
                  />
                  <p className="text-sm text-muted-foreground">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm font-medium">Click to upload image</p>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop or click to select
                  </p>
                </div>
              )}
            </div>

            <Button 
              onClick={generateCaption}
              disabled={!selectedImage || isGenerating}
              className="w-full bg-gradient-ai hover:opacity-90"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Caption
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Caption Results */}
        <div className="lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Trained Model Results */}
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Wand2 className="w-5 h-5" />
                  Your Trained Model
                </CardTitle>
                <CardDescription>
                  Personalized captions based on your Instagram style
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
                        <Textarea
                          value={showTypewriter ? TypewriterText({ text: caption.text }) : caption.text}
                          readOnly
                          className="min-h-[120px] resize-none glass-card"
                        />
                        
                        <div className="flex gap-2 justify-between">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyCaption(caption.text)}
                              className="glass-card"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          
                          <div className="flex gap-1">
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
                  <div className="text-center py-12">
                    <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Upload an image to see your personalized caption
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Default Model Results */}
            <Card className="glass-card border-ai-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ai-accent">
                  <Wand2 className="w-5 h-5" />
                  Default Liquid AI Model
                </CardTitle>
                <CardDescription>
                  Standard captions from the base AI model
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
                          className="min-h-[120px] resize-none glass-card"
                        />
                        
                        <div className="flex gap-2 justify-between">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyCaption(caption.text)}
                              className="glass-card"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          
                          <div className="flex gap-1">
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
                  <div className="text-center py-12">
                    <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Upload an image to see the default caption
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Regenerate Button */}
          {generatedCaptions.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={generateCaption}
                disabled={isGenerating}
                className="glass-card"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Both Captions
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Caption History */}
      {captionHistory.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" />
              Caption History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {captionHistory.slice(0, 10).map((caption) => (
                <motion.div
                  key={caption.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start justify-between p-3 glass-card rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        caption.model === 'trained' 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-ai-accent/20 text-ai-accent'
                      }`}>
                        {caption.model === 'trained' ? 'Your Model' : 'Default AI'}
                      </span>
                    </div>
                    <p className="text-sm">{caption.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {caption.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCaption(caption.text)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {caption.rating === 'up' && (
                      <ThumbsUp className="w-3 h-3 text-success" />
                    )}
                    {caption.rating === 'down' && (
                      <ThumbsDown className="w-3 h-3 text-destructive" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}