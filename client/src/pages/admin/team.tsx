import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTeamMemberSchema, type InsertTeamMember, type TeamMember } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Upload, X, User, ArrowUp, ArrowDown } from "lucide-react";

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
      <Avatar className="h-20 w-20">
        {currentPhoto ? (
          <AvatarImage src={currentPhoto} alt="Team member photo" />
        ) : null}
        <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPhotoChange("")}
            data-testid="button-remove-team-photo"
          >
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

function TeamMemberForm({
  member,
  onSaved,
  onCancel,
}: {
  member?: TeamMember;
  onSaved: () => void;
  onCancel: () => void;
}) {
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
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTeamMember) => {
      if (isEditing) {
        return apiRequest("PATCH", `/api/admin/team/${member.id}`, data);
      }
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo</FormLabel>
              <FormControl>
                <PhotoUpload
                  currentPhoto={field.value}
                  onPhotoChange={(url) => field.onChange(url)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Muhammad Naushad Anjum" data-testid="input-team-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role / Title *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. CEO & Founder" data-testid="input-team-role" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="e.g. Executive Leadership" data-testid="input-team-department" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specialization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialization</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="e.g. Strategic Planning, Business Development" data-testid="input-team-specialization" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="e.g. name@qanzakglobal.com" data-testid="input-team-email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="+92 331 1479800" data-testid="input-team-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Number</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} placeholder="923311479800 (without + or spaces)" data-testid="input-team-whatsapp" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shortBio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Bio</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} placeholder="One-line summary for cards..." rows={2} data-testid="input-team-short-bio" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Bio</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} placeholder="Detailed biography..." rows={4} data-testid="input-team-bio" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-team-sort-order"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormLabel className="mb-0">Active</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                    data-testid="switch-team-active"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 pt-2">
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
  const { toast } = useToast();

  const { data: members = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/admin/team"],
  });

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
    const prev = members[index - 1];
    reorderMutation.mutate({ id: member.id, sortOrder: prev.sortOrder ?? 0 });
    reorderMutation.mutate({ id: prev.id, sortOrder: member.sortOrder ?? 0 });
  };

  const handleMoveDown = (member: TeamMember, index: number) => {
    if (index >= members.length - 1) return;
    const next = members[index + 1];
    reorderMutation.mutate({ id: member.id, sortOrder: next.sortOrder ?? 0 });
    reorderMutation.mutate({ id: next.id, sortOrder: member.sortOrder ?? 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-team-title">Team Members</h1>
          <p className="text-muted-foreground">Manage your team's profiles, photos, and contact details.</p>
        </div>
        <Button
          onClick={() => { setEditingMember(undefined); setShowForm(true); }}
          data-testid="button-add-team-member"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) handleFormClose(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
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
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No team members yet. Add your first team member to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((member, index) => (
            <Card key={member.id} data-testid={`card-team-member-${member.id}`}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex flex-col gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(member, index)}
                    data-testid={`button-move-up-${member.id}`}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={index === members.length - 1}
                    onClick={() => handleMoveDown(member, index)}
                    data-testid={`button-move-down-${member.id}`}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                <Avatar className="h-14 w-14 flex-shrink-0">
                  {member.photo ? (
                    <AvatarImage src={member.photo} alt={member.name} />
                  ) : null}
                  <AvatarFallback>
                    {member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold" data-testid={`text-team-name-${member.id}`}>{member.name}</span>
                    {!member.isActive && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid={`text-team-role-${member.id}`}>{member.role}</p>
                  {member.department && (
                    <p className="text-xs text-muted-foreground">{member.department}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{member.email} {member.phone && `| ${member.phone}`}</p>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(member)}
                    data-testid={`button-edit-team-${member.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {deleteConfirm === member.id ? (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(member.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-confirm-delete-team-${member.id}`}
                      >
                        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(null)}
                        data-testid={`button-cancel-delete-team-${member.id}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteConfirm(member.id)}
                      data-testid={`button-delete-team-${member.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
