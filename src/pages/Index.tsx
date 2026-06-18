/**
 * Page d'accueil (landing page).
 * Assemble toutes les sections : navigation, héro, fonctionnalités,
 * comment ça marche, tarification et pied de page.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FaqSection from "@/components/landing/FaqSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  const { user, loading } = useAuth();

  // Pendant le chargement de la session, on n'affiche rien pour éviter
  // un flash de la landing page avant la décision de redirection.
  if (loading) return null;

  // Si l'utilisateur est déjà connecté, on le redirige vers son tableau
  // de bord plutôt que d'afficher la landing page.
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <Footer />
    </div>
  );
};

export default Index;
