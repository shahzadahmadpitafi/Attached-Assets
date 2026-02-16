import { useEffect, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPropertySchema, type InsertProperty, type Property, type PropertyMedia } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Upload, X, Star, GripVertical, Image, Video, FileText, Plus, Trash2, ArrowUp, ArrowDown, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";

function extractVideoInfo(url: string): { platform: string; videoId: string } | null {
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) return { platform: "youtube", videoId: youtubeMatch[1] };
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch) return { platform: "vimeo", videoId: vimeoMatch[1] };
  return null;
}

function MediaUploadZone({ propertyId, onUploaded }: { propertyId: string; onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = useCallback(async (files: FileList) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 10 * 1024 * 1024;
    const fileArray = Array.from(files).filter(f => {
      if (!validTypes.includes(f.type)) {
        toast({ title: `Unsupported format: ${f.name}`, variant: "destructive" });
        return false;
      }
      if (f.size > maxSize) {
        toast({ title: `File too large: ${f.name} (max 10MB)`, variant: "destructive" });
        return false;
      }
      return true;
    });

    if (fileArray.length === 0) return;
    setUploading(true);

    for (const file of fileArray) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 10 }));
        const urlRes = await fetch("/api/uploads/request-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
        });
        if (!urlRes.ok) throw new Error("Failed to get upload URL");
        const { uploadURL, objectPath } = await urlRes.json();

        setUploadProgress(prev => ({ ...prev, [file.name]: 40 }));
        const uploadRes = await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!uploadRes.ok) throw new Error("Upload failed");

        setUploadProgress(prev => ({ ...prev, [file.name]: 80 }));
        await apiRequest("POST", `/api/admin/properties/${propertyId}/media`, {
          type: "image",
          url: objectPath,
          caption: "",
          tags: [],
          sortOrder: 0,
          isFeatured: false,
          fileSize: file.size,
        });
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      } catch (err) {
        toast({ title: `Failed to upload ${file.name}`, variant: "destructive" });
      }
    }

    setUploading(false);
    setUploadProgress({});
    onUploaded();
  }, [propertyId, onUploaded, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div>
      <div
        className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors hover:border-primary/50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="dropzone-images"
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium">Drag & drop images here</p>
        <p className="text-sm text-muted-foreground mt-1">or click to browse (JPG, PNG, WebP - max 10MB)</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          data-testid="input-file-upload"
        />
      </div>

      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="mt-3 space-y-2">
          {Object.entries(uploadProgress).map(([name, pct]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-sm truncate flex-1">{name}</span>
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MediaGalleryManager({ propertyId, media, onRefresh }: {
  propertyId: string;
  media: PropertyMedia[];
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const images = media.filter(m => m.type === "image");
  const videos = media.filter(m => m.type === "video");
  const floorPlans = media.filter(m => m.type === "floorplan");

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/media/${id}`);
    },
    onSuccess: () => {
      onRefresh();
      toast({ title: "Media deleted" });
    },
  });

  const featuredMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/admin/media/${id}/featured`);
    },
    onSuccess: () => {
      onRefresh();
      toast({ title: "Featured image updated" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (mediaIds: string[]) => {
      await apiRequest("POST", `/api/admin/properties/${propertyId}/media/reorder`, { mediaIds });
    },
    onSuccess: () => onRefresh(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/admin/media/${id}`, data);
    },
    onSuccess: () => onRefresh(),
  });

  const moveItem = (items: PropertyMedia[], index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    const ids = items.map(m => m.id);
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    reorderMutation.mutate(ids);
  };

  return (
    <div className="space-y-6">
      {images.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Image className="w-4 h-4" /> Images ({images.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={img.id} className="relative group border rounded-md overflow-visible" data-testid={`media-image-${img.id}`}>
                <div className="aspect-[4/3] overflow-hidden rounded-t-md">
                  <img
                    src={img.url.startsWith("/objects/") ? img.url : img.url}
                    alt={img.caption || "Property image"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 space-y-1">
                  <input
                    placeholder="Caption"
                    defaultValue={img.caption || ""}
                    className="w-full text-xs border rounded px-2 py-1 bg-background"
                    onBlur={(e) => {
                      if (e.target.value !== (img.caption || "")) {
                        updateMutation.mutate({ id: img.id, data: { caption: e.target.value } });
                      }
                    }}
                    data-testid={`input-caption-${img.id}`}
                  />
                  <Select
                    defaultValue={img.roomType || ""}
                    onValueChange={(v) => updateMutation.mutate({ id: img.id, data: { roomType: v } })}
                  >
                    <SelectTrigger className="h-7 text-xs" data-testid={`select-room-${img.id}`}>
                      <SelectValue placeholder="Room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exterior">Exterior</SelectItem>
                      <SelectItem value="living_room">Living Room</SelectItem>
                      <SelectItem value="bedroom">Bedroom</SelectItem>
                      <SelectItem value="kitchen">Kitchen</SelectItem>
                      <SelectItem value="bathroom">Bathroom</SelectItem>
                      <SelectItem value="garden">Garden/Lawn</SelectItem>
                      <SelectItem value="parking">Parking</SelectItem>
                      <SelectItem value="street_view">Street View</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between px-2 pb-2 gap-1">
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant={img.isFeatured ? "default" : "ghost"}
                      className="h-7 w-7"
                      onClick={() => featuredMutation.mutate(img.id)}
                      title="Set as featured"
                      data-testid={`button-featured-${img.id}`}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveItem(images, idx, "up")} disabled={idx === 0}>
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveItem(images, idx, "down")} disabled={idx === images.length - 1}>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={() => deleteMutation.mutate(img.id)}
                    data-testid={`button-delete-media-${img.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {img.isFeatured && (
                  <Badge className="absolute top-2 left-2 text-xs">Featured</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Video className="w-4 h-4" /> Videos ({videos.length})
          </h4>
          <div className="space-y-2">
            {videos.map((vid) => (
              <div key={vid.id} className="flex items-center gap-3 p-3 border rounded-md" data-testid={`media-video-${vid.id}`}>
                <div className="w-24 h-16 bg-muted rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                  {vid.platform === "youtube" && vid.videoId ? (
                    <img src={`https://img.youtube.com/vi/${vid.videoId}/mqdefault.jpg`} alt="thumb" className="w-full h-full object-cover" />
                  ) : (
                    <Video className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{vid.caption || vid.url}</p>
                  <p className="text-xs text-muted-foreground">{vid.platform}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive flex-shrink-0" onClick={() => deleteMutation.mutate(vid.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {floorPlans.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Floor Plans ({floorPlans.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {floorPlans.map((fp) => (
              <div key={fp.id} className="border rounded-md overflow-hidden" data-testid={`media-floorplan-${fp.id}`}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={fp.url.startsWith("/objects/") ? fp.url : fp.url} alt={fp.caption || "Floor Plan"} className="w-full h-full object-contain bg-muted" />
                </div>
                <div className="p-2 flex items-center justify-between gap-1">
                  <input
                    placeholder="Label (e.g. Ground Floor)"
                    defaultValue={fp.caption || ""}
                    className="flex-1 text-xs border rounded px-2 py-1 bg-background"
                    onBlur={(e) => {
                      if (e.target.value !== (fp.caption || "")) {
                        updateMutation.mutate({ id: fp.id, data: { caption: e.target.value } });
                      }
                    }}
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive flex-shrink-0" onClick={() => deleteMutation.mutate(fp.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {media.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No media uploaded yet. Use the upload zone above to add images.</p>
      )}
    </div>
  );
}

function VideoEmbedForm({ propertyId, onAdded }: { propertyId: string; onAdded: () => void }) {
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const { toast } = useToast();

  const addMutation = useMutation({
    mutationFn: async () => {
      const info = extractVideoInfo(videoUrl);
      if (!info) throw new Error("Invalid YouTube or Vimeo URL");
      await apiRequest("POST", `/api/admin/properties/${propertyId}/media`, {
        type: "video",
        url: videoUrl,
        caption: title || `${info.platform} video`,
        platform: info.platform,
        videoId: info.videoId,
        sortOrder: 0,
        isFeatured: false,
      });
    },
    onSuccess: () => {
      setVideoUrl("");
      setTitle("");
      onAdded();
      toast({ title: "Video added" });
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Input
        placeholder="YouTube or Vimeo URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="flex-1"
        data-testid="input-video-url"
      />
      <Input
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="sm:w-48"
        data-testid="input-video-title"
      />
      <Button
        onClick={() => addMutation.mutate()}
        disabled={!videoUrl || addMutation.isPending}
        data-testid="button-add-video"
      >
        {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        <span className="ml-1">Add</span>
      </Button>
    </div>
  );
}

function FloorPlanUpload({ propertyId, onUploaded }: { propertyId: string; onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Unsupported format. Use JPG, PNG, WebP or PDF.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large (max 10MB)", variant: "destructive" });
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
      const { uploadURL, objectPath } = await urlRes.json();

      await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

      await apiRequest("POST", `/api/admin/properties/${propertyId}/media`, {
        type: "floorplan",
        url: objectPath,
        caption: "",
        sortOrder: 0,
        isFeatured: false,
        fileSize: file.size,
      });
      onUploaded();
      toast({ title: "Floor plan uploaded" });
    } catch {
      toast({ title: "Failed to upload floor plan", variant: "destructive" });
    }
    setUploading(false);
  }, [propertyId, onUploaded, toast]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        data-testid="button-upload-floorplan"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
        Upload Floor Plan
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}

export default function AdminPropertyForm() {
  const [, params] = useRoute("/admin/properties/:id/edit");
  const id = params?.id;
  const isEditing = !!id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(id || null);

  const { data: property, isLoading: propertyLoading } = useQuery<Property>({
    queryKey: ["/api/admin/properties", id],
    enabled: isEditing,
  });

  const { data: media = [], refetch: refetchMedia } = useQuery<PropertyMedia[]>({
    queryKey: ["/api/admin/properties", savedPropertyId, "media"],
    queryFn: async () => {
      if (!savedPropertyId) return [];
      const res = await fetch(`/api/admin/properties/${savedPropertyId}/media`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!savedPropertyId,
  });

  const form = useForm<InsertProperty>({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      type: "House",
      status: "For Sale",
      location: "",
      city: "Islamabad",
      area: 0,
      bedrooms: 0,
      bathrooms: 0,
      image: "",
      featured: false,
      amenities: [],
    },
  });

  useEffect(() => {
    if (property) {
      form.reset({
        title: property.title,
        description: property.description,
        price: property.price,
        type: property.type,
        status: property.status,
        location: property.location,
        city: property.city,
        area: property.area,
        bedrooms: property.bedrooms ?? 0,
        bathrooms: property.bathrooms ?? 0,
        image: property.image,
        featured: property.featured ?? false,
        amenities: property.amenities ?? [],
      });
    }
  }, [property, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertProperty) => {
      if (isEditing) {
        const res = await apiRequest("PUT", `/api/admin/properties/${id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/admin/properties", data);
        return res.json();
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      if (!isEditing && result?.id) {
        setSavedPropertyId(result.id);
        toast({ title: "Property created! Now add images and media below." });
        window.history.replaceState(null, "", `/admin/properties/${result.id}/edit`);
      } else {
        toast({ title: "Property updated", description: "Changes saved successfully." });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save property", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertProperty) => {
    const featuredImage = media.find(m => m.type === "image" && m.isFeatured);
    const firstImage = media.find(m => m.type === "image");
    if (featuredImage) {
      data.image = featuredImage.url;
    } else if (firstImage) {
      data.image = firstImage.url;
    }
    if (!data.image) {
      data.image = "/images/property-placeholder.png";
    }
    mutation.mutate(data);
  };

  const handleRefreshMedia = useCallback(() => {
    refetchMedia();
    queryClient.invalidateQueries({ queryKey: ["/api/admin/properties", savedPropertyId, "media"] });
  }, [refetchMedia, savedPropertyId]);

  if (isEditing && propertyLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/admin/properties">
          <Button variant="ghost" size="icon" data-testid="button-back-properties">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold" data-testid="text-property-form-title">
          {isEditing ? "Edit Property" : "Add New Property"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-property">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Property title" data-testid="input-property-title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Property description" data-testid="input-property-description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (PKR)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          data-testid="input-property-price"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-property-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="House">House</SelectItem>
                          <SelectItem value="Apartment">Apartment</SelectItem>
                          <SelectItem value="Villa">Villa</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Townhouse">Townhouse</SelectItem>
                          <SelectItem value="Penthouse">Penthouse</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-property-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="For Sale">For Sale</SelectItem>
                          <SelectItem value="For Rent">For Rent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-property-city">
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Islamabad">Islamabad</SelectItem>
                          <SelectItem value="Lahore">Lahore</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. DHA Phase 5" data-testid="input-property-location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area (sq ft)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          data-testid="input-property-area"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          data-testid="input-property-bedrooms"
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          data-testid="input-property-bathrooms"
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Amenities (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Pool, Gym, Parking"
                          data-testid="input-property-amenities"
                          value={field.value?.join(", ") ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val ? val.split(",").map((s) => s.trim()).filter(Boolean) : []);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-property-featured"
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Featured Property</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  data-testid="button-save-property"
                >
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Update Property" : savedPropertyId ? "Update Property" : "Create Property"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {savedPropertyId && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" /> Property Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MediaUploadZone propertyId={savedPropertyId} onUploaded={handleRefreshMedia} />
              <MediaGalleryManager propertyId={savedPropertyId} media={media} onRefresh={handleRefreshMedia} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" /> Videos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <VideoEmbedForm propertyId={savedPropertyId} onAdded={handleRefreshMedia} />
              {media.filter(m => m.type === "video").length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {media.filter(m => m.type === "video").length} video(s) added. Manage in the gallery above.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" /> Floor Plans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FloorPlanUpload propertyId={savedPropertyId} onUploaded={handleRefreshMedia} />
            </CardContent>
          </Card>
        </>
      )}

      {!savedPropertyId && !isEditing && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <p>Save the property first, then you can upload images, videos, and floor plans.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
