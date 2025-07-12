import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GeneralConsultantDashboard from "./components/dashboards/GeneralConsultantDashboard";
import ExtractSummaryPage from "@/components/dashboards/ExtractSummaryPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/general-consultant"
              element={<GeneralConsultantDashboard />}
            />
            <Route
              path="/extract-summary"
              element={
                <ExtractSummaryPage
                  projectValue={300000}
                  advancePaymentPercentage={10}
                  workGuaranteePercentage={5}
                  materialDeliveryPaymentPercentage={15}
                  completedWorkPaymentPercentage={20}
                  items={[]} // ممكن تحط بيانات حقيقية بدل دي
                />
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
