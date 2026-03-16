import { HealthStatus } from '@/data/mockData';

interface StatusBadgeProps {
  status: HealthStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<HealthStatus, { label: string; className: string }> = {
  healthy: {
    label: 'Saudável',
    className: 'bg-success text-success-foreground',
  },
  attention: {
    label: 'Atenção',
    className: 'bg-warning text-warning-foreground',
  },
  critical: {
    label: 'Crítico',
    className: 'bg-destructive text-destructive-foreground',
  },
};

const StatusBadge = ({ status, size = 'sm' }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center rounded-sm font-body font-semibold ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
