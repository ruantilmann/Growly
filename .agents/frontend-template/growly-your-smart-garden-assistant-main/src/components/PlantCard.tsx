import { Link } from 'react-router-dom';
import { Plant } from '@/data/mockData';
import StatusBadge from './StatusBadge';
import PlantPulse from './PlantPulse';

interface PlantCardProps {
  plant: Plant;
}

const PlantCard = ({ plant }: PlantCardProps) => {
  const daysUntilWatering = Math.max(0, Math.ceil(
    (new Date(plant.nextWatering).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));

  return (
    <Link
      to={`/plant/${plant.id}`}
      className="group block rounded-md border border-border bg-card overflow-hidden transition-shadow hover:shadow-md animate-fade-in"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={plant.imageUrl}
          alt={plant.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-heading text-sm font-semibold truncate">{plant.name}</h3>
            <p className="text-xs text-muted-foreground font-body truncate">{plant.species}</p>
          </div>
          <PlantPulse />
        </div>
        <div className="flex items-center justify-between">
          <StatusBadge status={plant.healthStatus} />
          <span className="text-xs text-muted-foreground font-body">
            {daysUntilWatering === 0 ? 'Regar hoje' : `${daysUntilWatering}d para rega`}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PlantCard;
