import { motion } from 'framer-motion';
import { ArrowRight, Server, Upload, Brain, Wand2, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HowItWorks() {
  const steps = [
    {
      icon: Server,
      title: "Connect to SoraEngine",
      description: "Establish a secure connection to our federated learning infrastructure powered by Sora Engine.",
      details: "Our distributed system ensures your data remains private while enabling powerful AI training."
    },
    {
      icon: Upload,
      title: "Upload Your Data",
      description: "Upload your Instagram data export (ZIP file) containing your posts and captions.",
      details: "We process your historical posts to understand your unique writing style and preferences."
    },
    {
      icon: Brain,
      title: "AI Model Training", 
      description: "Your personalized AI model learns from your caption style using federated learning.",
      details: "Training happens securely without exposing your raw data, preserving your privacy."
    },
    {
      icon: Wand2,
      title: "Generate Captions",
      description: "Use your trained model to generate personalized captions for new images.",
      details: "Get captions that match your style, tone, and personality in seconds."
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data never leaves your control during training"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate captions in seconds with Liquid AI"
    },
    {
      icon: Brain,
      title: "Personalized",
      description: "AI learns your unique style and voice"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent"
        >
          How It Works
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Learn how CaptionCraft uses federated learning and Liquid AI to create your personalized caption generator
        </motion.p>
      </div>

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <Card className="glass-card">
              <CardContent className="p-8">
                <div className={`flex items-center gap-8 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-primary">Step {index + 1}</span>
                      {index < steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                    <p className="text-lg text-muted-foreground">{step.description}</p>
                    <p className="text-sm text-muted-foreground/80">{step.details}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Technology Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">Powered by Advanced AI</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-ai-accent" />
                Sora Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Federated learning infrastructure that trains your AI model while keeping your data private and secure.
              </p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Liquid AI LFM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced language model optimized for fast, high-quality caption generation with your personal style.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">Why Choose CaptionCraft?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
            >
              <Card className="glass-card text-center h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-gradient-ai rounded-full mx-auto flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}