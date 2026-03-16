import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

const AppHeader = ({ title, showBack, actions }: AppHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-sm hover:bg-muted transition-colors" aria-label="Voltar">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          <h1 className="font-heading text-lg font-semibold tracking-tight">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
};

export default AppHeader;
