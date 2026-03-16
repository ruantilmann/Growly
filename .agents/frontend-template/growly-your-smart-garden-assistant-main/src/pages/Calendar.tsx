import { mockCareEvents, mockPlants } from '@/data/mockData';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';

const eventTypeLabels: Record<string, string> = {
  watering: 'Rega',
  fertilizing: 'Fertilização',
  pruning: 'Poda',
  analysis: 'Análise IA',
};

const Calendar = () => {
  const allEvents = [...mockCareEvents].sort((a, b) => b.date.localeCompare(a.date));

  // Group by date
  const grouped = allEvents.reduce<Record<string, typeof allEvents>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <AppHeader title="Calendário de Cultivo" />

      <main className="container py-6 max-w-lg space-y-6">
        {Object.entries(grouped).map(([date, events]) => (
          <div key={date} className="space-y-2">
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">{date}</h3>
            {events.map((event) => {
              const plant = mockPlants.find((p) => p.id === event.plantId);
              return (
                <div key={event.id} className="flex items-center gap-3 border border-border rounded-md px-4 py-3 bg-card">
                  {plant && (
                    <img src={plant.imageUrl} alt={plant.name} className="h-8 w-8 rounded-sm object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium">{eventTypeLabels[event.type]}</p>
                    <p className="text-xs text-muted-foreground font-body truncate">{plant?.name}{event.notes ? ` · ${event.notes}` : ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </main>

      <BottomNav />
    </div>
  );
};

export default Calendar;
