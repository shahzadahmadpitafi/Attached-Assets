import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyCard from "@/components/property-card";
import PropertyDetailDialog from "@/components/property-detail-dialog";
import { PROPERTY_TYPES, CITIES } from "@/lib/constants";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Property } from "@shared/schema";

export default function PropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
  });

  const queryString = Object.entries(filters)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: [queryString ? `/api/properties?${queryString}` : "/api/properties"],
  });

  const clearFilters = () =>
    setFilters({ status: "", type: "", city: "", minPrice: "", maxPrice: "", bedrooms: "" });

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="bg-primary py-16" data-testid="section-properties-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary-foreground" data-testid="text-properties-title">
            Our Properties
          </h1>
          <p className="text-primary-foreground/80 mt-3 max-w-xl mx-auto text-lg">
            Browse our extensive collection of premium properties in Islamabad and Lahore.
          </p>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="py-10" data-testid="section-properties-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Filters */}
          <Card className="p-4 mb-8" data-testid="card-filters">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
              {hasFilters && (
                <Button variant="ghost" size="sm" className="ml-auto gap-1 text-xs" onClick={clearFilters} data-testid="button-clear-filters">
                  <X className="w-3 h-3" /> Clear
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v === "all" ? "" : v }))}>
                <SelectTrigger data-testid="select-filter-status">
                  <SelectValue placeholder="Buy / Rent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="For Sale">For Sale</SelectItem>
                  <SelectItem value="For Rent">For Rent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.type} onValueChange={(v) => setFilters((f) => ({ ...f, type: v === "all" ? "" : v }))}>
                <SelectTrigger data-testid="select-filter-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.city} onValueChange={(v) => setFilters((f) => ({ ...f, city: v === "all" ? "" : v }))}>
                <SelectTrigger data-testid="select-filter-city">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                data-testid="input-min-price"
              />

              <Input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                data-testid="input-max-price"
              />

              <Select value={filters.bedrooms} onValueChange={(v) => setFilters((f) => ({ ...f, bedrooms: v === "all" ? "" : v }))}>
                <SelectTrigger data-testid="select-filter-bedrooms">
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {[1, 2, 3, 4, 5, 6].map((b) => (
                    <SelectItem key={b} value={String(b)}>{b}+ Beds</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Results */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground" data-testid="text-results-count">
              {isLoading ? "Loading..." : `${properties?.length || 0} properties found`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-52 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} onViewDetails={setSelectedProperty} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">No properties found</h3>
              <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters to see more results.</p>
              {hasFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters} data-testid="button-clear-filters-empty">
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <PropertyDetailDialog
        property={selectedProperty}
        open={!!selectedProperty}
        onOpenChange={(o) => !o && setSelectedProperty(null)}
      />
    </div>
  );
}
