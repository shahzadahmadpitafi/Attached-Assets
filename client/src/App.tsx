import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import HomePage from "@/pages/home";
import ServicesPage from "@/pages/services";
import PropertiesPage from "@/pages/properties";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import NotFound from "@/pages/not-found";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminLayout from "@/pages/admin/layout";
import AdminPropertiesList from "@/pages/admin/properties-list";
import AdminPropertyForm from "@/pages/admin/property-form";
import AdminInquiries from "@/pages/admin/inquiries";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/admin/login" />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <Switch>
        <Route path="/admin/login" component={AdminLoginPage} />
        <Route path="/admin/properties/new">
          <ProtectedRoute><AdminPropertyForm /></ProtectedRoute>
        </Route>
        <Route path="/admin/properties/:id/edit">
          <ProtectedRoute><AdminPropertyForm /></ProtectedRoute>
        </Route>
        <Route path="/admin/properties">
          <ProtectedRoute><AdminPropertiesList /></ProtectedRoute>
        </Route>
        <Route path="/admin/inquiries">
          <ProtectedRoute><AdminInquiries /></ProtectedRoute>
        </Route>
        <Route path="/admin">
          <ProtectedRoute><AdminDashboard /></ProtectedRoute>
        </Route>
      </Switch>
    </AdminAuthProvider>
  );
}

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/services" component={ServicesPage} />
          <Route path="/properties" component={PropertiesPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function AppRouter() {
  const [location] = useLocation();

  return (
    <>
      <ScrollToTop />
      {location.startsWith("/admin") ? <AdminRoutes /> : <PublicLayout />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppRouter />
        <WhatsAppButton />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
