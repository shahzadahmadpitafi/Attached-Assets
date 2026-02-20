import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COMPANY, TEAM } from "@/lib/constants";
import { Download, FileImage, CreditCard, FileText, Megaphone, ArrowLeft, Package, MapPin, Star, Check, Phone, Mail, Globe } from "lucide-react";

const LOGO_WHITE = "/images/logo-white.svg";
const LOGO_PRIMARY = "/images/logo-primary.svg";
const LOGO_ICON = "/images/logo-icon.svg";

type MaterialType = "social" | "card" | "brochure" | "flyer";
type SocialTemplate = "property" | "service" | "testimonial" | "tips" | "announcement";

const SOCIAL_TEMPLATES: { id: SocialTemplate; label: string; description: string }[] = [
  { id: "property", label: "Property Listing", description: "Showcase a property for sale or rent" },
  { id: "service", label: "Service Promotion", description: "Promote company services" },
  { id: "testimonial", label: "Client Testimonial", description: "Share client reviews" },
  { id: "tips", label: "Tips & Advice", description: "Educational real estate tips" },
  { id: "announcement", label: "Announcement", description: "Company news or offers" },
];

const CONTACT_PERSONS = TEAM.map(t => ({ name: t.name, role: t.role, email: t.email }));

const EXPORT_SCALES: Record<MaterialType, number> = {
  social: 4,
  card: 4,
  brochure: 3,
  flyer: 3,
};

interface SocialFormData {
  template: SocialTemplate;
  title: string;
  subtitle: string;
  location: string;
  price: string;
  features: string;
  contactPerson: number;
  ctaText: string;
  bgColor: string;
}

interface CardFormData {
  personIndex: number;
}

interface BrochureFormData {
  type: "company" | "property";
}

interface FlyerFormData {
  title: string;
  subtitle: string;
  price: string;
  features: string;
  contactPerson: number;
}

