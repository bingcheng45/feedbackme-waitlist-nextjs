'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Zap, Users, BarChart3, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfettiToast } from '@/components/ui/ConfettiToast';

interface WaitlistFormData {
  fullName: string;
  email: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const staggerFast = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Format number for display
function formatWaitlistCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K+`;
  }
  return `${count}+`;
}

export default function HomePage() {
  const [formData, setFormData] = useState<WaitlistFormData>({
    fullName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(2500); // Default fallback
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Fetch current waitlist count
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const response = await fetch('/api/waitlist');
        const result = await response.json();
        if (result.success) {
          setWaitlistCount(result.data.totalRegistrations);
        }
      } catch (error) {
        console.error('Failed to fetch waitlist count:', error);
      }
    };
    
    fetchWaitlistCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show confetti toast with position
        toast.custom(
          <ConfettiToast
            position={result.data.position}
            email={result.data.email}
            isExisting={result.isExisting}
          />,
          {
            duration: 5000,
            id: 'waitlist-success',
          }
        );
        
        setSubmitStatus({
          type: 'success',
          message: `${result.message} You're #${result.data.position} in line!`
        });
        // Reset form
        setFormData({ fullName: '', email: '' });
        // Update waitlist count
        setWaitlistCount(result.data.position);
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Something went wrong. Please try again.'
        });
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-feedbackme-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold gradient-text">FeedbackMe</span>
            </div>
            <button className="btn-primary">
              Join Waitlist
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 sm:pt-32 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1 
              className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
              variants={fadeInUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Transform Websites Into{' '}
              <span className="gradient-text">Collaborative Communities</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              FeedbackMe is the plug-and-play tool that turns user feedback into actionable insights. 
              Just a few lines of code to build transparent, voting-powered communities around your product.
            </motion.p>

            {/* Waitlist Form */}
            <motion.div 
              className="max-w-md mx-auto"
              variants={fadeInUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="glass-morphism rounded-2xl p-8">
                <motion.h3 
                  className="text-2xl font-semibold mb-6 text-center"
                  variants={fadeIn}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                >
                  Join the Waitlist
                </motion.h3>
                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-4"
                  variants={staggerFast}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div variants={fadeInUp} transition={{ duration: 0.6, ease: "easeOut" }}>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="glass-input w-full px-4 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-feedbackme-yellow/30 transition-all duration-200"
                      required
                    />
                  </motion.div>
                  <motion.div variants={fadeInUp} transition={{ duration: 0.6, ease: "easeOut" }}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="glass-input w-full px-4 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-feedbackme-yellow/30 transition-all duration-200"
                      required
                    />
                  </motion.div>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 transform hover:scale-[1.02] transition-all duration-200"
                    variants={fadeInUp}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? 'Reserving...' : 'Reserve My Spot'}
                  </motion.button>
                  
                  {/* Status Message */}
                  {submitStatus.type && (
                    <motion.div
                      className={`mt-4 p-3 rounded-lg text-sm ${
                        submitStatus.type === 'success'
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      {submitStatus.message}
                    </motion.div>
                  )}
                </motion.form>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            variants={staggerFast}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeInUp} transition={{ duration: 0.7, ease: "easeOut" }}>
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                {formatWaitlistCount(waitlistCount)}
              </div>
              <div className="text-slate-400">Developers Waiting</div>
            </motion.div>
            <motion.div variants={fadeInUp} transition={{ duration: 0.7, ease: "easeOut" }}>
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">15mins</div>
              <div className="text-slate-400">Avg. Integration</div>
            </motion.div>
            <motion.div variants={fadeInUp} transition={{ duration: 0.7, ease: "easeOut" }}>
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">99.9%</div>
              <div className="text-slate-400">Uptime SLA</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">
              Why Developers Choose FeedbackMe
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Stop guessing what your users want. Build features that matter with transparent, 
              community-driven feedback that prioritizes itself.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div 
              className="glass-morphism rounded-2xl p-8 text-center hover:border-feedbackme-yellow/40 transition-all duration-300"
              variants={fadeInUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-feedbackme-yellow to-feedbackme-amber rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Lightning Integration</h3>
              <p className="text-slate-300 leading-relaxed">
                Just a few lines of code and you're live. No complex setup, no configuration headaches. 
                Get feedback flowing in minutes, not days.
              </p>
            </motion.div>

            <motion.div 
              className="glass-morphism rounded-2xl p-8 text-center hover:border-feedbackme-yellow/40 transition-all duration-300"
              variants={fadeInUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-feedbackme-yellow to-feedbackme-amber rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Community-Powered</h3>
              <p className="text-slate-300 leading-relaxed">
                Transparent feedback boards where users vote on what matters most. 
                Let your community prioritize features democratically.
              </p>
            </motion.div>

            <motion.div 
              className="glass-morphism rounded-2xl p-8 text-center hover:border-feedbackme-yellow/40 transition-all duration-300"
              variants={fadeInUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-feedbackme-yellow to-feedbackme-amber rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Actionable Analytics</h3>
              <p className="text-slate-300 leading-relaxed">
                Turn feedback chaos into clear insights. See trends, identify pain points, 
                and make data-driven product decisions.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-feedbackme-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">How It Works</h2>
            <p className="text-lg text-slate-300">From integration to insights in three simple steps</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div 
              className="glass-morphism rounded-2xl p-8 text-center hover:border-feedbackme-yellow/40 transition-all duration-300"
              variants={fadeInUp} 
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-feedbackme-yellow to-feedbackme-amber rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-black">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Embed Widget</h3>
              <p className="text-slate-300 leading-relaxed">
                Copy our snippet and paste it into your website. The feedback widget appears instantly, 
                ready for your users to share their thoughts.
              </p>
            </motion.div>

            <motion.div 
              className="glass-morphism rounded-2xl p-8 text-center hover:border-feedbackme-yellow/40 transition-all duration-300"
              variants={fadeInUp} 
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-feedbackme-yellow to-feedbackme-amber rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-black">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Users Engage</h3>
              <p className="text-slate-300 leading-relaxed">
                Your community submits feedback, votes on features, and discusses improvements. 
                Everything happens transparently for maximum trust.
              </p>
            </motion.div>

            <motion.div 
              className="glass-morphism rounded-2xl p-8 text-center hover:border-feedbackme-yellow/40 transition-all duration-300"
              variants={fadeInUp} 
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-feedbackme-yellow to-feedbackme-amber rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-black">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Build What Matters</h3>
              <p className="text-slate-300 leading-relaxed">
                Access your dashboard to see prioritized feedback, track trends, 
                and build features your users actually want.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 gradient-text">
              Ready to Transform Your Product?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-3xl mx-auto">
              Join 2,500+ developers building better products with community-driven feedback. 
              Be among the first to experience the future of user engagement.
            </p>
            <button className="btn-primary text-lg px-8 py-4 mb-6 group">
              Join the Waitlist Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
              <span>⚡ Early access</span>
              <span>🎯 Priority support</span>
              <span>🚀 Launch discounts</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-feedbackme-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold gradient-text">FeedbackMe</span>
            </div>
            <div className="flex items-center text-sm text-slate-400">
              <a href="#" className="hover:text-feedbackme-yellow transition-colors">Privacy</a>
              <span className="mx-2">|</span>
              <a href="#" className="hover:text-feedbackme-yellow transition-colors">Terms</a>
              <span className="mx-2">|</span>
              <a href="#" className="hover:text-feedbackme-yellow transition-colors">Contact</a>
            </div>
          </motion.div>
          <motion.div 
            className="text-center text-sm text-slate-400 mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          >
            © 2025 FeedbackMe. All rights reserved.
          </motion.div>
        </div>
      </footer>
    </div>
  );
} 