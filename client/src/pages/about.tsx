import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { COMPANY, TEAM } from "@/lib/constants";
import { ArrowRight, Target, Shield, Heart, Award, Phone, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const values = [
  { icon: Target, title: "Excellence", description: "We strive for the highest standards in every interaction and transaction." },
  { icon: Shield, title: "Integrity", description: "Transparent dealings and honest advice form the foundation of our business." },
  { icon: Heart, title: "Client First", description: "Your satisfaction drives every decision we make. Your goals are our priority." },
  { icon: Award, title: "Expertise", description: "Years of market knowledge and industry expertise guide our recommendations." },
];

export default function AboutPage() {
  const ceo = TEAM[0];
  const rest = TEAM.slice(1);

  return (
    <div className="min-h-screen pt-20">
      <section className="bg-primary py-16" data-testid="section-about-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary-foreground" data-testid="text-about-title">
            About Us
          </h1>
          <p className="text-primary-foreground/80 mt-3 max-w-xl mx-auto text-lg">
            Building trust, delivering excellence since 2009.
          </p>
        </div>
      </section>

      <section className="py-20" data-testid="section-story">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-[hsl(45,93%,47%)] uppercase tracking-wider">Our Story</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-1">
                A Legacy of Trust in Real Estate
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Founded in 2009, Qanzak Global Properties has grown from a small office in Islamabad to one of the most respected real estate firms in Pakistan. Our journey began with a simple mission: to make property transactions transparent, efficient, and rewarding for our clients.
              </p>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Over the past 15+ years, we have helped hundreds of families find their dream homes, guided investors to profitable ventures, and managed properties with the care and attention they deserve. Our deep understanding of the Islamabad and Lahore markets, combined with our commitment to ethical practices, sets us apart.
              </p>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Today, we continue to innovate and expand our services while maintaining the personalized approach that has been the hallmark of our success.
              </p>
            </div>
            <div className="relative">
              <img
                src="/images/office.png"
                alt="Qanzak Global Properties Office"
                className="rounded-md w-full h-80 object-cover"
              />
              <Card className="absolute -bottom-6 -left-6 p-4 bg-primary text-primary-foreground hidden sm:block">
                <p className="text-3xl font-bold">15+</p>
                <p className="text-sm text-primary-foreground/80">Years of Excellence</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30" data-testid="section-why-us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[hsl(45,93%,47%)] uppercase tracking-wider">Why Choose Us</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-1">Our Core Values</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <Card key={v.title} className="p-6 text-center" data-testid={`card-value-${v.title.toLowerCase()}`}>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{v.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{v.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" data-testid="section-team">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[hsl(45,93%,47%)] uppercase tracking-wider">Our Leadership</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-1">Meet the Experts</h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              A dedicated team of professionals committed to delivering exceptional real estate service.
            </p>
          </div>

          <Card className="p-6 sm:p-8 mb-10" data-testid={`card-team-${ceo.name.toLowerCase().replace(/\s/g, "-")}`}>
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <Avatar className="w-32 h-32 flex-shrink-0">
                <AvatarImage src={ceo.photo} alt={ceo.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
                  {ceo.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-serif text-2xl font-bold" data-testid="text-ceo-name">{ceo.name}</h3>
                <p className="text-[hsl(45,93%,47%)] font-semibold">{ceo.role}</p>
                <p className="text-sm text-muted-foreground mt-1">{ceo.department}</p>
                <p className="text-muted-foreground mt-3 leading-relaxed">{ceo.bio}</p>
                <p className="text-sm text-muted-foreground mt-2 italic">{ceo.specialization}</p>
                <div className="flex flex-wrap items-center gap-2 mt-4 justify-center sm:justify-start">
                  <a href={`tel:${ceo.phone}`}>
                    <Button variant="outline" size="sm" className="gap-1.5" data-testid="button-ceo-call">
                      <Phone className="w-3.5 h-3.5" /> Call
                    </Button>
                  </a>
                  <a href={`https://wa.me/${ceo.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="gap-1.5 bg-[#25D366] text-white" data-testid="button-ceo-whatsapp">
                      <SiWhatsapp className="w-3.5 h-3.5" /> WhatsApp
                    </Button>
                  </a>
                  <a href={`mailto:${ceo.email}`}>
                    <Button variant="outline" size="sm" className="gap-1.5" data-testid="button-ceo-email">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((m) => (
              <Card key={m.name} className="p-6" data-testid={`card-team-${m.name.toLowerCase().replace(/\s/g, "-")}`}>
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={m.photo} alt={m.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      {m.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{m.name}</h3>
                  <p className="text-sm text-[hsl(45,93%,47%)] font-medium">{m.role}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.department}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed text-center">{m.bio}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <a href={`tel:${m.phone}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Call
                    </Button>
                  </a>
                  <a href={`https://wa.me/${m.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="gap-1.5 bg-[#25D366] text-white">
                      <SiWhatsapp className="w-3.5 h-3.5" /> WhatsApp
                    </Button>
                  </a>
                  <a href={`mailto:${m.email}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[hsl(222,47%,11%)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-white">Let's Work Together</h2>
          <p className="text-gray-400 mt-3 max-w-lg mx-auto">
            Whether buying, selling, or investing, our team is here to guide you every step of the way.
          </p>
          <Link href="/contact">
            <Button size="lg" className="mt-6 bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)] font-semibold gap-2" data-testid="button-about-cta">
              Contact Us <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
