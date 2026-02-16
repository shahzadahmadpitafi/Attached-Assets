import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Maximize, Phone, Check } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { COMPANY } from "@/lib/constants";
import type { Property } from "@shared/schema";

interface PropertyDetailDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PropertyDetailDialog({ property, open, onOpenChange }: PropertyDetailDialogProps) {
  if (!property) return null;

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(1)} Crore`;
    if (price >= 100000) return `PKR ${(price / 100000).toFixed(1)} Lac`;
    return `PKR ${price.toLocaleString()}`;
  };

  const whatsappUrl = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in: ${property.title} (${formatPrice(property.price)}) at ${property.location}`)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0" data-testid="dialog-property-detail">
        <div className="relative">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-64 sm:h-72 object-cover rounded-t-md"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className={`${property.status === "For Sale" ? "bg-primary text-primary-foreground" : "bg-[hsl(160,84%,39%)] text-white"}`}>
              {property.status}
            </Badge>
            <Badge variant="secondary" className="bg-black/60 text-white border-0">{property.type}</Badge>
          </div>
        </div>

        <div className="p-6">
          <DialogHeader className="text-left mb-0">
            <DialogTitle className="text-2xl font-serif" data-testid="text-detail-title">{property.title}</DialogTitle>
          </DialogHeader>

          <p className="flex items-center gap-1.5 text-muted-foreground mt-1">
            <MapPin className="w-4 h-4" />
            {property.location}
          </p>

          <p className="text-2xl font-bold text-[hsl(45,93%,40%)] mt-3" data-testid="text-detail-price">
            {formatPrice(property.price)}
            {property.status === "For Rent" && <span className="text-sm font-normal text-muted-foreground"> /month</span>}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-4 py-4 border-y">
            {property.bedrooms != null && (
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{property.bedrooms}</p>
                  <p className="text-xs text-muted-foreground">Bedrooms</p>
                </div>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{property.bathrooms}</p>
                  <p className="text-xs text-muted-foreground">Bathrooms</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Maximize className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{property.area.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Sq. Ft.</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Amenities</h4>
              <div className="grid grid-cols-2 gap-2">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-[hsl(160,84%,39%)]" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <a href={`tel:${COMPANY.phone}`} className="flex-1">
              <Button variant="outline" className="w-full gap-2" data-testid="button-call-agent">
                <Phone className="w-4 h-4" />
                Call Agent
              </Button>
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full gap-2 bg-[#25D366] text-white" data-testid="button-whatsapp-inquiry">
                <SiWhatsapp className="w-4 h-4" />
                WhatsApp Inquiry
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
