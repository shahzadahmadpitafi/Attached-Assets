import { Link } from "wouter";
import { COMPANY } from "@/lib/constants";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { SiFacebook, SiInstagram, SiLinkedin } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-[hsl(222,47%,11%)] text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <img src="/images/logo-white.svg" alt="Qanzak Global Properties" className="h-16 w-auto object-contain" data-testid="img-footer-logo" />
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Premium real estate solutions in Islamabad and Lahore. We help you find the perfect property for your needs.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href={COMPANY.social.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md bg-white/10 flex items-center justify-center hover-elevate" data-testid="link-facebook">
                <SiFacebook className="w-4 h-4" />
              </a>
              <a href={COMPANY.social.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md bg-white/10 flex items-center justify-center hover-elevate" data-testid="link-instagram">
                <SiInstagram className="w-4 h-4" />
              </a>
              <a href={COMPANY.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md bg-white/10 flex items-center justify-center hover-elevate" data-testid="link-linkedin">
                <SiLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-[hsl(45,93%,47%)]">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/services", label: "Services" },
                { href: "/properties", label: "Properties" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors" data-testid={`link-footer-${l.label.toLowerCase().replace(/\s/g, "-")}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-[hsl(45,93%,47%)]">Services</h3>
            <ul className="space-y-2">
              {["Property Sales", "Property Rentals", "Maintenance", "Property Management", "Consultation", "Investment"].map((s) => (
                <li key={s}>
                  <Link href="/services" className="text-sm text-gray-400 hover:text-white transition-colors" data-testid={`link-footer-service-${s.toLowerCase().replace(/\s/g, "-")}`}>
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-[hsl(45,93%,47%)]">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[hsl(45,93%,47%)]" />
                {COMPANY.address}
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 shrink-0 text-[hsl(45,93%,47%)]" />
                <a href={`tel:${COMPANY.phone}`} className="hover:text-white transition-colors" data-testid="link-footer-phone">{COMPANY.phone}</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 shrink-0 text-[hsl(45,93%,47%)]" />
                <a href={`mailto:${COMPANY.email}`} className="hover:text-white transition-colors" data-testid="link-footer-email">{COMPANY.email}</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Clock className="w-4 h-4 shrink-0 text-[hsl(45,93%,47%)]" />
                {COMPANY.hours}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500" data-testid="text-copyright">
            &copy; {new Date().getFullYear()} Qanzak Global Properties. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer transition-colors" data-testid="link-privacy">Privacy Policy</span>
            <span className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer transition-colors" data-testid="link-terms">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
