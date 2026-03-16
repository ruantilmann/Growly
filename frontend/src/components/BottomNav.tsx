import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, PlusSquare, CalendarDays, User } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutGrid, label: 'Plantas' },
  { to: '/add-plant', icon: PlusSquare, label: 'Adicionar' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendário' },
  { to: '/profile', icon: User, label: 'Perfil' },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-body transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
