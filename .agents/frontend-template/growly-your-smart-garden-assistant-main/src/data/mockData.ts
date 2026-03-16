export type HealthStatus = 'healthy' | 'attention' | 'critical';

export interface Plant {
  id: string;
  name: string;
  species: string;
  location: string;
  imageUrl: string;
  healthStatus: HealthStatus;
  lastAnalysis: string;
  nextWatering: string;
  wateringIntervalDays: number;
  createdAt: string;
}

export interface Diagnosis {
  id: string;
  plantId: string;
  date: string;
  healthStatus: HealthStatus;
  species: string;
  diagnosis: string;
  diseases: string[];
  recommendations: string[];
  wateringFrequency: string;
  tips: string[];
}

export interface CareEvent {
  id: string;
  plantId: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'analysis';
  date: string;
  notes?: string;
}

export const mockPlants: Plant[] = [
  {
    id: '1',
    name: 'Monstera',
    species: 'Monstera deliciosa',
    location: 'Sala de estar',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=400&fit=crop',
    healthStatus: 'healthy',
    lastAnalysis: '2026-03-07',
    nextWatering: '2026-03-10',
    wateringIntervalDays: 5,
    createdAt: '2025-12-01',
  },
  {
    id: '2',
    name: 'Suculenta',
    species: 'Echeveria elegans',
    location: 'Escritório',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&h=400&fit=crop',
    healthStatus: 'attention',
    lastAnalysis: '2026-03-05',
    nextWatering: '2026-03-12',
    wateringIntervalDays: 10,
    createdAt: '2026-01-15',
  },
  {
    id: '3',
    name: 'Samambaia',
    species: 'Nephrolepis exaltata',
    location: 'Banheiro',
    imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop',
    healthStatus: 'critical',
    lastAnalysis: '2026-03-08',
    nextWatering: '2026-03-09',
    wateringIntervalDays: 2,
    createdAt: '2026-02-10',
  },
  {
    id: '4',
    name: 'Espada-de-São-Jorge',
    species: 'Dracaena trifasciata',
    location: 'Quarto',
    imageUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=400&h=400&fit=crop',
    healthStatus: 'healthy',
    lastAnalysis: '2026-03-06',
    nextWatering: '2026-03-20',
    wateringIntervalDays: 14,
    createdAt: '2025-11-20',
  },
];

export const mockDiagnoses: Diagnosis[] = [
  {
    id: 'd1',
    plantId: '1',
    date: '2026-03-07',
    healthStatus: 'healthy',
    species: 'Monstera deliciosa',
    diagnosis: 'Planta em excelente estado. Folhas verdes e brilhantes, sem sinais de pragas ou doenças.',
    diseases: [],
    recommendations: [
      'Manter rega a cada 5 dias',
      'Garantir luz indireta abundante',
      'Limpar folhas semanalmente',
    ],
    wateringFrequency: 'A cada 5 dias',
    tips: [
      'Gire o vaso a cada 2 semanas para crescimento uniforme',
      'Use suporte para as raízes aéreas',
    ],
  },
  {
    id: 'd2',
    plantId: '2',
    date: '2026-03-05',
    healthStatus: 'attention',
    species: 'Echeveria elegans',
    diagnosis: 'Sinais leves de excesso de água. Folhas inferiores ligeiramente translúcidas.',
    diseases: ['Edema foliar leve'],
    recommendations: [
      'Reduzir frequência de rega para cada 12 dias',
      'Verificar drenagem do vaso',
      'Remover folhas afetadas',
    ],
    wateringFrequency: 'A cada 12 dias',
    tips: [
      'Suculentas preferem solo seco entre regas',
      'Use substrato com boa drenagem (areia + terra)',
    ],
  },
  {
    id: 'd3',
    plantId: '3',
    date: '2026-03-08',
    healthStatus: 'critical',
    species: 'Nephrolepis exaltata',
    diagnosis: 'Desidratação severa. Frondes secas e amareladas. Necessita intervenção urgente.',
    diseases: ['Desidratação', 'Possível queimadura solar'],
    recommendations: [
      'Regar imediatamente por imersão',
      'Mover para local com mais umidade',
      'Borrifar água nas folhas diariamente',
      'Remover frondes completamente secas',
    ],
    wateringFrequency: 'A cada 2 dias',
    tips: [
      'Samambaias precisam de alta umidade',
      'Ideal manter perto de fontes de vapor (banheiro)',
    ],
  },
];

export const mockCareEvents: CareEvent[] = [
  { id: 'e1', plantId: '1', type: 'watering', date: '2026-03-07', notes: 'Rega normal' },
  { id: 'e2', plantId: '1', type: 'analysis', date: '2026-03-07' },
  { id: 'e3', plantId: '1', type: 'fertilizing', date: '2026-03-01', notes: 'NPK 10-10-10' },
  { id: 'e4', plantId: '2', type: 'watering', date: '2026-03-02' },
  { id: 'e5', plantId: '2', type: 'analysis', date: '2026-03-05' },
  { id: 'e6', plantId: '3', type: 'watering', date: '2026-03-08' },
  { id: 'e7', plantId: '3', type: 'analysis', date: '2026-03-08' },
  { id: 'e8', plantId: '3', type: 'pruning', date: '2026-03-06', notes: 'Remoção de frondes secas' },
  { id: 'e9', plantId: '4', type: 'watering', date: '2026-03-06' },
];
