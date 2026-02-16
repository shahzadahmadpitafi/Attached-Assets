import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Property } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";

export default function AdminPropertiesList() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/admin/properties"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      toast({ title: "Property deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete property", description: error.message, variant: "destructive" });
    },
  });

  const filtered = properties?.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold" data-testid="text-properties-title">Properties</h1>
        <Link href="/admin/properties/new">
          <Button data-testid="button-add-property">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Property
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search-properties"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6">No properties found.</p>
          ) : (
            <Table data-testid="table-properties">
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((property) => (
                  <TableRow key={property.id} data-testid={`row-property-${property.id}`}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{property.type}</TableCell>
                    <TableCell>
                      <Badge variant={property.status === "For Sale" ? "default" : "secondary"}>
                        {property.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{property.city}</TableCell>
                    <TableCell>PKR {new Intl.NumberFormat("en-PK").format(property.price)}</TableCell>
                    <TableCell>
                      {property.featured ? (
                        <Badge variant="outline">Featured</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/properties/${property.id}/edit`}>
                          <Button variant="ghost" size="icon" data-testid={`button-edit-property-${property.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-delete-property-${property.id}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Property</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{property.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(property.id)}
                                data-testid="button-confirm-delete"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
