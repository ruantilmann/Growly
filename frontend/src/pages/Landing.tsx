import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Circle, Square, Triangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";

const Landing = () => {
  const navigate = useNavigate();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="container flex items-center justify-between h-16">
        <span className="font-heading text-xl font-bold tracking-tight">Growly</span>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Button variant="ghost" size="sm" className="font-body" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button size="sm" className="font-body" onClick={handleSignOut}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-body">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="font-body">Criar conta</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 container flex flex-col items-center justify-center text-center py-20 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Square className="h-5 w-5 text-primary" strokeWidth={2} />
          <Circle className="h-5 w-5 text-warning" strokeWidth={2} />
          <Triangle className="h-5 w-5 text-destructive" strokeWidth={2} />
        </div>

        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          Diagnóstico preciso para suas plantas
        </h1>

        <p className="font-body text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
          Envie uma foto. Receba a análise. Cuide com dados. Growly transforma ansiedade em ação informada usando inteligência artificial.
        </p>

        {session ? (
          <Link to="/dashboard">
            <Button size="lg" className="font-heading text-base gap-2 px-8">
              Ir para dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link to="/register">
            <Button size="lg" className="font-heading text-base gap-2 px-8">
              Comecar agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
            {[
              { title: "Identificacao", desc: "Reconhecimento de especies por analise fotometrica." },
              { title: "Diagnostico", desc: "Deteccao de doencas e deficiencias nutricionais." },
              { title: "Plano de cuidados", desc: "Regas, podas e fertilizacoes agendadas automaticamente." }
            ].map((f) => (
              <div key={f.title} className="border border-border rounded-md p-5 bg-card">
                <h3 className="font-heading text-sm font-semibold mb-2">{f.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="container py-6 text-center">
        <p className="font-body text-xs text-muted-foreground">(c) 2026 Growly. Seu assistente inteligente de cultivo.</p>
      </footer>
    </div>
  );
};

export default Landing;
