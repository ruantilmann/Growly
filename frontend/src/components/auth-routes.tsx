import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "@/lib/auth-client";

export function ProtectedRoute() {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="font-body text-sm text-muted-foreground">Carregando sessao...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="font-body text-sm text-muted-foreground">Carregando sessao...</p>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
