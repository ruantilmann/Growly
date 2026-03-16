import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Camera, Clock, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import StatusBadge from '@/components/StatusBadge';
import PlantPulse from '@/components/PlantPulse';
import { Button } from '@/components/ui/button';
import { deletePlant, getCareEvents, getPlantById } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const eventTypeLabels: Record<string, string> = {
  watering: 'Rega',
  fertilizing: 'Fertilização',
  pruning: 'Poda',
  analysis: 'Análise IA',
};

const PlantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['plant', id],
    queryFn: () => getPlantById(id as string),
    enabled: Boolean(id),
  });

  const { data: careEvents = [] } = useQuery({
    queryKey: ['care-events'],
    queryFn: getCareEvents,
  });

  const { mutateAsync: removePlant, isPending: isRemoving } = useMutation({
    mutationFn: () => deletePlant(id as string),
  });

  const plant = data?.plant;
  const diagnoses = data?.diagnoses || [];
  const events = useMemo(
    () => careEvents.filter((event) => event.plantId === id).sort((a, b) => b.date.localeCompare(a.date)),
    [careEvents, id]
  );
  const latestDiagnosis = diagnoses[0];

  const handleDelete = async () => {
    const confirmed = window.confirm('Tem certeza que deseja remover esta planta?');
    if (!confirmed) {
      return;
    }

    try {
      await removePlant();
      await queryClient.invalidateQueries({ queryKey: ['plants'] });
      await queryClient.invalidateQueries({ queryKey: ['care-events'] });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao remover planta';
      toast({
        title: 'Erro ao remover',
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
        <p className="font-body text-muted-foreground">Não foi possível carregar esta planta.</p>
      </div>
    );
  }

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
      <AppHeader title={plant.name} showBack backTo="/dashboard" actions={
        <div className="flex items-center gap-2">
          <Link to={`/plant/${id}/diagnose`}>
            <Button size="sm" className="font-heading gap-1.5">
              <Camera className="h-4 w-4" />
              Analisar
            </Button>
          </Link>
          <Button size="sm" variant="outline" className="font-heading gap-1.5" onClick={handleDelete} disabled={isRemoving}>
            <Trash2 className="h-4 w-4" />
            {isRemoving ? 'Removendo...' : 'Remover'}
          </Button>
        </div>
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
              <span className="text-xs text-muted-foreground font-body">{new Date(latestDiagnosis.date).toLocaleDateString('pt-BR')}</span>
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
                <span className="text-xs text-muted-foreground font-body">{new Date(event.date).toLocaleDateString('pt-BR')}</span>
              </div>
            ))}

            {events.length === 0 && (
              <p className="text-sm text-muted-foreground font-body">Nenhum evento no histórico ainda.</p>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default PlantDetail;
