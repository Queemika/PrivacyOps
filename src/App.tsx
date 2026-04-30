import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import UploadTranscript from "./pages/UploadTranscript";
import TranscriptReview from "./pages/TranscriptReview";
import GeneratedPIA from "./pages/GeneratedPIA";
import PIALibrary from "./pages/PIALibrary";
import CompilationBuilder from "./pages/CompilationBuilder";
import RopaPreview from "./pages/RopaPreview";
import ExecutiveSummary from "./pages/ExecutiveSummary";
import DrlGenerator from "./pages/DrlGenerator";
import PradarChecklist from "./pages/PradarChecklist";
import ConsistencyChecker from "./pages/ConsistencyChecker";
import EmailGenerator from "./pages/EmailGenerator";
import AuditLog from "./pages/AuditLog";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadTranscript />} />
            <Route path="/review" element={<TranscriptReview />} />
            <Route path="/pia" element={<GeneratedPIA />} />
            <Route path="/library" element={<PIALibrary />} />
            <Route path="/compile" element={<CompilationBuilder />} />
            <Route path="/ropa" element={<RopaPreview />} />
            <Route path="/summary" element={<ExecutiveSummary />} />
            <Route path="/drl" element={<DrlGenerator />} />
            <Route path="/pradar" element={<PradarChecklist />} />
            <Route path="/consistency" element={<ConsistencyChecker />} />
            <Route path="/email" element={<EmailGenerator />} />
            <Route path="/audit" element={<AuditLog />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
