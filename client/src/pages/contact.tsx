import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { COMPANY, SERVICES } from "@/lib/constants";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { apiRequest } from "@/lib/queryClient";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";

const contactSchema = insertInquirySchema.extend({
  name: insertInquirySchema.shape.name.min(2, "Name must be at least 2 characters"),
  email: insertInquirySchema.shape.email.email("Please enter a valid email"),
  message: insertInquirySchema.shape.message.min(10, "Message must be at least 10 characters"),
});

type ContactForm = InsertInquiry;

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", service: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: ContactForm) => apiRequest("POST", "/api/inquiries", data),
    onSuccess: () => {
      toast({ title: "Message Sent!", description: "We'll get back to you within 24 hours." });
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    },
  });

  const onSubmit = (data: ContactForm) => mutation.mutate(data);

  const whatsappUrl = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(COMPANY.whatsappMessage)}`;

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="bg-primary py-16" data-testid="section-contact-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary-foreground" data-testid="text-contact-title">
            Contact Us
          </h1>
          <p className="text-primary-foreground/80 mt-3 max-w-xl mx-auto text-lg">
            We'd love to hear from you. Reach out to us through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Cards + Form */}
      <section className="py-20" data-testid="section-contact-form">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Info Column */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold">Get in Touch</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Have a question about a property or need expert advice? Our team is ready to help.
                </p>
              </div>

              <Card className="p-5" data-testid="card-contact-info">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Office Address</p>
                      <p className="text-sm text-muted-foreground">{COMPANY.address}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <a href={`tel:${COMPANY.phone}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{COMPANY.phone}</a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <a href={`mailto:${COMPANY.email}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{COMPANY.email}</a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Business Hours</p>
                      <p className="text-sm text-muted-foreground">{COMPANY.hours}</p>
                    </div>
                  </li>
                </ul>
              </Card>

              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-2 bg-[#25D366] text-white" data-testid="button-whatsapp-contact">
                  <SiWhatsapp className="w-5 h-5" />
                  Chat on WhatsApp
                </Button>
              </a>
            </div>

            {/* Form Column */}
            <Card className="lg:col-span-3 p-6 sm:p-8" data-testid="card-contact-form">
              <h3 className="font-serif text-xl font-bold mb-6">Send Us a Message</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="+92 xxx xxxxxxx" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Interested In</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-service">
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SERVICES.map((s) => (
                                <SelectItem key={s.id} value={s.title}>{s.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your requirements..."
                            className="resize-none min-h-[120px]"
                            {...field}
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)] font-semibold gap-2"
                    disabled={mutation.isPending}
                    data-testid="button-submit"
                  >
                    {mutation.isPending ? (
                      "Sending..."
                    ) : mutation.isSuccess ? (
                      <><CheckCircle className="w-4 h-4" /> Sent!</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Message</>
                    )}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="pb-0" data-testid="section-map">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
          <h2 className="font-serif text-2xl font-bold mb-4">Our Location</h2>
        </div>
        <iframe
          src={COMPANY.mapEmbed}
          className="w-full h-[400px] border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Qanzak Global Properties Office Location"
          data-testid="map-embed"
        />
      </section>
    </div>
  );
}
