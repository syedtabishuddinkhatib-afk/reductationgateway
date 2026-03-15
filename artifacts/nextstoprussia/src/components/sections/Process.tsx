import { motion } from "framer-motion";
import { FileText, PhoneCall, Building, MailOpen, FileCheck, Plane } from "lucide-react";

export function Process() {
  const steps = [
    { id: 1, title: "Submit Application", icon: <FileText className="w-6 h-6" />, desc: "Fill out the quick inquiry form with your basic details and preferred course." },
    { id: 2, title: "Free Counseling", icon: <PhoneCall className="w-6 h-6" />, desc: "Our expert counselors will call you to discuss options and clarify doubts." },
    { id: 3, title: "University Selection", icon: <Building className="w-6 h-6" />, desc: "Choose the best-fit university based on your budget and academic profile." },
    { id: 4, title: "Admission Letter", icon: <MailOpen className="w-6 h-6" />, desc: "Receive your official admission confirmation from the university within days." },
    { id: 5, title: "Visa Processing", icon: <FileCheck className="w-6 h-6" />, desc: "We handle the complex invitation and student visa application process." },
    { id: 6, title: "Travel to Russia", icon: <Plane className="w-6 h-6" />, desc: "Airport pickup, hostel settlement, and university registration support." },
  ];

  return (
    <section id="process" className="py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-6">
            Simple 6-Step Admission
          </h2>
          <p className="text-lg text-slate-600">
            We've streamlined the international admission process to make it entirely hassle-free for students and parents.
          </p>
        </div>

        <div className="relative">
          {/* Desktop continuous line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-blue-100 -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-4 relative z-10">
            {steps.map((step, idx) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-lg border-4 border-slate-50 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 relative z-10 group-hover:scale-110">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-slate-900 text-xs font-bold flex items-center justify-center shadow-sm">
                    {step.id}
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2 leading-tight">{step.title}</h4>
                <p className="text-sm text-slate-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
