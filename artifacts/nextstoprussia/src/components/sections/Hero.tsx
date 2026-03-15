import { motion } from "framer-motion";
import { ArrowRight, Plane, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Russian University Background"
          className="w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm"
          >
            <Plane className="w-4 h-4 text-accent" />
            Admissions for 2024-2025 are Open
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.1] mb-6"
          >
            Your Gateway to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-accent">
              Studying in Russia
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed"
          >
            Expert guidance for international students. Secure your admission in top Russian universities for MBBS, Engineering, Aviation, and Management programs.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Button asChild size="lg" className="h-14 px-8 text-base rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1">
              <a href="#contact">
                Apply Now <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all hover:-translate-y-1">
              <a href="https://wa.me/+79000000000" target="_blank" rel="noreferrer">
                <MessageCircle className="w-5 h-5 mr-2 text-green-400" /> WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all hover:-translate-y-1">
              <a href="https://t.me/nextstoprussia" target="_blank" rel="noreferrer">
                <Send className="w-5 h-5 mr-2 text-blue-400" /> Telegram
              </a>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Floating Stats */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2 hidden md:block"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 p-8 grid grid-cols-3 divide-x border border-slate-100">
            <div className="text-center px-4">
              <div className="text-4xl font-display font-bold text-primary mb-1">500+</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Students Placed</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-display font-bold text-primary mb-1">20+</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Partner Universities</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-display font-bold text-primary mb-1">10+</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Years Experience</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
