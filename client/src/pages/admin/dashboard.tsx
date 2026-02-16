import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Home, Key, MessageSquare, Bell, CheckCircle, PlusCircle, List, Mail } from "lucide-react";
import type { Inquiry } from "@shared/schema";

type Metrics = {
  totalProperties: number;
  forSale: number;
  forRent: number;
  totalInquiries: number;
  newInquiries: number;
  respondedInquiries: number;
};

const metricCards = [
  { key: "totalProperties" as const, label: "Total Properties", icon: Building2 },
  { key: "forSale" as const, label: "For Sale", icon: Home },
  { key: "forRent" as const, label: "For Rent", icon: Key },
  { key: "totalInquiries" as const, label: "Total Inquiries", icon: MessageSquare },
  { key: "newInquiries" as const, label: "New Inquiries", icon: Bell },
  { key: "respondedInquiries" as const, label: "Responded", icon: CheckCircle },
];

export default function AdminDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<Metrics>({
    queryKey: ["/api/admin/metrics"],
  });

  const { data: inquiries, isLoading: inquiriesLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/admin/inquiries"],
  });

  const recentInquiries = inquiries?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((card) => (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold" data-testid={`text-metric-${card.key}`}>
                  {metrics?.[card.key] ?? 0}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Link href="/admin/properties/new">
          <Button data-testid="button-quick-add-property">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Property
          </Button>
        </Link>
        <Link href="/admin/properties">
          <Button variant="outline" data-testid="button-quick-view-properties">
            <List className="mr-2 h-4 w-4" />
            View All Properties
          </Button>
        </Link>
        <Link href="/admin/inquiries">
          <Button variant="outline" data-testid="button-quick-view-inquiries">
            <Mail className="mr-2 h-4 w-4" />
            View Inquiries
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {inquiriesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentInquiries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No inquiries yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id} data-testid={`row-inquiry-${inquiry.id}`}>
                    <TableCell className="font-medium">{inquiry.name}</TableCell>
                    <TableCell>{inquiry.email}</TableCell>
                    <TableCell>{inquiry.service ?? "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inquiry.status === "new" ? "default" :
                          inquiry.status === "responded" ? "outline" : "secondary"
                        }
                      >
                        {inquiry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : "-"}</TableCell>
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
