import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { analyzePlant, getPlantById, uploadPlantImage, type Diagnosis } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Diagnose = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['plant', id],
    queryFn: () => getPlantById(id as string),
    enabled: Boolean(id),
  });

  const plant = data?.plant;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (data?.diagnoses?.[0]) {
      setResult(data.diagnoses[0]);
    }
  }, [data]);

  const { mutateAsync, isPending: analyzing } = useMutation({
    mutationFn: async () => {
      if (!id || !selectedFile) {
        throw new Error('Selecione uma imagem para analisar');
      }

      const { id: imageId } = await uploadPlantImage(id, selectedFile);
      return analyzePlant(id, imageId);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setShowResult(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      const diagnosis = await mutateAsync();
      setResult(diagnosis);
      setShowResult(true);
      await queryClient.invalidateQueries({ queryKey: ['plants'] });
      await queryClient.invalidateQueries({ queryKey: ['plant', id] });
      await queryClient.invalidateQueries({ queryKey: ['care-events'] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao analisar imagem';
      toast({
        title: 'Erro na análise',
        description: message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">Carregando planta...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">Não foi possível carregar os dados da planta.</p>
      </div>
    );
  }

  if (!plant) return null;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <AppHeader title="Diagnóstico" showBack />

      <main className="container py-6 max-w-2xl space-y-6">
        {!showResult && (
          <>
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-md aspect-video flex items-center justify-center bg-card overflow-hidden hover:border-primary/40 transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="Foto para análise" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center space-y-2 py-12">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-body">Envie uma foto de <strong>{plant.name}</strong></p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
            </label>

            {imagePreview && !analyzing && (
              <Button onClick={handleAnalyze} className="w-full font-heading" disabled={!selectedFile}>
                Analisar foto
              </Button>
            )}

            {analyzing && (
              <div className="flex items-center justify-center gap-3 py-8">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full spinner-technical" />
                <p className="font-body text-sm text-muted-foreground">Analisando fotometria e padrões celulares...</p>
              </div>
            )}
          </>
        )}

        {showResult && result && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-video rounded-md overflow-hidden bg-muted">
                <img src={imagePreview || plant.imageUrl} alt="Análise" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-3 flex flex-col justify-center">
                <div>
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Espécie identificada</p>
                  <p className="font-heading text-lg font-semibold">{result.species}</p>
                </div>
                <StatusBadge status={result.healthStatus} size="md" />
                <p className="font-body text-sm">{result.diagnosis}</p>
              </div>
            </div>

            {result.diseases.length > 0 && (
              <section className="border border-destructive/30 rounded-md p-4 space-y-2">
                <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-destructive">Problemas detectados</h3>
                <ul className="space-y-1">
                  {result.diseases.map((disease) => (
                    <li key={disease} className="text-sm font-body">- {disease}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="border border-border rounded-md p-4 space-y-2">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">Recomendações</h3>
              <ul className="space-y-1">
                {result.recommendations.map((recommendation) => (
                  <li key={recommendation} className="text-sm font-body">- {recommendation}</li>
                ))}
              </ul>
            </section>

            <section className="border border-border rounded-md p-4 space-y-2">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">Dicas de cultivo</h3>
              <p className="text-sm font-body text-muted-foreground mb-1">Frequência de rega: {result.wateringFrequency}</p>
              <ul className="space-y-1">
                {result.tips.map((tip) => (
                  <li key={tip} className="text-sm font-body">- {tip}</li>
                ))}
              </ul>
            </section>

            <Button onClick={() => navigate(`/plant/${id}`)} className="w-full font-heading">
              Voltar para a planta
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Diagnose;