export default function MarketingGenerator() {
  const [activeType, setActiveType] = useState<MaterialType | null>(null);
  const [socialForm, setSocialForm] = useState<SocialFormData>({
    template: "property",
    title: "LUXURY VILLA FOR SALE",
    subtitle: "Your Dream Home Awaits!",
    location: "DHA Phase 2, Islamabad",
    price: "PKR 8.5 Crore",
    features: "5 Bedrooms | 6 Bathrooms\n1 Kanal (500 Sq. Yards)\nModern Kitchen | Private Garden\nCovered Parking for 4 Cars\n24/7 Security | Prime Location",
    contactPerson: 1,
    ctaText: "Contact Us Today!",
    bgColor: "#1e40af",
  });
  const [cardForm, setCardForm] = useState<CardFormData>({ personIndex: 0 });
  const [brochureForm, setBrochureForm] = useState<BrochureFormData>({ type: "company" });
  const [flyerForm, setFlyerForm] = useState<FlyerFormData>({
    title: "EXCLUSIVE PROPERTY LAUNCH",
    subtitle: "LUXURY APARTMENTS IN BAHRIA TOWN",
    price: "Starting from PKR 1.8 Crore",
    features: "2 & 3 Bedroom Options\nModern Architecture\nCovered Parking\n24/7 Security\nNear All Amenities",
    contactPerson: 1,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const captureCanvas = useCallback(async () => {
    if (!previewRef.current) return null;
    const html2canvas = (await import("html2canvas")).default;
    const scale = activeType ? EXPORT_SCALES[activeType] : 2;
    return html2canvas(previewRef.current, {
      scale,
      useCORS: true,
      backgroundColor: null,
      width: previewRef.current.scrollWidth,
      height: previewRef.current.scrollHeight,
    });
  }, [activeType]);

  const downloadAsPNG = useCallback(async () => {
    setIsGenerating(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `qanzak-${activeType}-design.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (e) {
      console.error("PNG generation failed:", e);
    }
    setIsGenerating(false);
  }, [activeType, captureCanvas]);

  const downloadAsJPG = useCallback(async () => {
    setIsGenerating(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `qanzak-${activeType}-design.jpg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, "image/jpeg", 0.95);
    } catch (e) {
      console.error("JPG generation failed:", e);
    }
    setIsGenerating(false);
  }, [activeType, captureCanvas]);

  const downloadAsPDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const { jsPDF } = await import("jspdf");
      const imgData = canvas.toDataURL("image/png");
      const w = canvas.width;
      const h = canvas.height;
      const orientation = w > h ? "landscape" : "portrait";
      const pdf = new jsPDF({ orientation, unit: "px", format: [w, h] });
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`qanzak-${activeType}-design.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
    }
    setIsGenerating(false);
  }, [activeType, captureCanvas]);

  const downloadAllZIP = useCallback(async () => {
    setIsGenerating(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const pngBlob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b)));
      if (pngBlob) zip.file(`qanzak-${activeType}-design.png`, pngBlob);

      const jpgBlob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.95));
      if (jpgBlob) zip.file(`qanzak-${activeType}-design.jpg`, jpgBlob);

      const { jsPDF } = await import("jspdf");
      const imgData = canvas.toDataURL("image/png");
      const w = canvas.width;
      const h = canvas.height;
      const orientation = w > h ? "landscape" : "portrait";
      const pdf = new jsPDF({ orientation, unit: "px", format: [w, h] });
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      const pdfBlob = pdf.output("blob");
      zip.file(`qanzak-${activeType}-design.pdf`, pdfBlob);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.download = `qanzak-${activeType}-package.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("ZIP generation failed:", e);
    }
    setIsGenerating(false);
  }, [activeType, captureCanvas]);

  const contact = CONTACT_PERSONS[socialForm.contactPerson] || CONTACT_PERSONS[0];
  const flyerContact = CONTACT_PERSONS[flyerForm.contactPerson] || CONTACT_PERSONS[0];
  const cardPerson = TEAM[cardForm.personIndex] || TEAM[0];

  if (!activeType) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3" data-testid="text-page-title" style={{ fontFamily: "Playfair Display, serif" }}>
              Marketing Materials Generator
            </h1>
            <p className="text-muted-foreground text-lg" data-testid="text-page-subtitle">
              {COMPANY.name} - Create & download professional designs instantly
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card
              className="p-8 cursor-pointer hover-elevate text-center"
              onClick={() => setActiveType("social")}
              data-testid="card-social-media"
            >
              <FileImage className="w-12 h-12 mx-auto mb-4" style={{ color: "#1e40af" }} />
              <h2 className="text-xl font-bold mb-2" data-testid="text-social-title">Social Media Posts</h2>
              <p className="text-muted-foreground text-sm">Generate Instagram/Facebook posts (1080x1080)</p>
            </Card>
            <Card
              className="p-8 cursor-pointer hover-elevate text-center"
              onClick={() => setActiveType("card")}
              data-testid="card-business-cards"
            >
              <CreditCard className="w-12 h-12 mx-auto mb-4" style={{ color: "#d4af37" }} />
              <h2 className="text-xl font-bold mb-2" data-testid="text-cards-title">Business Cards</h2>
              <p className="text-muted-foreground text-sm">Professional cards for all team members</p>
            </Card>
            <Card
              className="p-8 cursor-pointer hover-elevate text-center"
              onClick={() => setActiveType("brochure")}
              data-testid="card-brochures"
            >
              <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: "#1e40af" }} />
              <h2 className="text-xl font-bold mb-2" data-testid="text-brochures-title">Brochures</h2>
              <p className="text-muted-foreground text-sm">Company profile & property brochures</p>
            </Card>
            <Card
              className="p-8 cursor-pointer hover-elevate text-center"
              onClick={() => setActiveType("flyer")}
              data-testid="card-flyers"
            >
              <Megaphone className="w-12 h-12 mx-auto mb-4" style={{ color: "#d4af37" }} />
              <h2 className="text-xl font-bold mb-2" data-testid="text-flyers-title">Flyers</h2>
              <p className="text-muted-foreground text-sm">Promotional property launch flyers</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setActiveType(null)} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold" data-testid="text-generator-title" style={{ fontFamily: "Playfair Display, serif" }}>
            {activeType === "social" && "Social Media Post Generator"}
            {activeType === "card" && "Business Card Generator"}
            {activeType === "brochure" && "Brochure Generator"}
            {activeType === "flyer" && "Flyer Generator"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Customize</h3>

              {activeType === "social" && (
                <div className="space-y-3">
                  <div>
                    <Label>Template</Label>
                    <Select value={socialForm.template} onValueChange={(v) => setSocialForm(p => ({ ...p, template: v as SocialTemplate }))}>
                      <SelectTrigger data-testid="select-template"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SOCIAL_TEMPLATES.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input value={socialForm.title} onChange={(e) => setSocialForm(p => ({ ...p, title: e.target.value }))} data-testid="input-title" />
                  </div>
                  <div>
                    <Label>Subtitle / CTA</Label>
                    <Input value={socialForm.subtitle} onChange={(e) => setSocialForm(p => ({ ...p, subtitle: e.target.value }))} data-testid="input-subtitle" />
                  </div>
                  {(socialForm.template === "property" || socialForm.template === "announcement") && (
                    <>
                      <div>
                        <Label>Location</Label>
                        <Input value={socialForm.location} onChange={(e) => setSocialForm(p => ({ ...p, location: e.target.value }))} data-testid="input-location" />
                      </div>
                      <div>
                        <Label>Price</Label>
                        <Input value={socialForm.price} onChange={(e) => setSocialForm(p => ({ ...p, price: e.target.value }))} data-testid="input-price" />
                      </div>
                    </>
                  )}
                  <div>
                    <Label>Features (one per line)</Label>
                    <Textarea value={socialForm.features} onChange={(e) => setSocialForm(p => ({ ...p, features: e.target.value }))} rows={5} data-testid="textarea-features" />
                  </div>
                  <div>
                    <Label>Contact Person</Label>
                    <Select value={String(socialForm.contactPerson)} onValueChange={(v) => setSocialForm(p => ({ ...p, contactPerson: Number(v) }))}>
                      <SelectTrigger data-testid="select-contact"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CONTACT_PERSONS.map((c, i) => (
                          <SelectItem key={i} value={String(i)}>{c.name} - {c.role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {activeType === "card" && (
                <div className="space-y-3">
                  <div>
                    <Label>Team Member</Label>
                    <Select value={String(cardForm.personIndex)} onValueChange={(v) => setCardForm({ personIndex: Number(v) })}>
                      <SelectTrigger data-testid="select-card-person"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TEAM.map((t, i) => (
                          <SelectItem key={i} value={String(i)}>{t.name} - {t.role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {activeType === "brochure" && (
                <div className="space-y-3">
                  <div>
                    <Label>Brochure Type</Label>
                    <Select value={brochureForm.type} onValueChange={(v) => setBrochureForm({ type: v as "company" | "property" })}>
                      <SelectTrigger data-testid="select-brochure-type"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Company Profile</SelectItem>
                        <SelectItem value="property">Property Listing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {activeType === "flyer" && (
                <div className="space-y-3">
                  <div>
                    <Label>Title</Label>
                    <Input value={flyerForm.title} onChange={(e) => setFlyerForm(p => ({ ...p, title: e.target.value }))} data-testid="input-flyer-title" />
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Input value={flyerForm.subtitle} onChange={(e) => setFlyerForm(p => ({ ...p, subtitle: e.target.value }))} data-testid="input-flyer-subtitle" />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input value={flyerForm.price} onChange={(e) => setFlyerForm(p => ({ ...p, price: e.target.value }))} data-testid="input-flyer-price" />
                  </div>
                  <div>
                    <Label>Features (one per line)</Label>
                    <Textarea value={flyerForm.features} onChange={(e) => setFlyerForm(p => ({ ...p, features: e.target.value }))} rows={5} data-testid="textarea-flyer-features" />
                  </div>
                  <div>
                    <Label>Contact Person</Label>
                    <Select value={String(flyerForm.contactPerson)} onValueChange={(v) => setFlyerForm(p => ({ ...p, contactPerson: Number(v) }))}>
                      <SelectTrigger data-testid="select-flyer-contact"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CONTACT_PERSONS.map((c, i) => (
                          <SelectItem key={i} value={String(i)}>{c.name} - {c.role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-4">Download</h3>
              <div className="space-y-2">
                <Button className="w-full" onClick={downloadAsPNG} disabled={isGenerating} data-testid="button-download-png">
                  <Download className="w-4 h-4 mr-2" /> Download PNG
                </Button>
                <Button className="w-full" variant="outline" onClick={downloadAsJPG} disabled={isGenerating} data-testid="button-download-jpg">
                  <Download className="w-4 h-4 mr-2" /> Download JPG
                </Button>
                <Button className="w-full" variant="outline" onClick={downloadAsPDF} disabled={isGenerating} data-testid="button-download-pdf">
                  <FileText className="w-4 h-4 mr-2" /> Download PDF
                </Button>
                <Button className="w-full" variant="outline" onClick={downloadAllZIP} disabled={isGenerating} data-testid="button-download-zip">
                  <Package className="w-4 h-4 mr-2" /> Download All (ZIP)
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Live Preview</h3>
              <div className="flex justify-center overflow-auto bg-muted/30 rounded-md p-4">
                <div
                  ref={previewRef}
                  style={{
                    width: activeType === "card" ? 525 : activeType === "flyer" ? 420 : activeType === "brochure" ? 595 : 540,
                    height: activeType === "card" ? 300 : activeType === "flyer" ? 595 : activeType === "brochure" ? 842 : 540,
                    flexShrink: 0,
                    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
                    overflow: "hidden",
                  }}
                >
                  {activeType === "social" && <SocialPostPreview form={socialForm} contact={contact} />}
                  {activeType === "card" && <BusinessCardPreview person={cardPerson} />}
                  {activeType === "brochure" && <BrochurePreview type={brochureForm.type} />}
                  {activeType === "flyer" && <FlyerPreview form={flyerForm} contact={flyerContact} />}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialPostPreview({ form, contact }: { form: SocialFormData; contact: typeof CONTACT_PERSONS[0] }) {
  const features = form.features.split("\n").filter(Boolean);

  if (form.template === "testimonial") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#0f172a", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 40, color: "#fff", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "#d4af37" }} />
        <img src={LOGO_WHITE} alt="Qanzak Global Properties" style={{ height: 36, marginBottom: 20 }} data-testid="img-preview-logo" />
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }} data-testid="text-preview-rating">
          {[1,2,3,4,5].map(i => <Star key={i} style={{ width: 20, height: 20, color: "#d4af37", fill: "#d4af37" }} />)}
        </div>
        <div style={{ fontSize: 50, color: "#d4af37", opacity: 0.3, lineHeight: 1, marginBottom: 4 }}>&ldquo;</div>
        <p style={{ fontSize: 16, lineHeight: 1.7, textAlign: "center", maxWidth: 420, marginBottom: 20, color: "#e2e8f0" }} data-testid="text-preview-quote">
          {form.features || "Qanzak Global Properties helped us find our dream home in F-11 within just 2 weeks! Muhammad Naushad and his team were incredibly professional, responsive, and patient with all our questions. Highly recommended!"}
        </p>
        <div style={{ fontSize: 50, color: "#d4af37", opacity: 0.3, lineHeight: 1, transform: "rotate(180deg)", marginBottom: 16 }}>&ldquo;</div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#d4af37" }} data-testid="text-preview-title">{form.title || "Mr. Ahmed Khan"}</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 24 }} data-testid="text-preview-subtitle">{form.subtitle || "Proud Homeowner, F-11 Islamabad"}</div>
        <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center" }} data-testid="text-preview-contact">
          +92 331 1479800 | info@qanzakglobal.com<br />properties.qanzakglobal.com
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "#d4af37" }} />
      </div>
    );
  }

  if (form.template === "tips") {
    const tips = features.length > 0 ? features : [
      "Set Your Budget Realistically",
      "Research the Location Thoroughly",
      "Inspect the Property Professionally",
      "Verify All Legal Documents",
      "Work with Trusted Professionals",
    ];
    return (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1e40af 0%, #0f172a 100%)", display: "flex", flexDirection: "column", padding: 36, color: "#fff", position: "relative" }}>
        <img src={LOGO_WHITE} alt="Qanzak Global Properties" style={{ height: 28, alignSelf: "flex-start", marginBottom: 8 }} data-testid="img-preview-logo" />
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }} data-testid="text-preview-title">{form.title || "5 ESSENTIAL TIPS FOR HOME BUYERS"}</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }} data-testid="text-preview-features">
          {tips.slice(0, 5).map((tip, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#d4af37", color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 13, lineHeight: 1.5, paddingTop: 6 }}>{tip}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(212,175,55,0.3)", paddingTop: 16, marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }} data-testid="text-preview-contact">
          <div style={{ fontSize: 11, color: "#94a3b8" }}>+92 331 1479800<br />info@qanzakglobal.com</div>
          <div style={{ fontSize: 11, color: "#d4af37", fontWeight: 600 }}>properties.qanzakglobal.com</div>
        </div>
      </div>
    );
  }

  if (form.template === "service") {
    return (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg, #1e40af 0%, #0f172a 100%)", display: "flex", flexDirection: "column", padding: 36, color: "#fff", position: "relative" }}>
        <img src={LOGO_WHITE} alt="Qanzak Global Properties" style={{ height: 28, alignSelf: "flex-start", marginBottom: 12 }} data-testid="img-preview-logo" />
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }} data-testid="text-preview-title">{form.title}</div>
        <div style={{ fontSize: 14, color: "#d4af37", marginBottom: 20 }} data-testid="text-preview-subtitle">{form.subtitle}</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }} data-testid="text-preview-features">
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <Check style={{ width: 16, height: 16, color: "#d4af37", flexShrink: 0 }} />
              {f}
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 16, marginTop: 16 }} data-testid="text-preview-contact">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{contact.name}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{contact.role}</div>
          <div style={{ fontSize: 11, color: "#e2e8f0" }}>+92 331 1479800 | info@qanzakglobal.com | properties.qanzakglobal.com</div>
        </div>
      </div>
    );
  }

  if (form.template === "announcement") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#0f172a", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 40, color: "#fff", position: "relative", textAlign: "center" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "#d4af37" }} />
        <img src={LOGO_WHITE} alt="Qanzak Global Properties" style={{ height: 36, marginBottom: 20 }} data-testid="img-preview-logo" />
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, lineHeight: 1.2, maxWidth: 440 }} data-testid="text-preview-title">{form.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 16, color: "#d4af37", marginBottom: 20, fontWeight: 600 }} data-testid="text-preview-location">
          <MapPin style={{ width: 16, height: 16 }} /> {form.location}
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#d4af37", marginBottom: 24 }} data-testid="text-preview-price">{form.price}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24, fontSize: 13 }} data-testid="text-preview-features">
          {features.slice(0, 5).map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
              <Check style={{ width: 14, height: 14, color: "#d4af37" }} /> {f}
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(212,175,55,0.15)", borderRadius: 10, padding: 14, fontSize: 12, width: "80%" }} data-testid="text-preview-contact">
          {contact.name} | +92 331 1479800 | info@qanzakglobal.com
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "#d4af37" }} />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${form.bgColor} 0%, #0f172a 100%)`, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 36, color: "#fff", position: "relative" }}>
      <div>
        <img src={LOGO_WHITE} alt="Qanzak Global Properties" style={{ height: 28, marginBottom: 16 }} data-testid="img-preview-logo" />
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }} data-testid="text-preview-title">{form.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#d4af37", marginBottom: 16 }} data-testid="text-preview-location">
          <MapPin style={{ width: 14, height: 14 }} /> {form.location}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }} data-testid="text-preview-features">
        {features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#d4af37", flexShrink: 0 }} />
            {f}
          </div>
        ))}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#d4af37", marginBottom: 12 }} data-testid="text-preview-price">{form.price}</div>
        <div style={{ fontSize: 14, marginBottom: 16 }} data-testid="text-preview-subtitle">{form.subtitle}</div>
        <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: 14 }} data-testid="text-preview-contact">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{contact.name}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{contact.role}</div>
          <div style={{ fontSize: 11 }}>+92 331 1479800 | info@qanzakglobal.com<br />properties.qanzakglobal.com</div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: "#d4af37" }} />
    </div>
  );
}

