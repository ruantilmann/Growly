import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <AppHeader title="Perfil" />

      <main className="container py-6 max-w-sm space-y-6">
        <div className="border border-border rounded-md p-5 bg-card space-y-3">
          <div>
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Nome</p>
            <p className="font-heading text-base font-semibold">Usuário Demo</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Email</p>
            <p className="font-body text-sm">demo@growly.app</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Nível</p>
            <p className="font-body text-sm">Intermediário</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Plantas cadastradas</p>
            <p className="font-body text-sm">4</p>
          </div>
        </div>

        <Button variant="outline" className="w-full font-heading" onClick={() => navigate('/')}>
          Sair
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
