import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useGetTestimonials } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";

export function Testimonials() {
  const { data: testimonials, isLoading } = useGetTestimonials();

  return (
    <section id="testimonials" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full filter blur-[100px] -translate-y-1/2 translate-x-1/3"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-4">
            Success Stories
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-6">
            Hear From Our Students
          </h2>
          <p className="text-lg text-slate-600">
            Real experiences from students who trusted us with their future and are now pursuing their dreams in Russia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="border-none shadow-md">
                <CardContent className="p-8">
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-6"></div>
                  <div className="space-y-2 mb-8">
                    <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 w-4/6 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse"></div>
                    <div>
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            testimonials?.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="h-full border-none shadow-xl shadow-slate-200/40 relative">
                  <div className="absolute top-6 right-6 text-blue-100">
                    <Quote className="w-12 h-12 fill-current" />
                  </div>
                  <CardContent className="p-8 flex flex-col h-full relative z-10">
                    <div className="flex gap-1 mb-6 text-accent">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    
                    <p className="text-slate-700 leading-relaxed mb-8 flex-grow italic">
                      "{t.feedback}"
                    </p>

                    <div className="flex items-center gap-4 mt-auto">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{t.name}</h4>
                        <div className="text-sm text-slate-500">
                          {t.course} • {t.university}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{t.country}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
