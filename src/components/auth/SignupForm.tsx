import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Mail, Lock, User, Users, Baby } from "lucide-react";

type AppRole = "parent" | "child";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AppRole>("parent");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp(email, password, name, role);
      toast({
        title: "Inscription réussie !",
        description: "Vérifiez votre email pour confirmer votre compte.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-elevated border-border/50">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold text-foreground">Créer un compte</CardTitle>
        <CardDescription className="text-muted-foreground">
          Rejoignez Stop Repeat et simplifiez votre quotidien
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Role selector */}
          <div className="space-y-2">
            <Label>Je suis...</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("parent")}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  role === "parent"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="font-semibold">Parent</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("child")}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  role === "child"
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border text-muted-foreground hover:border-secondary/40"
                }`}
              >
                <Baby className="h-5 w-5" />
                <span className="font-semibold">Enfant</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Prénom</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Votre prénom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
                maxLength={50}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-password"
                type="password"
                placeholder="6 caractères minimum"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
            <UserPlus className="mr-2 h-4 w-4" />
            {isLoading ? "Inscription..." : "Créer mon compte"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
