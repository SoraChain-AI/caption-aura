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
}

const sampleCaptions = [
  "Chasing golden hour dreams ✨ Sometimes the most beautiful moments happen when you least expect them #goldenhour #dreaming #grateful",
  "Coffee in hand, world at my feet ☕ Ready to conquer this beautiful day with positive energy and endless possibilities #motivation #coffee #newday",
  "Simple moments, extraordinary feelings 💫 Finding magic in the everyday adventures that make life truly wonderful #mindful #blessed #adventure",
  "Creating memories one sunset at a time 🌅 Each ending brings a new beginning filled with hope and endless possibilities #sunset #memories #hope",
  "Living my best life, one moment at a time ✨ Embracing every opportunity to grow, learn, and spread joy #livingmybestlife #growth #joy"
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

    const randomCaption = sampleCaptions[Math.floor(Math.random() * sampleCaptions.length)];
    setCurrentCaption(randomCaption);
    setShowTypewriter(true);
    setIsGenerating(false);

    const newCaption: GeneratedCaption = {
      id: Date.now().toString(),
      text: randomCaption,
      timestamp: new Date()
    };

    setGeneratedCaptions([newCaption]);
    setCaptionHistory(prev => [newCaption, ...prev.slice(0, 9)]); // Keep last 10
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
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-ai-accent" />
              Generated Caption
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedCaptions.length > 0 ? (
              <AnimatePresence>
                {generatedCaptions.map((caption) => (
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateCaption}
                          disabled={isGenerating}
                          className="glass-card"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate
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
                  Upload an image and click generate to see AI-powered captions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
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
              {captionHistory.slice(0, 5).map((caption) => (
                <motion.div
                  key={caption.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start justify-between p-3 glass-card rounded-lg"
                >
                  <div className="flex-1">
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