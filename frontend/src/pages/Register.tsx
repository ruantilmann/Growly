import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await signUp.email({
      name,
      email,
      password
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || "Nao foi possivel criar sua conta.");
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold tracking-tight">Criar conta</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Comece a cuidar das suas plantas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-body text-sm">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required autoComplete="name" className="font-body" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="font-body text-sm">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required autoComplete="email" className="font-body" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-body text-sm">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimo 6 caracteres" required minLength={6} autoComplete="new-password" className="font-body" />
          </div>
          {errorMessage ? (
            <p className="font-body text-sm text-destructive">{errorMessage}</p>
          ) : null}
          <Button type="submit" className="w-full font-heading" disabled={isSubmitting}>
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="font-body text-sm text-center text-muted-foreground">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
