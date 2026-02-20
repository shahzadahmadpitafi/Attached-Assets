import { useState, useCallback, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTeamMemberSchema, type InsertTeamMember, type TeamMember } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2, Plus, Pencil, Trash2, Upload, X, User, ArrowUp, ArrowDown,
  Search, Star, Eye, EyeOff, Phone, Mail, Globe, Briefcase,
} from "lucide-react";

const DEPARTMENTS = [
  "Executive",
  "Sales & Marketing",
  "Property Management & Maintenance",
  "Customer Service & Client Relations",
  "Finance",
  "Legal",
  "Other",
];

const LANGUAGE_OPTIONS = ["English", "Urdu", "Punjabi", "Pashto", "Arabic", "Sindhi", "Other"];

const EXPERTISE_OPTIONS = [
  "Residential Sales",
  "Commercial Properties",
  "Property Management",
  "Investment Consultation",
  "Legal Documentation",
  "Property Valuation",
  "Tenant Relations",
  "Market Analysis",
  "Client Acquisition",
  "After-Sales Support",
];

function PhotoUpload({ currentPhoto, onPhotoChange }: { currentPhoto?: string | null; onPhotoChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Unsupported format. Use JPG, PNG, or WebP.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large (max 5MB)", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const urlRes = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, objectPath } = await urlRes.json();
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      const publicUrl = `/objects/${objectPath}`;
      onPhotoChange(publicUrl);
      toast({ title: "Photo uploaded successfully" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [onPhotoChange, toast]);

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-24 w-24">
        {currentPhoto ? <AvatarImage src={currentPhoto} alt="Team member photo" /> : null}
        <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          data-testid="input-team-photo-file"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          data-testid="button-upload-team-photo"
        >
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {uploading ? "Uploading..." : "Upload Photo"}
        </Button>
        {currentPhoto && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onPhotoChange("")} data-testid="button-remove-team-photo">
            <X className="mr-2 h-4 w-4" /> Remove
          </Button>
        )}
        <p className="text-xs text-muted-foreground">Recommended: 800x800px, square format, Max 5MB</p>
      </div>
    </div>
  );
}

