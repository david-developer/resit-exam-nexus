
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";

// Common pages
import LoginPage from "@/pages/login";
import NotFound from "@/pages/NotFound";

// Student pages
import StudentDashboard from "@/pages/student/dashboard";
import StudentGradesPage from "@/pages/student/grades";
import StudentResitExamsPage from "@/pages/student/resit-exams";
import StudentDeclareResitPage from "@/pages/student/declare-resit";
import StudentExamSchedulePage from "@/pages/student/exam-schedule";

// Instructor pages
import InstructorDashboard from "@/pages/instructor/dashboard";
import InstructorSubmitGradesPage from "@/pages/instructor/submit-grades";
import InstructorResitDetailsPage from "@/pages/instructor/resit-details";
import InstructorResitParticipantsPage from "@/pages/instructor/resit-participants";

// Secretary pages
import SecretaryDashboard from "@/pages/secretary/dashboard";
import SecretaryUploadSchedulePage from "@/pages/secretary/upload-schedule";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Common Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/grades" element={<StudentGradesPage />} />
            <Route path="/student/resit-exams" element={<StudentResitExamsPage />} />
            <Route path="/student/declare-resit" element={<StudentDeclareResitPage />} />
            <Route path="/student/exam-schedule" element={<StudentExamSchedulePage />} />
            
            {/* Instructor Routes */}
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/submit-grades" element={<InstructorSubmitGradesPage />} />
            <Route path="/instructor/resit-details" element={<InstructorResitDetailsPage />} />
            <Route path="/instructor/resit-participants" element={<InstructorResitParticipantsPage />} />
            
            {/* Secretary Routes */}
            <Route path="/secretary/dashboard" element={<SecretaryDashboard />} />
            <Route path="/secretary/upload-schedule" element={<SecretaryUploadSchedulePage />} />
            
            {/* Catch-all for non-existent routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
