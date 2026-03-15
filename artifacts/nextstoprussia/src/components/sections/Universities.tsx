import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { useGetUniversities } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function Universities() {
  const { data: universities, isLoading, error } = useGetUniversities();

  return (
    <section id="universities" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-sm font-semibold mb-4">
              Partner Institutions
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">
              Top Ranked Universities
            </h2>
            <p className="text-lg text-slate-600">
              We partner with prestigious Russian state and federal universities recognized globally by WHO, NMC, and European councils.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 group">
            View All Universities 
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-6" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
           <div className="text-center text-red-500 bg-red-50 p-6 rounded-xl">
            Failed to load universities. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {universities?.map((uni, idx) => (
              <motion.div
                key={uni.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col group">
                  <CardContent className="p-8 flex-grow flex flex-col">
                    <div className="flex items-start gap-5 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-2xl font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                        {uni.logo ? (
                          <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          uni.name.substring(0, 1)
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-slate-900 leading-tight mb-2 font-display line-clamp-2">
                          {uni.name}
                        </h3>
                        <div className="flex items-center text-slate-500 text-sm font-medium">
                          <MapPin className="w-4 h-4 mr-1 text-accent" />
                          {uni.city}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 mb-6 flex-grow line-clamp-3">
                      {uni.description}
                    </p>

                    <div className="space-y-4 mt-auto">
                      <div>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Programs</div>
                        <div className="flex flex-wrap gap-2">
                          {uni.courses.slice(0,3).map(course => (
                            <span key={course} className="px-3 py-1 bg-blue-50 text-primary text-xs font-medium rounded-full border border-blue-100">
                              {course}
                            </span>
                          ))}
                          {uni.courses.length > 3 && (
                            <span className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-medium rounded-full border border-slate-200">
                              +{uni.courses.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Est. Tuition</div>
                          <div className="font-bold text-slate-900">{uni.tuitionRange}</div>
                        </div>
                        <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-white transition-colors">
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
