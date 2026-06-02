import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AttachmentPreviewProvider } from "./components/AttachmentPreview";
import { AuthProvider } from "./context/AuthContext";
import { ComplianceProvider } from "./context/ComplianceContext";
import Login from "./pages/Login";
import LoginVerify from "./pages/LoginVerify";
import Signup from "./pages/Signup";
import ClientWaiting from "./pages/ClientWaiting";
import ClientGate from "./components/ClientGate";
import Dashboard from "./pages/Dashboard";
import UploadTranscript from "./pages/UploadTranscript";
import GeneratedPIA from "./pages/GeneratedPIA";
import PiaWorkspace from "./pages/PiaWorkspace";
import PIALibrary from "./pages/PIALibrary";
import PiaShell from "./pages/PiaShell";
import PradarShell from "./pages/PradarShell";
import CompilationBuilder from "./pages/CompilationBuilder";
import RopaPreview from "./pages/RopaPreview";
import RopaGenerator from "./pages/RopaGenerator";
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
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import TooltipManager from "./pages/admin/TooltipManager";
import ViewAsSettings from "./pages/admin/ViewAsSettings";
import ResetData from "./pages/admin/ResetData";
import UserManagement from "./pages/admin/UserManagement";
import CalendarPage from "./pages/CalendarPage";
import SearchResults from "./pages/SearchResults";
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
            <AttachmentPreviewProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<UploadTranscript />} />
                <Route path="/pia" element={<GeneratedPIA />} />
                <Route path="/pia/new" element={<PiaWorkspace />} />
                <Route path="/pia/:id" element={<PiaWorkspace />} />
                <Route path="/library" element={<PiaShell />} />
                <Route path="/library-classic" element={<PIALibrary />} />
                <Route path="/compile" element={<CompilationBuilder />} />
                <Route path="/ropa" element={<RopaGenerator />} />
                <Route path="/ropa/:piaId" element={<RopaGenerator />} />
                <Route path="/ropa-legacy" element={<RopaPreview />} />
                <Route path="/summary" element={<ExecutiveSummary />} />
                <Route path="/drl" element={<DrlGenerator />} />
                <Route path="/pradar" element={<PradarShell />} />
                <Route path="/pradar-classic" element={<PradarChecklist />} />
                <Route path="/consistency" element={<ConsistencyChecker />} />
                <Route path="/email" element={<EmailGenerator />} />
                <Route path="/audit" element={<AuditLog />} />
                <Route path="/engagements" element={<EngagementManager />} />
                <Route path="/inspection" element={<PhysicalInspection />} />
                <Route path="/notice" element={<PrivacyNoticeReview />} />
                <Route path="/tsa" element={<TechnicalSecurityAssessment />} />
                <Route path="/analytics" element={<AnalyticsHub />} />
                <Route path="/manuals" element={<ManualsDeliverables />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
                <Route path="/admin/tooltips" element={<TooltipManager />} />
                <Route path="/admin/view-as" element={<ViewAsSettings />} />
                <Route path="/admin/reset" element={<ResetData />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/search" element={<SearchResults />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            </AttachmentPreviewProvider>
          </ComplianceProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
