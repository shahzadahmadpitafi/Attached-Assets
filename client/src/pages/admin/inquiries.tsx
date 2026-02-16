import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Inquiry } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Eye } from "lucide-react";

const statusVariant = (status: string | null) => {
  switch (status) {
    case "new": return "default" as const;
    case "in_progress": return "secondary" as const;
    case "responded": return "outline" as const;
    case "closed": return "secondary" as const;
    default: return "default" as const;
  }
};

export default function AdminInquiries() {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const { toast } = useToast();

  const { data: inquiries, isLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/admin/inquiries"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { status?: string; notes?: string } }) => {
      await apiRequest("PATCH", `/api/admin/inquiries/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      toast({ title: "Inquiry updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/inquiries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      toast({ title: "Inquiry deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    updateMutation.mutate({ id, data: { status } });
  };

  const handleSaveNotes = (id: string) => {
    updateMutation.mutate({ id, data: { notes: editNotes } });
    setSelectedInquiry(null);
  };

  const openDetail = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setEditNotes(inquiry.notes ?? "");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold" data-testid="text-inquiries-title">Inquiries</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !inquiries || inquiries.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6">No inquiries found.</p>
          ) : (
            <Table data-testid="table-inquiries">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id} data-testid={`row-inquiry-${inquiry.id}`}>
                    <TableCell className="font-medium">{inquiry.name}</TableCell>
                    <TableCell>{inquiry.email}</TableCell>
                    <TableCell>{inquiry.phone ?? "-"}</TableCell>
                    <TableCell>{inquiry.service ?? "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={inquiry.status ?? "new"}
                        onValueChange={(val) => handleStatusChange(inquiry.id, val)}
                      >
                        <SelectTrigger className="w-[130px]" data-testid={`select-status-${inquiry.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="responded">Responded</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetail(inquiry)}
                          data-testid={`button-view-inquiry-${inquiry.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-delete-inquiry-${inquiry.id}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the inquiry from "{inquiry.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-testid="button-cancel-delete-inquiry">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(inquiry.id)}
                                data-testid="button-confirm-delete-inquiry"
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

      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>View and manage inquiry from {selectedInquiry?.name}</DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name</span>
                  <p className="font-medium" data-testid="text-detail-name">{selectedInquiry.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium" data-testid="text-detail-email">{selectedInquiry.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone</span>
                  <p className="font-medium">{selectedInquiry.phone ?? "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Service</span>
                  <p className="font-medium">{selectedInquiry.service ?? "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p>
                    <Badge variant={statusVariant(selectedInquiry.status)}>
                      {selectedInquiry.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date</span>
                  <p className="font-medium">
                    {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Message</span>
                <p className="mt-1 text-sm" data-testid="text-detail-message">{selectedInquiry.message}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Notes</span>
                <Textarea
                  className="mt-1"
                  placeholder="Add internal notes..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  data-testid="textarea-inquiry-notes"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSaveNotes(selectedInquiry.id)}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-notes"
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