function MultiTagInput({
  values,
  onChange,
  placeholder,
  testId,
}: {
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder: string;
  testId: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {values.map((tag, i) => (
          <Badge key={i} variant="secondary" className="gap-1">
            {tag}
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="ml-1" data-testid={`${testId}-remove-${i}`}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          data-testid={testId}
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag} data-testid={`${testId}-add`}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function TeamMemberForm({ member, onSaved, onCancel }: { member?: TeamMember; onSaved: () => void; onCancel: () => void }) {
  const { toast } = useToast();
  const isEditing = !!member;

  const form = useForm<InsertTeamMember>({
    resolver: zodResolver(insertTeamMemberSchema),
    defaultValues: {
      name: member?.name ?? "",
      role: member?.role ?? "",
      department: member?.department ?? "",
      specialization: member?.specialization ?? "",
      bio: member?.bio ?? "",
      shortBio: member?.shortBio ?? "",
      email: member?.email ?? "",
      phone: member?.phone ?? "",
      whatsapp: member?.whatsapp ?? "",
      photo: member?.photo ?? "",
      sortOrder: member?.sortOrder ?? 0,
      isActive: member?.isActive ?? true,
      education: member?.education ?? "",
      certifications: member?.certifications ?? [],
      languages: member?.languages ?? [],
      expertise: member?.expertise ?? [],
      socialLinkedin: member?.socialLinkedin ?? "",
      socialFacebook: member?.socialFacebook ?? "",
      socialInstagram: member?.socialInstagram ?? "",
      socialTwitter: member?.socialTwitter ?? "",
      statsPropertiesSold: member?.statsPropertiesSold ?? 0,
      statsHappyClients: member?.statsHappyClients ?? 0,
      statsDealsCompleted: member?.statsDealsCompleted ?? 0,
      statsAvgRating: member?.statsAvgRating ?? "0",
      featured: member?.featured ?? false,
      showOnWebsite: member?.showOnWebsite ?? true,
      showOnTeamPage: member?.showOnTeamPage ?? true,
      showOnContactPage: member?.showOnContactPage ?? false,
      yearsOfExperience: member?.yearsOfExperience ?? 0,
      internalNotes: member?.internalNotes ?? "",
      alternatePhone: member?.alternatePhone ?? "",
      officeExtension: member?.officeExtension ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTeamMember) => {
      if (isEditing) return apiRequest("PATCH", `/api/admin/team/${member.id}`, data);
      return apiRequest("POST", "/api/admin/team", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({ title: isEditing ? "Team member updated" : "Team member added" });
      onSaved();
    },
    onError: () => {
      toast({ title: "Failed to save team member", variant: "destructive" });
    },
  });

  const shortBioValue = form.watch("shortBio") ?? "";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <div>
          <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-3">Profile Photo</h3>
          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PhotoUpload currentPhoto={field.value} onPhotoChange={(url) => field.onChange(url)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-3">Basic Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Muhammad Naushad Anjum" data-testid="input-team-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Position / Title *</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. CEO & Founder" data-testid="input-team-role" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="department" render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-team-department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="yearsOfExperience" render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-team-experience"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-3">Contact Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl><Input {...field} type="email" placeholder="name@qanzakglobal.com" data-testid="input-team-email" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} placeholder="+92 331 1479800" data-testid="input-team-phone" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="whatsapp" render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} placeholder="923311479800" data-testid="input-team-whatsapp" /></FormControl>
                  <FormDescription>Without + or spaces</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="alternatePhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Alternate Phone</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} placeholder="+92 300 0000000" data-testid="input-team-alt-phone" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="officeExtension" render={({ field }) => (
                <FormItem>
                  <FormLabel>Office Extension</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} placeholder="101" data-testid="input-team-extension" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-3">Biography & Description</h3>
          <div className="space-y-4">
            <FormField control={form.control} name="shortBio" render={({ field }) => (
              <FormItem>
                <FormLabel>Short Bio</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ""} placeholder="One-line summary for cards..." rows={2} maxLength={150} data-testid="input-team-short-bio" />
                </FormControl>
                <FormDescription>{shortBioValue.length}/150 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bio" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Biography</FormLabel>
                <FormControl><Textarea {...field} value={field.value ?? ""} placeholder="Detailed biography..." rows={5} data-testid="input-team-bio" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="specialization" render={({ field }) => (
              <FormItem>
                <FormLabel>Specialization</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="e.g. Property Sales, Investment" data-testid="input-team-specialization" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-3">Professional Details</h3>
          <div className="space-y-4">
            <FormField control={form.control} name="education" render={({ field }) => (
              <FormItem>
                <FormLabel>Education</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="e.g. MBA from LUMS" data-testid="input-team-education" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="certifications" render={({ field }) => (
              <FormItem>
                <FormLabel>Certifications</FormLabel>
                <FormControl>
                  <MultiTagInput
                    values={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Add certification and press Enter..."
                    testId="input-team-certifications"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="languages" render={({ field }) => (
              <FormItem>
                <FormLabel>Languages Spoken</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-3">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <label key={lang} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <Checkbox
                          checked={(field.value ?? []).includes(lang)}
                          onCheckedChange={(checked) => {
                            const current = field.value ?? [];
                            field.onChange(checked ? [...current, lang] : current.filter(l => l !== lang));
                          }}
                          data-testid={`checkbox-lang-${lang.toLowerCase()}`}
                        />
                        {lang}
                      </label>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="expertise" render={({ field }) => (
              <FormItem>
                <FormLabel>Areas of Expertise</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPERTISE_OPTIONS.map((exp) => (
                      <label key={exp} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <Checkbox
                          checked={(field.value ?? []).includes(exp)}
                          onCheckedChange={(checked) => {
                            const current = field.value ?? [];
                            field.onChange(checked ? [...current, exp] : current.filter(e => e !== exp));
                          }}
                          data-testid={`checkbox-expertise-${exp.toLowerCase().replace(/\s+/g, "-")}`}
                        />
                        {exp}
                      </label>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-3">Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="socialLinkedin" render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="https://linkedin.com/in/username" data-testid="input-team-linkedin" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="socialFacebook" render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="https://facebook.com/username" data-testid="input-team-facebook" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="socialInstagram" render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="@username" data-testid="input-team-instagram" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="socialTwitter" render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter / X</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="@username" data-testid="input-team-twitter" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-3">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="statsPropertiesSold" render={({ field }) => (
              <FormItem>
                <FormLabel>Properties Sold</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? 0} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} data-testid="input-team-properties-sold" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="statsHappyClients" render={({ field }) => (
              <FormItem>
                <FormLabel>Happy Clients</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? 0} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} data-testid="input-team-happy-clients" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="statsDealsCompleted" render={({ field }) => (
              <FormItem>
                <FormLabel>Deals Completed</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? 0} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} data-testid="input-team-deals-completed" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="statsAvgRating" render={({ field }) => (
              <FormItem>
                <FormLabel>Avg Rating (0-5)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={5} step={0.1} {...field} value={field.value ?? "0"} onChange={(e) => field.onChange(e.target.value)} data-testid="input-team-avg-rating" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-3">Display Settings</h3>
          <div className="space-y-4">
            <FormField control={form.control} name="sortOrder" render={({ field }) => (
              <FormItem>
                <FormLabel>Display Order</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? 0} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} data-testid="input-team-sort-order" />
                </FormControl>
                <FormDescription>1 = first, 2 = second, etc.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch checked={field.value ?? true} onCheckedChange={field.onChange} data-testid="switch-team-active" />
                  </FormControl>
                  <FormLabel className="mb-0">Active</FormLabel>
                </FormItem>
              )} />
              <FormField control={form.control} name="featured" render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch checked={field.value ?? false} onCheckedChange={field.onChange} data-testid="switch-team-featured" />
                  </FormControl>
                  <FormLabel className="mb-0">Featured</FormLabel>
                </FormItem>
              )} />
              <FormField control={form.control} name="showOnWebsite" render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch checked={field.value ?? true} onCheckedChange={field.onChange} data-testid="switch-team-show-website" />
                  </FormControl>
                  <FormLabel className="mb-0">Show on Website</FormLabel>
                </FormItem>
              )} />
              <FormField control={form.control} name="showOnTeamPage" render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch checked={field.value ?? true} onCheckedChange={field.onChange} data-testid="switch-team-show-team" />
                  </FormControl>
                  <FormLabel className="mb-0">Show on Team Page</FormLabel>
                </FormItem>
              )} />
              <FormField control={form.control} name="showOnContactPage" render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch checked={field.value ?? false} onCheckedChange={field.onChange} data-testid="switch-team-show-contact" />
                  </FormControl>
                  <FormLabel className="mb-0">Show on Contact Page</FormLabel>
                </FormItem>
              )} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-3">Internal Notes</h3>
          <FormField control={form.control} name="internalNotes" render={({ field }) => (
            <FormItem>
              <FormControl><Textarea {...field} value={field.value ?? ""} placeholder="Admin-only notes, not visible on website..." rows={3} data-testid="input-team-notes" /></FormControl>
              <FormDescription>These notes are only visible to admin users.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button type="submit" disabled={mutation.isPending} data-testid="button-save-team-member">
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Member" : "Add Member"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-team-form">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function AdminTeamPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  const { data: members = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/admin/team"],
  });

  const filteredMembers = useMemo(() => {
    let result = members;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(term) ||
        m.role.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term)
      );
    }
    if (filterDept !== "all") {
      result = result.filter(m => m.department === filterDept);
    }
    if (filterStatus === "active") {
      result = result.filter(m => m.isActive);
    } else if (filterStatus === "inactive") {
      result = result.filter(m => !m.isActive);
    }
    return result;
  }, [members, searchTerm, filterDept, filterStatus]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/team/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({ title: "Team member deleted" });
      setDeleteConfirm(null);
    },
    onError: () => {
      toast({ title: "Failed to delete team member", variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertTeamMember> }) =>
      apiRequest("PATCH", `/api/admin/team/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
    },
    onError: () => {
      toast({ title: "Failed to update team member", variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: ({ id, sortOrder }: { id: string; sortOrder: number }) =>
      apiRequest("PATCH", `/api/admin/team/${id}`, { sortOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
    },
  });

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMember(undefined);
  };

  const handleMoveUp = (member: TeamMember, index: number) => {
    if (index === 0) return;
    const prev = filteredMembers[index - 1];
    reorderMutation.mutate({ id: member.id, sortOrder: prev.sortOrder ?? 0 });
    reorderMutation.mutate({ id: prev.id, sortOrder: member.sortOrder ?? 0 });
  };

  const handleMoveDown = (member: TeamMember, index: number) => {
    if (index >= filteredMembers.length - 1) return;
    const next = filteredMembers[index + 1];
    reorderMutation.mutate({ id: member.id, sortOrder: next.sortOrder ?? 0 });
    reorderMutation.mutate({ id: next.id, sortOrder: member.sortOrder ?? 0 });
  };

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(members.map(m => m.department).filter(Boolean));
    return Array.from(depts) as string[];
  }, [members]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-team-title">Team Management</h1>
          <p className="text-muted-foreground">Manage your team's profiles, photos, contact information, and website display.</p>
        </div>
        <Button
          onClick={() => { setEditingMember(undefined); setShowForm(true); }}
          data-testid="button-add-team-member"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Team Member
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search team members..."
            className="pl-9"
            data-testid="input-search-team"
          />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-[200px]" data-testid="select-filter-department">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {uniqueDepartments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]" data-testid="select-filter-status">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) handleFormClose(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Team Member" : "Add New Team Member"}</DialogTitle>
          </DialogHeader>
          <TeamMemberForm
            member={editingMember}
            onSaved={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {members.length === 0
                ? "No team members yet. Add your first team member to get started."
                : "No team members match your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMembers.map((member, index) => (
            <Card key={member.id} data-testid={`card-team-member-${member.id}`}>
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex flex-col gap-1 pt-2">
                  <Button size="icon" variant="ghost" disabled={index === 0} onClick={() => handleMoveUp(member, index)} data-testid={`button-move-up-${member.id}`}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" disabled={index === filteredMembers.length - 1} onClick={() => handleMoveDown(member, index)} data-testid={`button-move-down-${member.id}`}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                <Avatar className="h-16 w-16 flex-shrink-0 mt-1">
                  {member.photo ? <AvatarImage src={member.photo} alt={member.name} /> : null}
                  <AvatarFallback>
                    {member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold" data-testid={`text-team-name-${member.id}`}>{member.name}</span>
                    {member.featured && <Badge variant="default" className="gap-1"><Star className="h-3 w-3" /> Featured</Badge>}
                    {!member.isActive && <Badge variant="secondary">Inactive</Badge>}
                    {!member.showOnWebsite && <Badge variant="outline" className="gap-1"><EyeOff className="h-3 w-3" /> Hidden</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid={`text-team-role-${member.id}`}>{member.role}</p>
                  {member.department && <p className="text-xs text-muted-foreground">{member.department}</p>}

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{member.email}</span>
                    {member.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{member.phone}</span>}
                    {member.yearsOfExperience ? <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{member.yearsOfExperience}y exp</span> : null}
                  </div>

                  {(member.expertise && member.expertise.length > 0) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.expertise.slice(0, 4).map((e, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{e}</Badge>
                      ))}
                      {member.expertise.length > 4 && <Badge variant="outline" className="text-xs">+{member.expertise.length - 4}</Badge>}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(member)} data-testid={`button-edit-team-${member.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {deleteConfirm === member.id ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(member.id)} disabled={deleteMutation.isPending} data-testid={`button-confirm-delete-team-${member.id}`}>
                          {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)} data-testid={`button-cancel-delete-team-${member.id}`}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="ghost" onClick={() => setDeleteConfirm(member.id)} data-testid={`button-delete-team-${member.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <Switch
                        checked={member.isActive ?? true}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: member.id, data: { isActive: checked } })}
                        className="scale-75"
                        data-testid={`toggle-active-${member.id}`}
                      />
                      <span className="text-muted-foreground">Active</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <Switch
                        checked={member.featured ?? false}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: member.id, data: { featured: checked } })}
                        className="scale-75"
                        data-testid={`toggle-featured-${member.id}`}
                      />
                      <span className="text-muted-foreground">Featured</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {members.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredMembers.length} of {members.length} team member{members.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
