import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Browser } from "@capacitor/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSocialSignInUrl, isNativePlatform, mobileCallbackURL, signIn } from "@/lib/auth-client";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await signIn.email({
      email,
      password,
      rememberMe: true
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || "Nao foi possivel entrar. Verifique suas credenciais.");
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    const callbackURL = isNativePlatform
      ? (() => {
          const url = new URL(mobileCallbackURL);
          url.searchParams.set("redirectTo", redirectTo);
          return url.toString();
        })()
      : new URL(redirectTo, window.location.origin).toString();

    if (isNativePlatform) {
      try {
        const socialUrl = await getSocialSignInUrl("google", callbackURL);
        await Browser.open({
          url: socialUrl
        });
        setIsSubmitting(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Nao foi possivel iniciar login com Google.";
        setErrorMessage(message);
        setIsSubmitting(false);
      }

      return;
    }

    try {
      const { error } = await signIn.social({
        provider: "google",
        callbackURL
      });

      if (error) {
        setErrorMessage(error.message || "Nao foi possivel iniciar login com Google.");
        setIsSubmitting(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha de rede ao iniciar login com Google.";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold tracking-tight">Entrar</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Acesse sua conta Growly</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-body text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className="font-body"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-body text-sm">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="font-body"
            />
          </div>
          {errorMessage ? (
            <p className="font-body text-sm text-destructive">{errorMessage}</p>
          ) : null}
          <Button type="submit" className="w-full font-heading" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <Button type="button" variant="outline" className="w-full font-heading" onClick={handleGoogleSignIn} disabled={isSubmitting}>
          Entrar com Google
        </Button>

        <p className="font-body text-sm text-center text-muted-foreground">
          Nao tem conta?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">Criar conta</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
