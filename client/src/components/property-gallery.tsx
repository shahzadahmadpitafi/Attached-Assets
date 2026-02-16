import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PropertyMedia } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2, Image, Video, FileText, Play } from "lucide-react";

function Lightbox({ images, startIndex, onClose }: {
  images: { url: string; caption?: string | null }[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const [zoom, setZoom] = useState(1);

  const goNext = useCallback(() => {
    setCurrent(i => (i + 1) % images.length);
    setZoom(1);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrent(i => (i - 1 + images.length) % images.length);
    setZoom(1);
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  const img = images[current];

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" data-testid="lightbox-overlay">
      <div className="flex items-center justify-between p-3 text-white">
        <span className="text-sm" data-testid="lightbox-counter">{current + 1} / {images.length}</span>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={onClose} data-testid="button-close-lightbox">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {images.length > 1 && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-2 z-10 text-white hover:bg-white/20"
            onClick={goPrev}
            data-testid="button-lightbox-prev"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        <img
          src={img.url}
          alt={img.caption || "Property image"}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
          data-testid="lightbox-image"
        />

        {images.length > 1 && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 z-10 text-white hover:bg-white/20"
            onClick={goNext}
            data-testid="button-lightbox-next"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}
      </div>

      {img.caption && (
        <p className="text-white text-center text-sm py-2">{img.caption}</p>
      )}

      {images.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 p-3 overflow-x-auto">
          {images.map((thumb, i) => (
            <button
              key={i}
              className={`w-14 h-10 rounded overflow-hidden border-2 flex-shrink-0 transition-colors ${
                i === current ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
              }`}
              onClick={() => { setCurrent(i); setZoom(1); }}
            >
              <img src={thumb.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoEmbed({ platform, videoId }: { platform: string; videoId: string }) {
  if (platform === "youtube") {
    return (
      <div className="aspect-video rounded-md overflow-hidden" data-testid="video-embed-youtube">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Property Video"
        />
      </div>
    );
  }
  if (platform === "vimeo") {
    return (
      <div className="aspect-video rounded-md overflow-hidden" data-testid="video-embed-vimeo">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Property Video"
        />
      </div>
    );
  }
  return null;
}

export default function PropertyGallery({ propertyId, fallbackImage }: {
  propertyId: string;
  fallbackImage: string;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"photos" | "videos" | "floorplans">("photos");

  const { data: media = [] } = useQuery<PropertyMedia[]>({
    queryKey: ["/api/properties", propertyId, "media"],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${propertyId}/media`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const images = media.filter(m => m.type === "image");
  const videos = media.filter(m => m.type === "video");
  const floorPlans = media.filter(m => m.type === "floorplan");

  const featuredImage = images.find(m => m.isFeatured) || images[0];
  const hasMedia = images.length > 0 || videos.length > 0 || floorPlans.length > 0;
  const tabCounts = {
    photos: images.length || (fallbackImage ? 1 : 0),
    videos: videos.length,
    floorplans: floorPlans.length,
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxImages = images.length > 0
    ? images.map(img => ({ url: img.url, caption: img.caption }))
    : fallbackImage ? [{ url: fallbackImage, caption: null }] : [];

  if (!hasMedia && !fallbackImage) return null;

  return (
    <div className="space-y-3">
      {(images.length > 1 || videos.length > 0 || floorPlans.length > 0) && (
        <div className="flex items-center gap-1.5">
          <Button
            variant={activeTab === "photos" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("photos")}
            data-testid="tab-photos"
          >
            <Image className="w-3.5 h-3.5 mr-1" />
            Photos {tabCounts.photos > 0 && `(${tabCounts.photos})`}
          </Button>
          {videos.length > 0 && (
            <Button
              variant={activeTab === "videos" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("videos")}
              data-testid="tab-videos"
            >
              <Video className="w-3.5 h-3.5 mr-1" />
              Videos ({videos.length})
            </Button>
          )}
          {floorPlans.length > 0 && (
            <Button
              variant={activeTab === "floorplans" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("floorplans")}
              data-testid="tab-floorplans"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Floor Plans ({floorPlans.length})
            </Button>
          )}
        </div>
      )}

      {activeTab === "photos" && (
        <div>
          {images.length > 0 ? (
            <>
              <div
                className="relative cursor-pointer rounded-md overflow-hidden"
                onClick={() => openLightbox(images.indexOf(featuredImage!))}
                data-testid="gallery-main-image"
              >
                <img
                  src={featuredImage!.url}
                  alt={featuredImage!.caption || "Property"}
                  className="w-full h-64 sm:h-72 object-cover"
                />
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="bg-black/60 text-white border-0 text-xs gap-1">
                    <Maximize2 className="w-3 h-3" /> {images.length} Photos
                  </Badge>
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1">
                  {images.slice(0, 6).map((img, i) => (
                    <button
                      key={img.id}
                      className={`w-16 h-12 rounded overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        (featuredImage?.id === img.id) ? "border-primary" : "border-transparent"
                      }`}
                      onClick={() => openLightbox(i)}
                      data-testid={`gallery-thumb-${i}`}
                    >
                      <img src={img.url} alt={img.caption || ""} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {images.length > 6 && (
                    <button
                      className="w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center text-xs font-medium"
                      onClick={() => openLightbox(6)}
                    >
                      +{images.length - 6}
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <img
              src={fallbackImage}
              alt="Property"
              className="w-full h-64 sm:h-72 object-cover rounded-md cursor-pointer"
              onClick={() => lightboxImages.length > 0 && openLightbox(0)}
            />
          )}
        </div>
      )}

      {activeTab === "videos" && videos.length > 0 && (
        <div className="space-y-3">
          {videos.map(vid => (
            <div key={vid.id}>
              {vid.caption && <p className="text-sm font-medium mb-1">{vid.caption}</p>}
              {vid.platform && vid.videoId ? (
                <VideoEmbed platform={vid.platform} videoId={vid.videoId} />
              ) : (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <Play className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "floorplans" && floorPlans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {floorPlans.map(fp => (
            <div key={fp.id} className="border rounded-md overflow-hidden" data-testid={`floorplan-${fp.id}`}>
              <img
                src={fp.url}
                alt={fp.caption || "Floor Plan"}
                className="w-full aspect-[4/3] object-contain bg-muted"
              />
              {fp.caption && (
                <p className="text-sm font-medium text-center py-2">{fp.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {lightboxOpen && lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
