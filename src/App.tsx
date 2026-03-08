/**
 * Point d'entrée principal de l'application React.
 * Configure les providers (thème, données, authentification, profils)
 * et définit toutes les routes de navigation.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ProfileSwitchProvider } from "@/hooks/useProfileSwitch";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import FamilySettings from "./pages/FamilySettings";
import TaskTemplates from "./pages/TaskTemplates";
import FamilyCalendarPage from "./pages/FamilyCalendarPage";
import MentionsLegales from "./pages/MentionsLegales";
import CGU from "./pages/CGU";
import CGV from "./pages/CGV";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";

/** Client React Query pour la gestion du cache et des requêtes asynchrones */
const queryClient = new QueryClient();

const App = () => (
  /* Provider de thème clair/sombre, détection automatique du système */
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Systèmes de notifications toast (shadcn + sonner) */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Fournisseur d'authentification (session, profil, rôle) */}
          <AuthProvider>
            {/* Permet aux parents de visualiser le dashboard d'un enfant */}
            <ProfileSwitchProvider>
            <Routes>
              {/* --- Pages publiques --- */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* --- Pages légales --- */}
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/cgu" element={<CGU />} />
              <Route path="/cgv" element={<CGV />} />
              <Route path="/confidentialite" element={<PrivacyPolicy />} />

              {/* --- Pages protégées (authentification requise) --- */}
              <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <FamilySettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <TaskTemplates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <FamilyCalendarPage />
                  </ProtectedRoute>
                }
              />

              {/* Route 404 pour les URLs inconnues */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </ProfileSwitchProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
