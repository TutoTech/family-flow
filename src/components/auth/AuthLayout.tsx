import { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <img src={logo} alt="Stop Repeat" className="h-10 w-10" />
        <span className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Stop Repeat
        </span>
      </Link>
      {children}
    </div>
  );
}
