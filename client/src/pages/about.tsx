import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { COMPANY, TEAM } from "@/lib/constants";
import { ArrowRight, Target, Shield, Heart, Award } from "lucide-react";

const values = [
  { icon: Target, title: "Excellence", description: "We strive for the highest standards in every interaction and transaction." },
  { icon: Shield, title: "Integrity", description: "Transparent dealings and honest advice form the foundation of our business." },
  { icon: Heart, title: "Client First", description: "Your satisfaction drives every decision we make. Your goals are our priority." },
  { icon: Award, title: "Expertise", description: "Years of market knowledge and industry expertise guide our recommendations." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
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

      {/* Story */}
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

      {/* Why Choose Us */}
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

      {/* Team */}
      <section className="py-20" data-testid="section-team">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[hsl(45,93%,47%)] uppercase tracking-wider">Our Team</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-1">Meet the Experts</h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              A dedicated team of professionals committed to delivering exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((m) => (
              <Card key={m.name} className="p-6 text-center" data-testid={`card-team-${m.name.toLowerCase().replace(/\s/g, "-")}`}>
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {m.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{m.name}</h3>
                <p className="text-sm text-[hsl(45,93%,47%)] font-medium">{m.role}</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{m.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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
