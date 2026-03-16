import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";

const levelMap: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediario",
  advanced: "Avancado"
};

const Profile = () => {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const rawLevel = (session?.user as { level?: string } | undefined)?.level;

  const level = rawLevel ? levelMap[rawLevel] || rawLevel : "Nao definido";

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <AppHeader title="Perfil" />

      <main className="container py-6 max-w-sm space-y-6">
        <div className="border border-border rounded-md p-5 bg-card space-y-3">
          <div>
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Nome</p>
            <p className="font-heading text-base font-semibold">{session?.user.name || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Email</p>
            <p className="font-body text-sm">{session?.user.email || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Nível</p>
            <p className="font-body text-sm">{level}</p>
          </div>
        </div>

        <Button variant="outline" className="w-full font-heading" onClick={handleSignOut}>
          Sair
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
