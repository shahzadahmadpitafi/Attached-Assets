import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SERVICES } from "@/lib/constants";
import { Home, Key, Wrench, Building2, MessageSquare, TrendingUp, ArrowRight, Check } from "lucide-react";

const iconMap: Record<string, any> = { Home, Key, Wrench, Building2, MessageSquare, TrendingUp };

const serviceDetails: Record<string, string[]> = {
  sales: [
    "Residential property sales across prime locations",
    "Commercial property transactions",
    "Complete documentation and legal support",
    "Market valuation and pricing guidance",
    "Negotiation and deal closure assistance",
  ],
  rentals: [
    "Curated selection of rental properties",
    "Flexible lease terms and agreements",
    "Tenant screening and verification",
    "Competitive rental rate analysis",
    "Move-in ready properties",
  ],
  maintenance: [
    "Routine property inspections",
    "Emergency repair services",
    "Renovation and remodeling",
    "Plumbing, electrical, and HVAC",
    "Landscaping and exterior maintenance",
  ],
  management: [
    "Full-service property management",
    "Rent collection and accounting",
    "Tenant relations management",
    "Vacancy marketing and filling",
    "Regular property reporting",
  ],
  consultation: [
    "Market analysis and insights",
    "Investment strategy development",
    "Portfolio diversification advice",
    "Risk assessment and mitigation",
    "Legal and regulatory guidance",
  ],
  investment: [
    "High-yield investment properties",
    "Off-plan project opportunities",
    "Joint venture partnerships",
    "Capital appreciation analysis",
    "ROI projections and planning",
  ],
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="bg-primary py-16" data-testid="section-services-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary-foreground" data-testid="text-services-title">
            Our Services
          </h1>
          <p className="text-primary-foreground/80 mt-3 max-w-xl mx-auto text-lg">
            Comprehensive real estate solutions tailored to your unique requirements.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20" data-testid="section-services-list">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="space-y-16">
            {SERVICES.map((s, index) => {
              const Icon = iconMap[s.icon] || Home;
              const details = serviceDetails[s.id] || [];
              const isReverse = index % 2 === 1;

              return (
                <div
                  key={s.id}
                  className={`flex flex-col ${isReverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10`}
                  data-testid={`section-service-${s.id}`}
                >
                  <div className="flex-1">
                    <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold">{s.title}</h2>
                    <p className="text-muted-foreground mt-3 leading-relaxed">{s.description}</p>
                    <ul className="mt-5 space-y-2">
                      {details.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[hsl(160,84%,39%)] shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact">
                      <Button className="mt-6 bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)] font-semibold gap-2" data-testid={`button-service-quote-${s.id}`}>
                        Get a Quote <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex-1 w-full">
                    <Card className="p-8 bg-muted/30">
                      <div className="flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center">
                          <Icon className="w-16 h-16 text-primary/40" />
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[hsl(222,47%,11%)]" data-testid="section-services-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-white">Need a Custom Solution?</h2>
          <p className="text-gray-400 mt-3 max-w-lg mx-auto">
            Our team is ready to create a tailored real estate plan for your specific needs.
          </p>
          <Link href="/contact">
            <Button size="lg" className="mt-6 bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)] font-semibold gap-2" data-testid="button-services-cta">
              Get in Touch <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
