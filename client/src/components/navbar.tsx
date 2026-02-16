import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Phone } from "lucide-react";
import { COMPANY } from "@/lib/constants";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isHome = location === "/";
  const showTransparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showTransparent
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur-md border-b"
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
        <Link href="/" data-testid="link-home-logo">
          <img
            src="/images/logo.png"
            alt="Qanzak Global Properties"
            className="h-10 sm:h-12 w-auto object-contain"
            data-testid="img-logo"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" data-testid="nav-desktop">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}>
              <Button
                variant="ghost"
                className={`text-sm font-medium ${
                  showTransparent
                    ? "text-white/90 hover:text-white"
                    : location === l.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
                data-testid={`link-nav-${l.label.toLowerCase()}`}
              >
                {l.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a href={`tel:${COMPANY.phone}`}>
            <Button variant="outline" className={`gap-2 ${showTransparent ? "border-white/30 text-white bg-white/10 backdrop-blur-sm" : ""}`} data-testid="button-call">
              <Phone className="w-4 h-4" />
              <span className="hidden xl:inline">{COMPANY.phone}</span>
              <span className="xl:hidden">Call Us</span>
            </Button>
          </a>
          <Link href="/contact">
            <Button className="bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)] font-semibold" data-testid="button-get-quote">
              Get a Quote
            </Button>
          </Link>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
              <Menu className={`w-5 h-5 ${showTransparent ? "text-white" : ""}`} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-6">
            <nav className="flex flex-col gap-1 mt-8">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-base ${location === l.href ? "bg-accent" : ""}`}
                    data-testid={`link-mobile-${l.label.toLowerCase()}`}
                  >
                    {l.label}
                  </Button>
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                <a href={`tel:${COMPANY.phone}`}>
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="w-4 h-4" />
                    {COMPANY.phone}
                  </Button>
                </a>
                <Link href="/contact" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)] font-semibold">
                    Get a Quote
                  </Button>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