function BusinessCardPreview({ person }: { person: typeof TEAM[0] }) {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", position: "relative", fontFamily: "'Inter', Arial, sans-serif" }}>
      <div style={{ height: 8, background: "#d4af37" }} />
      <div style={{ flex: 1, padding: "20px 28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <img src={LOGO_PRIMARY} alt="Qanzak Global Properties" style={{ height: 50, marginBottom: 10 }} data-testid="img-preview-logo" />
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1f2937", marginBottom: 2 }} data-testid="text-preview-name">{person.name}</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 16 }} data-testid="text-preview-role">{person.role}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 10, color: "#374151" }} data-testid="text-preview-contact">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Phone style={{ width: 10, height: 10, color: "#1e40af" }} /> +92 331 1479800</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail style={{ width: 10, height: 10, color: "#1e40af" }} /> {person.email}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Globe style={{ width: 10, height: 10, color: "#1e40af" }} /> properties.qanzakglobal.com</div>
          <div style={{ color: "#6b7280", marginTop: 4, fontSize: 9 }}>House 66, F-11/1, Islamabad, Pakistan</div>
        </div>
      </div>
      <div style={{ height: 4, background: "#1e40af" }} />
    </div>
  );
}

function BrochurePreview({ type }: { type: "company" | "property" }) {
  if (type === "property") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ background: "linear-gradient(180deg, #1e40af, #0f172a)", flex: "0 0 45%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#fff", padding: 40, textAlign: "center" }}>
          <img src={LOGO_WHITE} alt="Qanzak Global Properties" style={{ height: 40, marginBottom: 20 }} data-testid="img-preview-logo" />
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }} data-testid="text-preview-title">EXCLUSIVE PROPERTY</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>LISTING</div>
          <div style={{ width: 60, height: 2, background: "#d4af37", marginBottom: 16 }} />
          <div style={{ fontSize: 13, color: "#cbd5e1" }}>Premium Properties in Islamabad & Lahore</div>
        </div>
        <div style={{ flex: 1, padding: 40, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1e40af", marginBottom: 16 }}>FEATURED PROPERTY</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12, color: "#374151" }} data-testid="text-preview-details">
              <div><b>Type:</b> Luxury Villa</div>
              <div><b>Location:</b> DHA Phase 2</div>
              <div><b>Bedrooms:</b> 5</div>
              <div><b>Bathrooms:</b> 6</div>
              <div><b>Area:</b> 1 Kanal</div>
              <div><b>Price:</b> PKR 8.5 Crore</div>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
              A stunning luxury villa featuring modern architecture, private garden, covered parking for 4 cars, 24/7 security, and prime location access.
            </div>
          </div>
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 10, color: "#6b7280" }} data-testid="text-preview-contact">
            <div>+92 331 1479800 | info@qanzakglobal.com</div>
            <div style={{ color: "#1e40af", fontWeight: 700 }}>properties.qanzakglobal.com</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ background: "linear-gradient(180deg, #1e40af, #0f172a)", flex: "0 0 35%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#fff", padding: 40, textAlign: "center" }}>
        <img src={LOGO_WHITE} alt="Qanzak Global Properties" style={{ height: 44, marginBottom: 16 }} data-testid="img-preview-logo" />
        <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 4 }} data-testid="text-preview-title">QANZAK GLOBAL</div>
        <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>PROPERTIES</div>
        <div style={{ width: 60, height: 2, background: "#d4af37", marginBottom: 12 }} />
        <div style={{ fontSize: 14, color: "#d4af37" }}>Your Trusted Real Estate Partner</div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>Islamabad | Lahore</div>
      </div>
      <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1e40af", marginBottom: 12 }}>WHO WE ARE</div>
          <p style={{ fontSize: 11, lineHeight: 1.7, color: "#374151", marginBottom: 20 }}>
            Qanzak Global Properties is a premier real estate company serving Islamabad and Lahore. With over 15 years of industry experience, we have helped thousands of clients find their dream properties and make sound investment decisions.
          </p>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1e40af", marginBottom: 10 }}>OUR SERVICES</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 10, color: "#374151" }} data-testid="text-preview-services">
            {["Property Sales", "Property Rentals", "Property Maintenance", "Property Management", "Real Estate Consultation", "Investment Opportunities"].map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Check style={{ width: 10, height: 10, color: "#d4af37" }} /> {s}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, fontSize: 14, fontWeight: 700, color: "#1e40af", marginBottom: 10 }}>OUR TEAM</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 10, color: "#374151" }} data-testid="text-preview-team">
            {TEAM.map(t => (
              <div key={t.name}>
                <div style={{ fontWeight: 700 }}>{t.name}</div>
                <div style={{ color: "#6b7280", fontSize: 9 }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "2px solid #d4af37", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 9, color: "#6b7280" }} data-testid="text-preview-contact">
          <div>House 66, F-11/1, Islamabad<br />+92 331 1479800 | info@qanzakglobal.com</div>
          <div style={{ textAlign: "right", color: "#1e40af", fontWeight: 700, fontSize: 10 }}>properties.qanzakglobal.com</div>
        </div>
      </div>
    </div>
  );
}

