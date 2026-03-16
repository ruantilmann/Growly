import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { mockPlants, mockDiagnoses } from '@/data/mockData';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';

const Diagnose = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const plant = mockPlants.find((p) => p.id === id);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(mockDiagnoses.find((d) => d.plantId === id) || null);
  const [showResult, setShowResult] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setShowResult(false);
    }
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAnalyzing(false);
      setShowResult(true);
    }, 2500);
  };

  if (!plant) return null;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <AppHeader title="Diagnóstico" showBack />

      <main className="container py-6 max-w-2xl space-y-6">
        {/* Upload area */}
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
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>

            {imagePreview && !analyzing && (
              <Button onClick={handleAnalyze} className="w-full font-heading">
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

        {/* Result */}
        {showResult && result && (
          <div className="space-y-6 animate-fade-in">
            {/* Diagnosis header with image */}
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
                  {result.diseases.map((d) => (
                    <li key={d} className="text-sm font-body">— {d}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="border border-border rounded-md p-4 space-y-2">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">Recomendações</h3>
              <ul className="space-y-1">
                {result.recommendations.map((r) => (
                  <li key={r} className="text-sm font-body">— {r}</li>
                ))}
              </ul>
            </section>

            <section className="border border-border rounded-md p-4 space-y-2">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">Dicas de cultivo</h3>
              <p className="text-sm font-body text-muted-foreground mb-1">Frequência de rega: {result.wateringFrequency}</p>
              <ul className="space-y-1">
                {result.tips.map((t) => (
                  <li key={t} className="text-sm font-body">— {t}</li>
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
