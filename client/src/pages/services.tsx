import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SERVICES, COMPANY } from "@/lib/constants";
import { Home, Key, Wrench, Building2, MessageSquare, TrendingUp, ArrowRight, Check, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

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

const serviceStats: Record<string, { value: string; label: string }[]> = {
  sales: [
    { value: "500+", label: "Properties Sold" },
    { value: "98%", label: "Client Satisfaction" },
  ],
  rentals: [
    { value: "200+", label: "Active Rentals" },
    { value: "48hr", label: "Avg. Listing Time" },
  ],
  maintenance: [
    { value: "24/7", label: "Emergency Support" },
    { value: "1000+", label: "Jobs Completed" },
  ],
  management: [
    { value: "150+", label: "Properties Managed" },
    { value: "15yr", label: "Experience" },
  ],
  consultation: [
    { value: "300+", label: "Consultations" },
    { value: "95%", label: "Success Rate" },
  ],
  investment: [
    { value: "25%+", label: "Avg. ROI" },
    { value: "100+", label: "Investors Served" },
  ],
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Header */}
      <section className="relative py-20 overflow-hidden" data-testid="section-services-header">
        <div className="absolute inset-0 bg-[hsl(222,47%,11%)]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <Badge className="bg-[hsl(45,93%,47%)]/20 text-[hsl(45,93%,47%)] border-[hsl(45,93%,47%)]/30 mb-4 no-default-hover-elevate no-default-active-elevate">
            Premium Real Estate Solutions
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white" data-testid="text-services-title">
            Our Services
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
            From finding your dream property to managing your investment portfolio,
            we deliver excellence in every real estate solution.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <Link href="/contact">
              <Button size="lg" className="bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)] font-semibold gap-2" data-testid="button-header-quote">
                Get a Free Quote <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href={`tel:${COMPANY.phone}`}>
              <Button size="lg" variant="outline" className="border-white/20 text-white bg-white/5 gap-2" data-testid="button-header-call">
                <Phone className="w-4 h-4" /> Call Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Services - Alternating Layout */}
      <section className="py-20" data-testid="section-services-list">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="space-y-24">
            {SERVICES.map((s, index) => {
              const Icon = iconMap[s.icon] || Home;
              const details = serviceDetails[s.id] || [];
              const stats = serviceStats[s.id] || [];
              const isReverse = index % 2 === 1;

              return (
                <div
                  key={s.id}
                  className={`flex flex-col ${isReverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-stretch gap-10 lg:gap-14`}
                  data-testid={`section-service-${s.id}`}
                >
                  {/* Image Side */}
                  <div className="flex-1 w-full">
                    <div className="relative rounded-md overflow-hidden h-full min-h-[300px] lg:min-h-[400px] group">
                      <img
                        src={s.image}
                        alt={s.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        data-testid={`img-service-${s.id}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(222,47%,11%)]/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-4">
                          {stats.map((st) => (
                            <div key={st.label} className="text-center">
                              <p className="text-2xl font-bold text-white">{st.value}</p>
                              <p className="text-xs text-white/70">{st.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)] font-semibold no-default-hover-elevate no-default-active-elevate">
                          {s.badge}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mb-5">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold" data-testid={`text-service-title-${s.id}`}>
                      {s.title}
                    </h2>
                    <p className="text-muted-foreground mt-3 leading-relaxed text-base">
                      {s.description}
                    </p>

                    <ul className="mt-6 space-y-3">
                      {details.map((d) => (
                        <li key={d} className="flex items-start gap-3 text-sm">
                          <div className="w-5 h-5 rounded-full bg-[hsl(45,93%,47%)]/15 flex items-center justify-center mt-0.5 shrink-0">
                            <Check className="w-3 h-3 text-[hsl(45,93%,47%)]" />
                          </div>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center gap-3 mt-8 flex-wrap">
                      <Link href="/contact">
                        <Button className="bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)] font-semibold gap-2" data-testid={`button-service-quote-${s.id}`}>
                          Get a Quote <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <a href={`https://wa.me/${COMPANY.whatsapp}?text=Hi, I'm interested in your ${s.title} service`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="gap-2" data-testid={`button-service-whatsapp-${s.id}`}>
                          <SiWhatsapp className="w-4 h-4 text-[#25D366]" /> WhatsApp
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[hsl(222,47%,11%)] relative overflow-hidden" data-testid="section-services-cta">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">Need a Custom Solution?</h2>
          <p className="text-gray-400 mt-4 max-w-lg mx-auto text-lg leading-relaxed">
            Our team is ready to create a tailored real estate plan for your specific needs.
            Contact us today for a free, no-obligation consultation.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <Link href="/contact">
              <Button size="lg" className="bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)] font-semibold gap-2" data-testid="button-services-cta">
                Get in Touch <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href={`tel:${COMPANY.phone}`}>
              <Button size="lg" variant="outline" className="border-white/20 text-white bg-white/5 gap-2" data-testid="button-cta-call">
                <Phone className="w-4 h-4" /> {COMPANY.phone}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
