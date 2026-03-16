import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Upload } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPlant, identifyPlantFromImage, uploadPlantImage, type PlantIdentification } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const AddPlant = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [identification, setIdentification] = useState<PlantIdentification | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const { id } = await createPlant({
        name,
        species: species || undefined,
        location,
      });

      if (selectedImage) {
        await uploadPlantImage(id, selectedImage);
      }

      return id;
    },
  });

  const { mutateAsync: identifyPlant, isPending: isIdentifying } = useMutation({
    mutationFn: (file: File) => identifyPlantFromImage(file),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCameraIdentify = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));

    try {
      const result = await identifyPlant(file);
      setIdentification(result);

      if (!species.trim()) {
        setSpecies(result.probableSpecies);
      }

      if (!name.trim()) {
        setName(result.commonName === 'Planta nao identificada' ? result.probableSpecies : result.commonName);
      }

      toast({
        title: 'Identificação concluída',
        description: `${Math.round(result.confidence * 100)}% de confiança para ${result.probableSpecies}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao identificar planta';
      toast({
        title: 'Erro na identificação',
        description: message,
        variant: 'destructive',
      });
    } finally {
      e.target.value = '';
    }
  };

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const plantId = await mutateAsync();
      await queryClient.invalidateQueries({ queryKey: ['plants'] });
      navigate(`/plant/${plantId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao cadastrar planta';
      toast({
        title: 'Erro ao cadastrar',
        description: message,
        variant: 'destructive',
      });
    }
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
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleCameraIdentify}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 font-heading"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isIdentifying}
            >
              <Camera className="h-4 w-4" />
              {isIdentifying ? 'Identificando...' : 'Identificar com câmera'}
            </Button>
            {identification && (
              <div className="rounded-md border border-border bg-card p-3 space-y-2">
                <p className="text-sm font-body text-muted-foreground">Espécie detectada</p>
                <p className="font-heading text-base">{identification.probableSpecies}</p>
                <p className="text-xs font-body text-muted-foreground">
                  Confiança estimada: {Math.round(identification.confidence * 100)}%
                </p>
                <p className="text-sm font-body">{identification.summary}</p>
              </div>
            )}
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

          <Button type="submit" className="w-full font-heading" disabled={!name || !location || isPending}>
            {isPending ? 'Cadastrando...' : 'Cadastrar planta'}
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
};

export default AddPlant;
