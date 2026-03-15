import { motion } from "framer-motion";
import { useGetServices } from "@workspace/api-client-react";
import { Stethoscope, Settings, Plane, Briefcase, Home, FileCheck, Car, Users, Cog, CheckCircle, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Map strings from API to Lucide Icons safely
const iconMap: Record<string, LucideIcon> = {
  "stethoscope": Stethoscope,
  "Stethoscope": Stethoscope,
  "settings": Settings,
  "Settings": Settings,
  "Cog": Cog,
  "cog": Cog,
  "plane": Plane,
  "Plane": Plane,
  "briefcase": Briefcase,
  "Briefcase": Briefcase,
  "FileCheck": FileCheck,
  "filecheck": FileCheck,
  "home": Home,
  "Home": Home,
  "car": Car,
  "Car": Car,
  "users": Users,
  "Users": Users,
};

export function Services() {
  const { data: services, isLoading, error } = useGetServices();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="services" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-primary text-sm font-semibold mb-4">
            Our Services
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-6">
            Comprehensive Support for <br />Your Academic Journey
          </h2>
          <p className="text-lg text-slate-600">
            From university selection to graduation, we provide end-to-end assistance to ensure your time in Russia is productive and comfortable.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <Card key={i} className="border-none shadow-md">
                <CardContent className="p-6">
                  <Skeleton className="w-12 h-12 rounded-xl mb-6" />
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 bg-red-50 p-6 rounded-xl">
            Failed to load services. Please try again later.
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {services?.map((service) => {
              const IconComponent = iconMap[service.icon] || CheckCircle;
              return (
                <motion.div key={service.id} variants={itemVariants}>
                  <Card className="h-full border-none shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">
                        {service.title}
                      </h3>
                      <p className="text-slate-500 leading-relaxed">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
