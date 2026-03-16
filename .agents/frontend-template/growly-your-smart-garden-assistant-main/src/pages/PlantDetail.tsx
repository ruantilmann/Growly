import { useParams, Link } from 'react-router-dom';
import { Camera, Clock } from 'lucide-react';
import { mockPlants, mockDiagnoses, mockCareEvents } from '@/data/mockData';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import StatusBadge from '@/components/StatusBadge';
import PlantPulse from '@/components/PlantPulse';
import { Button } from '@/components/ui/button';

const eventTypeLabels: Record<string, string> = {
  watering: 'Rega',
  fertilizing: 'Fertilização',
  pruning: 'Poda',
  analysis: 'Análise IA',
};

const PlantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const plant = mockPlants.find((p) => p.id === id);
  const diagnoses = mockDiagnoses.filter((d) => d.plantId === id);
  const events = mockCareEvents.filter((e) => e.plantId === id).sort((a, b) => b.date.localeCompare(a.date));
  const latestDiagnosis = diagnoses[0];

  if (!plant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">Planta não encontrada.</p>
      </div>
    );
  }

  const daysUntilWatering = Math.max(0, Math.ceil(
    (new Date(plant.nextWatering).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <AppHeader title={plant.name} showBack actions={
        <Link to={`/plant/${id}/diagnose`}>
          <Button size="sm" className="font-heading gap-1.5">
            <Camera className="h-4 w-4" />
            Analisar
          </Button>
        </Link>
      } />

      <main className="container py-6 max-w-2xl space-y-6">
        {/* Hero image + info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-square rounded-md overflow-hidden bg-muted">
            <img src={plant.imageUrl} alt={plant.name} className="h-full w-full object-cover" />
          </div>
          <div className="space-y-4 flex flex-col justify-center">
            <div>
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Espécie</p>
              <p className="font-heading text-lg font-semibold">{plant.species}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Localização</p>
              <p className="font-body">{plant.location}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={plant.healthStatus} size="md" />
              <PlantPulse />
            </div>
            <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
              <Clock className="h-4 w-4" />
              {daysUntilWatering === 0 ? 'Regar hoje' : `Próxima rega em ${daysUntilWatering} dias`}
            </div>
          </div>
        </div>

        {/* Latest diagnosis */}
        {latestDiagnosis && (
          <section className="border border-border rounded-md p-5 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wider">Último Diagnóstico</h2>
              <span className="text-xs text-muted-foreground font-body">{latestDiagnosis.date}</span>
            </div>
            <p className="font-body text-sm">{latestDiagnosis.diagnosis}</p>
            {latestDiagnosis.diseases.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">Problemas detectados</p>
                <ul className="space-y-1">
                  {latestDiagnosis.diseases.map((d) => (
                    <li key={d} className="text-sm font-body text-destructive">— {d}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">Recomendações</p>
              <ul className="space-y-1">
                {latestDiagnosis.recommendations.map((r) => (
                  <li key={r} className="text-sm font-body">— {r}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* History */}
        <section className="space-y-3">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider">Histórico</h2>
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between border border-border rounded-md px-4 py-3 bg-card">
                <div>
                  <p className="font-body text-sm font-medium">{eventTypeLabels[event.type] || event.type}</p>
                  {event.notes && <p className="text-xs text-muted-foreground font-body">{event.notes}</p>}
                </div>
                <span className="text-xs text-muted-foreground font-body">{event.date}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default PlantDetail;