function FlyerPreview({ form, contact }: { form: FlyerFormData; contact: typeof CONTACT_PERSONS[0] }) {
  const features = form.features.split("\n").filter(Boolean);
  return (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg, #1e40af 0%, #0f172a 55%, #0f172a 100%)", display: "flex", flexDirection: "column", color: "#fff", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "#d4af37" }} />
      <div style={{ flex: "0 0 40%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: 30 }}>
        <img src={LOGO_WHITE} alt="Qanzak Global Properties" style={{ height: 32, marginBottom: 14 }} data-testid="img-preview-logo" />
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }} data-testid="text-preview-title">{form.title}</div>
        <div style={{ fontSize: 14, color: "#d4af37", fontWeight: 600 }} data-testid="text-preview-subtitle">{form.subtitle}</div>
      </div>
      <div style={{ flex: 1, padding: "0 30px 30px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ background: "rgba(212,175,55,0.15)", borderRadius: 8, padding: 14, textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 4 }}>LIMITED UNITS AVAILABLE!</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#d4af37" }} data-testid="text-preview-price">{form.price}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }} data-testid="text-preview-features">
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Check style={{ width: 14, height: 14, color: "#d4af37", flexShrink: 0 }} /> {f}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ background: "#d4af37", color: "#0f172a", borderRadius: 6, padding: 10, textAlign: "center", fontWeight: 700, fontSize: 12, marginBottom: 14 }}>
            BOOK NOW & SAVE 10% - Early Bird Discount!
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: 12, fontSize: 10, textAlign: "center" }} data-testid="text-preview-contact">
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Contact: {contact.name}</div>
            <div>+92 331 1479800 | WhatsApp Available</div>
            <div>info@qanzakglobal.com | properties.qanzakglobal.com</div>
            <div style={{ marginTop: 6, fontSize: 9, color: "#94a3b8" }}>House 66, F-11/1, Islamabad, Pakistan</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "#d4af37" }} />
    </div>
  );
}
