import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-violet-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center space-y-6 px-6 max-w-md">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-9 h-9 text-red-400" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <p className="text-7xl font-bold text-foreground tracking-tight" style={{
            background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            404
          </p>
          <h2 className="text-xl font-semibold text-foreground">Stránka nenalezena</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Omlouváme se, tato stránka neexistuje.<br />
            Mohla být přesunuta nebo smazána.
          </p>
        </div>

        {/* CTA */}
        <Button
          onClick={() => setLocation("/")}
          className="gap-2 px-6"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)",
            boxShadow: "0 0 20px hsl(var(--primary)/0.4)",
          }}
        >
          <Home className="w-4 h-4" />
          Zpět na hlavní stránku
        </Button>
      </div>
    </div>
  );
}
