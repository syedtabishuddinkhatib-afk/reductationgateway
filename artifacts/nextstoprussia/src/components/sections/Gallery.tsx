import { useState } from "react";
import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { useGetGallery } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function Gallery() {
  const { data: gallery, isLoading } = useGetGallery();
  const [filter, setFilter] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const categories = ["All", "Campus", "Student Life", "Videos"];

  const filteredItems = gallery?.filter(item => {
    if (filter === "All") return true;
    if (filter === "Videos") return item.type === "youtube" || item.type === "video";
    return item.category.toLowerCase() === filter.toLowerCase();
  });

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">
              Life in Russia
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl">
              Take a glimpse into the beautiful campuses, vibrant student life, and the amazing journey awaiting you.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                className={`rounded-full ${filter === cat ? 'bg-primary text-white' : 'text-slate-600 hover:text-primary'}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-100 animate-pulse"></div>
            ))
          ) : (
            filteredItems?.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md bg-slate-100 cursor-pointer"
                onClick={() => item.type === "youtube" && setSelectedVideo(item.src)}
              >
                <img 
                  src={item.thumbnail || item.src} 
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {item.type === "youtube" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110">
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-accent text-xs font-bold uppercase tracking-wider mb-1 block">
                    {item.category}
                  </span>
                  <h4 className="text-white font-medium text-lg">{item.caption}</h4>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          <DialogTitle className="sr-only">Video Player</DialogTitle>
          <DialogDescription className="sr-only">Youtube video player</DialogDescription>
          {selectedVideo && (
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.split('v=')[1] || selectedVideo.split('/').pop()}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 rounded-full p-2"
            onClick={() => setSelectedVideo(null)}
          >
            <X className="w-6 h-6" />
          </button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
