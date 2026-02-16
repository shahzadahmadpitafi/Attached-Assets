import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Maximize, Eye } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
}

export default function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `PKR ${(price / 100000).toFixed(1)} Lac`;
    return `PKR ${price.toLocaleString()}`;
  };

  return (
    <Card className="overflow-visible group hover-elevate" data-testid={`card-property-${property.id}`}>
      <div className="relative overflow-hidden rounded-t-md">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className={`text-xs font-semibold ${property.status === "For Sale" ? "bg-primary text-primary-foreground" : "bg-[hsl(160,84%,39%)] text-white"}`}>
            {property.status}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="text-xs font-medium bg-black/60 text-white border-0">
            {property.type}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <p className="text-lg font-bold text-[hsl(45,93%,40%)]" data-testid={`text-price-${property.id}`}>
          {formatPrice(property.price)}
          {property.status === "For Rent" && <span className="text-xs font-normal text-muted-foreground"> /month</span>}
        </p>
        <h3 className="font-semibold mt-1 line-clamp-1" data-testid={`text-title-${property.id}`}>
          {property.title}
        </h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <MapPin className="w-3.5 h-3.5" />
          {property.location}
        </p>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm text-muted-foreground">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" /> {property.bedrooms} Beds
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" /> {property.bathrooms} Baths
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize className="w-3.5 h-3.5" /> {property.area.toLocaleString()} sqft
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full mt-3 gap-2"
          onClick={() => onViewDetails?.(property)}
          data-testid={`button-view-${property.id}`}
        >
          <Eye className="w-4 h-4" />
          View Details
        </Button>
      </div>
    </Card>
  );
}
