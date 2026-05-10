import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ComplianceProvider } from "./context/ComplianceContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UploadTranscript from "./pages/UploadTranscript";
import GeneratedPIA from "./pages/GeneratedPIA";
import PiaWorkspace from "./pages/PiaWorkspace";
import PIALibrary from "./pages/PIALibrary";
import CompilationBuilder from "./pages/CompilationBuilder";
import RopaPreview from "./pages/RopaPreview";
import ExecutiveSummary from "./pages/ExecutiveSummary";
import DrlGenerator from "./pages/DrlGenerator";
import PradarChecklist from "./pages/PradarChecklist";
import ConsistencyChecker from "./pages/ConsistencyChecker";
import EmailGenerator from "./pages/EmailGenerator";
import AuditLog from "./pages/AuditLog";
import EngagementManager from "./pages/EngagementManager";
import PhysicalInspection from "./pages/PhysicalInspection";
import PrivacyNoticeReview from "./pages/PrivacyNoticeReview";
import TechnicalSecurityAssessment from "./pages/TechnicalSecurityAssessment";
import AnalyticsHub from "./pages/AnalyticsHub";
import ManualsDeliverables from "./pages/ManualsDeliverables";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ComplianceProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<UploadTranscript />} />
                <Route path="/pia" element={<GeneratedPIA />} />
                <Route path="/pia/new" element={<PiaWorkspace />} />
                <Route path="/pia/:id" element={<PiaWorkspace />} />
                <Route path="/library" element={<PIALibrary />} />
                <Route path="/compile" element={<CompilationBuilder />} />
                <Route path="/ropa" element={<RopaPreview />} />
                <Route path="/summary" element={<ExecutiveSummary />} />
                <Route path="/drl" element={<DrlGenerator />} />
                <Route path="/pradar" element={<PradarChecklist />} />
                <Route path="/consistency" element={<ConsistencyChecker />} />
                <Route path="/email" element={<EmailGenerator />} />
                <Route path="/audit" element={<AuditLog />} />
                <Route path="/engagements" element={<EngagementManager />} />
                <Route path="/inspection" element={<PhysicalInspection />} />
                <Route path="/notice" element={<PrivacyNoticeReview />} />
                <Route path="/tsa" element={<TechnicalSecurityAssessment />} />
                <Route path="/analytics" element={<AnalyticsHub />} />
                <Route path="/manuals" element={<ManualsDeliverables />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ComplianceProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
