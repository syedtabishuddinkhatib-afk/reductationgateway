import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, DollarSign, ArrowRight } from "lucide-react";
import { useGetUniversityFees, useGetConsultancyFees } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Fees() {
  const { data: uniFees, isLoading: isLoadingUni } = useGetUniversityFees();
  const { data: consFees, isLoading: isLoadingCons } = useGetConsultancyFees();

  const [selectedUni, setSelectedUni] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const uniqueUnis = useMemo(() => {
    if (!uniFees) return [];
    return Array.from(new Set(uniFees.map(f => f.university)));
  }, [uniFees]);

  const availableCourses = useMemo(() => {
    if (!uniFees || !selectedUni) return [];
    return uniFees.filter(f => f.university === selectedUni).map(f => f.course);
  }, [uniFees, selectedUni]);

  const calculateTotal = () => {
    if (!uniFees || !consFees || !selectedUni || !selectedCourse) return null;
    const uniFee = uniFees.find(f => f.university === selectedUni && f.course === selectedCourse);
    if (!uniFee) return null;

    const totalConsFees = consFees.reduce((acc, curr) => acc + curr.price, 0);
    return {
      tuition: uniFee.tuitionPerYear,
      hostel: uniFee.hostelFee,
      consultancy: totalConsFees,
      total: uniFee.totalEstimated + totalConsFees // Roughly
    };
  };

  const result = calculateTotal();

  return (
    <section id="fees" className="py-24 bg-slate-900 text-white relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-semibold mb-4 backdrop-blur-sm border border-white/20">
            Transparent Pricing
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Study Cost Breakdown
          </h2>
          <p className="text-lg text-slate-300">
            No hidden charges. Use our estimator to understand exactly what your first year in Russia will cost, including tuition, hostel, and consultancy fees.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Cost Estimator */}
          <div className="lg:col-span-5">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md shadow-2xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-accent to-primary w-full"></div>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-accent" />
                  Cost Estimator
                </CardTitle>
                <p className="text-slate-300 text-sm">Select your preferences to calculate 1st-year expenses.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Select University</label>
                  <select 
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none appearance-none"
                    value={selectedUni}
                    onChange={(e) => {
                      setSelectedUni(e.target.value);
                      setSelectedCourse(""); // reset course
                    }}
                  >
                    <option value="" className="text-slate-900">Choose a university...</option>
                    {uniqueUnis.map(u => (
                      <option key={u} value={u} className="text-slate-900">{u}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Select Course</label>
                  <select 
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none appearance-none"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    disabled={!selectedUni}
                  >
                    <option value="" className="text-slate-900">Choose a course...</option>
                    {availableCourses.map(c => (
                      <option key={c} value={c} className="text-slate-900">{c}</option>
                    ))}
                  </select>
                </div>

                {result && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6 space-y-4"
                  >
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">1st Year Tuition</span>
                      <span className="font-semibold">${result.tuition}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">Hostel Fee (Annual)</span>
                      <span className="font-semibold">${result.hostel}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">Consultancy & Processing</span>
                      <span className="font-semibold">${result.consultancy}</span>
                    </div>
                    <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                      <span className="font-bold text-lg text-white">Estimated Total</span>
                      <span className="font-bold text-2xl text-accent flex items-center">
                        <DollarSign className="w-5 h-5" />
                        {result.total}
                      </span>
                    </div>
                  </motion.div>
                )}

                <Button className="w-full h-12 bg-accent hover:bg-accent/90 text-slate-900 font-bold text-base" asChild>
                  <a href="#contact">Apply With This Estimate</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Consultancy Services List */}
          <div className="lg:col-span-7">
            <h3 className="text-2xl font-display font-bold mb-6">What's Included in Consultancy?</h3>
            <p className="text-slate-300 mb-8">
              Our processing fee covers end-to-end services, ensuring you don't face any surprises upon arrival.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoadingCons ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse h-24"></div>
                ))
              ) : (
                consFees?.map((fee) => (
                  <div key={fee.id} className="bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-xl p-5 group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white text-lg">{fee.service}</h4>
                      {/* Optional: Show individual prices if desired, though often kept standard */}
                    </div>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                      {fee.description}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-8 flex items-center justify-center md:justify-start gap-4">
              <div className="flex -space-x-4">
                <img className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Student" />
                <img className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="Student" />
                <img className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" alt="Student" />
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-white">500+</div>
              </div>
              <p className="text-sm text-slate-400 max-w-xs">Join hundreds of students who successfully processed their admissions through us.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
