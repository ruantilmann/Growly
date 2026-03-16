import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  actions?: React.ReactNode;
}

const desktopNavItems = [
  { to: '/dashboard', label: 'Plantas', matchPrefixes: ['/dashboard', '/plant/'] },
  { to: '/add-plant', label: 'Adicionar', matchPrefixes: ['/add-plant'] },
  { to: '/calendar', label: 'Calendario', matchPrefixes: ['/calendar'] },
  { to: '/profile', label: 'Perfil', matchPrefixes: ['/profile'] },
];

const AppHeader = ({ title, showBack, backTo, actions }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center gap-3">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
              className="p-1.5 rounded-sm hover:bg-muted transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          <h1 className="font-heading text-lg font-semibold tracking-tight">{title}</h1>
        </div>

        <nav className="ml-2 hidden md:flex items-center gap-1">
          {desktopNavItems.map(({ to, label, matchPrefixes }) => {
            const active = matchPrefixes.some((prefix) => pathname.startsWith(prefix));
            return (
              <Link
                key={to}
                to={to}
                className={`rounded-md px-3 py-1.5 text-sm font-body transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
};

export default AppHeader;
