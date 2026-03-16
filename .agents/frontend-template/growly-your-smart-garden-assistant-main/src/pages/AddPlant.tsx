import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AddPlant = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock — navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <AppHeader title="Adicionar Planta" showBack />

      <main className="container py-6 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image upload */}
          <div className="space-y-2">
            <Label className="font-body text-sm">Foto</Label>
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-md aspect-square flex items-center justify-center bg-card overflow-hidden hover:border-primary/40 transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-body">Toque para enviar foto</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="font-body text-sm">Nome da planta *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Monstera" required className="font-body" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="species" className="font-body text-sm">Espécie (opcional)</Label>
            <Input id="species" value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="Ex: Monstera deliciosa" className="font-body" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="font-body text-sm">Localização</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Sala de estar" className="font-body" />
          </div>

          <Button type="submit" className="w-full font-heading" disabled={!name}>
            Cadastrar planta
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
};

export default AddPlant;
