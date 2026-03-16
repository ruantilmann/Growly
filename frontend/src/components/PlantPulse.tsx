/**
 * Plant Pulse — signature visual element.
 * Minimal bar chart that pulses to represent watering rhythm.
 */
const PlantPulse = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`flex items-end gap-[2px] h-5 ${className}`} aria-label="Pulso da planta">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-[3px] bg-primary rounded-sm pulse-bar"
          style={{ height: '100%' }}
        />
      ))}
    </div>
  );
};

export default PlantPulse;
