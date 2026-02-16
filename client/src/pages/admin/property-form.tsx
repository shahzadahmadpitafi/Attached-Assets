import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPropertySchema, type InsertProperty, type Property } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminPropertyForm() {
  const [, params] = useRoute("/admin/properties/:id/edit");
  const id = params?.id;
  const isEditing = !!id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: property, isLoading: propertyLoading } = useQuery<Property>({
    queryKey: ["/api/admin/properties", id],
    enabled: isEditing,
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
        await apiRequest("PUT", `/api/admin/properties/${id}`, data);
      } else {
        await apiRequest("POST", "/api/admin/properties", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      toast({ title: isEditing ? "Property updated" : "Property created", description: "Changes saved successfully." });
      setLocation("/admin/properties");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save property", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertProperty) => {
    mutation.mutate(data);
  };

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
        <CardContent className="pt-6">
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
                  name="image"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" data-testid="input-property-image" {...field} />
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
                  {isEditing ? "Update Property" : "Create Property"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
