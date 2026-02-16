import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyCard from "@/components/property-card";
import PropertyDetailDialog from "@/components/property-detail-dialog";
import { COMPANY, SERVICES, TESTIMONIALS } from "@/lib/constants";
import {
  Search, ArrowRight, Home, Key, Wrench, Building2,
  MessageSquare, TrendingUp, Star, ChevronLeft, ChevronRight,
  MapPin, Phone, Mail,
} from "lucide-react";
import type { Property } from "@shared/schema";

const iconMap: Record<string, any> = { Home, Key, Wrench, Building2, MessageSquare, TrendingUp };

function StatCounter({ value, label }: { value: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl font-bold text-[hsl(45,93%,47%)]">{count.toLocaleString()}+</p>
      <p className="text-sm text-gray-300 mt-1">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchType, setSearchType] = useState("buy");

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties?featured=true"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center" data-testid="section-hero">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/hero-bg.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-2xl">
            <Badge className="bg-[hsl(45,93%,47%)]/20 text-[hsl(45,93%,55%)] border-[hsl(45,93%,47%)]/30 mb-4 text-sm">
              Premium Real Estate
            </Badge>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight" data-testid="text-hero-title">
              Your Trusted Real Estate Partner in{" "}
              <span className="text-[hsl(45,93%,47%)]">Islamabad &amp; Lahore</span>
            </h1>
            <p className="text-lg text-gray-300 mt-4 max-w-xl leading-relaxed">
              Discover exceptional properties, expert guidance, and comprehensive real estate solutions tailored to your needs.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link href="/properties">
                <Button size="lg" className="bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)] font-semibold gap-2" data-testid="button-explore">
                  Explore Properties
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-sm" data-testid="button-hero-contact">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="mt-10 max-w-3xl p-4 bg-white/95 dark:bg-card/95 backdrop-blur-md" data-testid="search-bar">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-muted rounded-md p-0.5">
                {["buy", "rent"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSearchType(t)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      searchType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                    data-testid={`button-search-${t}`}
                  >
                    {t === "buy" ? "Buy" : "Rent"}
                  </button>
                ))}
              </div>
              <Select>
                <SelectTrigger className="w-40" data-testid="select-location">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="islamabad">Islamabad</SelectItem>
                  <SelectItem value="lahore">Lahore</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40" data-testid="select-type">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
              <Link href="/properties" className="flex-1 min-w-[100px]">
                <Button className="w-full gap-2" data-testid="button-search">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[hsl(222,47%,11%)] py-12" data-testid="section-stats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {COMPANY.stats.map((s) => (
            <StatCounter key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-background" data-testid="section-featured">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-semibold text-[hsl(45,93%,47%)] uppercase tracking-wider">Featured</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-1">Premium Properties</h2>
              <p className="text-muted-foreground mt-2 max-w-lg">Handpicked properties from our exclusive portfolio in Islamabad and Lahore.</p>
            </div>
            <Link href="/properties">
              <Button variant="outline" className="gap-2" data-testid="button-view-all">
                View All Properties
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties?.slice(0, 6).map((p) => (
                <PropertyCard key={p.id} property={p} onViewDetails={setSelectedProperty} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-muted/30" data-testid="section-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[hsl(45,93%,47%)] uppercase tracking-wider">What We Offer</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-1">Our Services</h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">Comprehensive real estate solutions to meet every need.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => {
              const Icon = iconMap[s.icon] || Home;
              return (
                <Card key={s.id} className="p-6 hover-elevate overflow-visible" data-testid={`card-service-${s.id}`}>
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.description}</p>
                  <Link href="/contact">
                    <Button variant="outline" size="sm" className="mt-4 gap-1" data-testid={`button-quote-${s.id}`}>
                      Get Quote <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background" data-testid="section-testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[hsl(45,93%,47%)] uppercase tracking-wider">Testimonials</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-1">What Our Clients Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="p-6" data-testid={`card-testimonial-${i}`}>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[hsl(45,93%,47%)] text-[hsl(45,93%,47%)]" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                <div className="mt-4 pt-4 border-t">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary" data-testid="section-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-primary-foreground/80 mt-3 text-lg max-w-xl mx-auto">
            Let our expert team help you navigate the real estate market with confidence.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link href="/properties">
              <Button size="lg" className="bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)] font-semibold gap-2" data-testid="button-cta-browse">
                Browse Properties <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href={`tel:${COMPANY.phone}`}>
              <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10" data-testid="button-cta-call">
                <Phone className="w-4 h-4 mr-2" /> Call Us Now
              </Button>
            </a>
          </div>
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
