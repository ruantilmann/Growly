import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login
    navigate('/dashboard');
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
              className="font-body"
            />
          </div>
          <Button type="submit" className="w-full font-heading">Entrar</Button>
        </form>

        <p className="font-body text-sm text-center text-muted-foreground">
          Não tem conta?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">Criar conta</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
