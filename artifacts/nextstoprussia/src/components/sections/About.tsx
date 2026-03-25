import { motion } from "framer-motion";
import { CheckCircle2, Award, GraduationCap, Globe } from "lucide-react";
import { useGetSiteContent } from "@workspace/api-client-react";

export function About() {
  const { data: siteContent } = useGetSiteContent();
  const founderName = siteContent?.about?.founderName ?? "Dr. Jabroot Khatib";
  const founderTitle = siteContent?.about?.founderTitle ?? "Founder & Head Consultant";
  const founderPhoto = siteContent?.about?.founderPhoto || `${import.meta.env.BASE_URL}images/dr-jabroot.png`;
  const bio = siteContent?.about?.bio ?? "As an MBBS graduate from Moscow, Dr. Jabroot Khatib understands firsthand the challenges and triumphs of studying in Russia as an international student. With over a decade of experience, NextStopRussia was founded with a singular mission: to provide transparent, reliable, and comprehensive support to students seeking world-class education in Russian universities.";

  const features = [
    { icon: <GraduationCap className="w-6 h-6 text-primary" />, title: "MBBS Specialist", desc: "Expert guidance for medical programs" },
    { icon: <Globe className="w-6 h-6 text-primary" />, title: "International Reach", desc: "Students from 15+ countries" },
    { icon: <CheckCircle2 className="w-6 h-6 text-primary" />, title: "100% Transparency", desc: "No hidden fees or charges" },
    { icon: <Award className="w-6 h-6 text-primary" />, title: "Post-Arrival Support", desc: "Full assistance in Russia" },
  ];

  return (
    <section id="about" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border-8 border-white">
              <img
                src={founderPhoto}
                alt={founderName}
                className="w-full h-auto object-cover aspect-[3/4]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur rounded-xl p-4 shadow-lg border border-white/20">
                  <h3 className="font-display font-bold text-xl text-slate-900">{founderName}</h3>
                  <p className="text-primary font-medium text-sm">{founderTitle}</p>
                  <p className="text-slate-500 text-sm mt-1">MBBS, Moscow</p>
                </div>
              </div>
            </div>
            
            {/* Decorative background blob */}
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 z-[-1] animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 z-[-1] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-sm font-semibold mb-6">
              About The Founder
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight">
              Guided by Experience, <br />
              <span className="text-primary">Driven by Your Success</span>
            </h2>
            
            <div className="space-y-4 text-slate-600 text-lg mb-8 leading-relaxed">
              <p>{bio}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              {features.map((feature, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{feature.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
