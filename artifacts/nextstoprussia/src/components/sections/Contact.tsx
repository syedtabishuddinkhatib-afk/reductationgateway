import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send, Loader2 } from "lucide-react";
import { useSubmitLead, useGetSiteContent } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(8, "Valid phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  country: z.string().min(2, "Country is required"),
  preferredCourse: z.string().min(2, "Please select a course"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function Contact() {
  const { toast } = useToast();
  const submitLead = useSubmitLead();
  const { data: siteContent } = useGetSiteContent();
  const admissionsEmail = siteContent?.contact?.admissionsEmail ?? "admissions@nextstoprussia.com";
  const phone = siteContent?.contact?.phone ?? "+7-900-000-0000";
  const address = siteContent?.contact?.address ?? "Moscow, Russia — International Student Office";
  const academicYear = siteContent?.contact?.academicYear ?? "2025-2026";

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    submitLead.mutate({ data }, {
      onSuccess: (res) => {
        toast({
          title: "Application Submitted Successfully!",
          description: "Our counselor will contact you shortly.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        reset();
        
        // Optionally redirect to WhatsApp
        if (res.whatsappUrl) {
          setTimeout(() => {
            window.open(res.whatsappUrl, '_blank');
          }, 1500);
        }
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: "Please try again or contact us directly via WhatsApp.",
        });
      }
    });
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Info & Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-sm font-semibold mb-4">
              Get In Touch
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-6">
              Start Your Admission Process Today
            </h2>
            <p className="text-lg text-slate-600 mb-10">
              Fill out the application form or contact us directly. Our expert counselors are ready to answer all your queries for free.
            </p>

            <div className="space-y-6 mb-10">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary mr-4 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Russia Office</h4>
                  <p className="text-slate-600">{address}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mr-4 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">WhatsApp & Phone</h4>
                  <a href={`tel:${phone}`} className="text-slate-600 hover:text-primary transition-colors block">{phone}</a>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mr-4 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Email Us</h4>
                  <a href={`mailto:${admissionsEmail}`} className="text-slate-600 hover:text-primary transition-colors block">{admissionsEmail}</a>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
              {/* Note: In a real app, you would use an actual iframe here */}
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span>Interactive Map Embed</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lead Capture Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Apply Now</h3>
              <p className="text-slate-500 mb-8">Secure your seat for the {academicYear} academic year.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Full Name *</label>
                    <input 
                      {...register("fullName")}
                      className={`flex h-12 w-full rounded-xl border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'} bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Phone/WhatsApp *</label>
                    <input 
                      {...register("phone")}
                      className={`flex h-12 w-full rounded-xl border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'} bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                      placeholder="+1 234 567 8900"
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                    <input 
                      {...register("email")}
                      type="email"
                      className="flex h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Country *</label>
                    <input 
                      {...register("country")}
                      className={`flex h-12 w-full rounded-xl border ${errors.country ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'} bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                      placeholder="e.g. India, Nigeria"
                    />
                    {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Preferred Course *</label>
                  <select 
                    {...register("preferredCourse")}
                    className={`flex h-12 w-full rounded-xl border ${errors.preferredCourse ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'} bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all appearance-none`}
                  >
                    <option value="">Select a course...</option>
                    <option value="MBBS">MBBS / Medical</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Aviation">Aviation</option>
                    <option value="Management">Business & Management</option>
                    <option value="Language">Russian Language Preparatory</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.preferredCourse && <p className="text-xs text-red-500">{errors.preferredCourse.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Message / Questions (Optional)</label>
                  <textarea 
                    {...register("message")}
                    rows={4}
                    className="flex w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="Any specific university in mind? Questions about the process?"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || submitLead.isPending}
                  className="w-full h-14 text-base rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  {isSubmitting || submitLead.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <Send className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-slate-500 mt-4">
                  By submitting this form, you agree to be contacted by our counselors via phone, email, or WhatsApp.
                </p>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
