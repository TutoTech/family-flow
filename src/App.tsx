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
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ProfileSwitchProvider } from "@/hooks/useProfileSwitch";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

/*
 * Chaque page est chargée à la demande (code-splitting) afin de réduire
 * la taille du bundle initial : l'utilisateur ne télécharge que le code
 * de la page qu'il visite réellement.
 */
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FamilySettings = lazy(() => import("./pages/FamilySettings"));
const TaskTemplates = lazy(() => import("./pages/TaskTemplates"));
const FamilyCalendarPage = lazy(() => import("./pages/FamilyCalendarPage"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const CGU = lazy(() => import("./pages/CGU"));
const CGV = lazy(() => import("./pages/CGV"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** Spinner affiché pendant le chargement différé d'une page */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

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
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
            </ProfileSwitchProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
