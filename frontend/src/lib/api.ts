import { apiBaseURL } from "@/lib/auth-client";

export type HealthStatus = "healthy" | "attention" | "critical";

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

export interface PlantIdentification {
  probableSpecies: string;
  commonName: string;
  confidence: number;
  summary: string;
  careTips: string[];
}

export interface CareEvent {
  id: string;
  plantId: string;
  type: "watering" | "fertilizing" | "pruning" | "analysis";
  date: string;
  notes?: string;
}

type ApiHealthStatus = "healthy" | "warning" | "critical" | "unknown";

type PlantListResponse = {
  plants: Array<{
    id: string;
    name: string;
    species: string | null;
    location: string;
    createdAt: string;
    latestImagePath: string | null;
    lastAnalysis: {
      createdAt: string;
      healthStatus: ApiHealthStatus;
      recommendations: string[];
    } | null;
    nextWateringDate: string | null;
  }>;
};

type PlantDetailResponse = {
  plant: {
    id: string;
    name: string;
    species: string | null;
    location: string;
    createdAt: string;
    images: Array<{
      id: string;
      imagePath: string;
      uploadedAt: string;
    }>;
    diagnoses: Array<{
      id: string;
      plantId: string;
      diagnosis: {
        probableSpecies?: string;
        recommendations?: string[];
        careTips?: string[];
      };
      healthStatus: ApiHealthStatus;
      recommendations: string[];
      probableSpecies: string | null;
      possibleDiseases: unknown;
      wateringFrequencyDays: number | null;
      careTips: unknown;
      createdAt: string;
    }>;
    careSchedule: {
      wateringIntervalDays: number;
      nextWateringDate: string;
    } | null;
  };
};

type CareScheduleResponse = {
  events: Array<{
    id: string;
    plantId: string;
    plantName: string;
    type: "watering" | "fertilization" | "pruning";
    eventDate: string;
    note: string | null;
  }>;
};

type HistoryResponse = {
  history: Array<{
    id: string;
    plantId: string;
    createdAt: string;
  }>;
};

function normalizeHealthStatus(status: ApiHealthStatus | null | undefined): HealthStatus {
  if (status === "critical") {
    return "critical";
  }

  if (status === "healthy") {
    return "healthy";
  }

  return "attention";
}

function ensureStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function resolveImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop";
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return `${apiBaseURL}${imagePath}`;
}

async function apiRequest<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseURL}${endpoint}`, {
    ...init,
    credentials: "include"
  });

  if (!response.ok) {
    let message = "Erro ao processar requisicao";

    try {
      const payload = await response.json();
      if (payload?.message && typeof payload.message === "string") {
        message = payload.message;
      }
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

function toPlantModel(plant: PlantListResponse["plants"][number]): Plant {
  return {
    id: plant.id,
    name: plant.name,
    species: plant.species || "Espécie não informada",
    location: plant.location,
    imageUrl: resolveImageUrl(plant.latestImagePath),
    healthStatus: normalizeHealthStatus(plant.lastAnalysis?.healthStatus),
    lastAnalysis: plant.lastAnalysis?.createdAt || plant.createdAt,
    nextWatering: plant.nextWateringDate || plant.createdAt,
    wateringIntervalDays: 7,
    createdAt: plant.createdAt
  };
}

function toDiagnosisModel(item: PlantDetailResponse["plant"]["diagnoses"][number]): Diagnosis {
  const diseases = ensureStringArray(item.possibleDiseases);
  const tipsFromRoot = ensureStringArray(item.careTips);
  const tipsFromPayload = ensureStringArray(item.diagnosis?.careTips);

  return {
    id: item.id,
    plantId: item.plantId,
    date: item.createdAt,
    healthStatus: normalizeHealthStatus(item.healthStatus),
    species: item.probableSpecies || item.diagnosis?.probableSpecies || "Não identificado",
    diagnosis: diseases.length
      ? `Possíveis problemas detectados: ${diseases.join(", ")}.`
      : "Nenhum problema grave detectado na última análise.",
    diseases,
    recommendations: item.recommendations,
    wateringFrequency: item.wateringFrequencyDays
      ? `A cada ${item.wateringFrequencyDays} dias`
      : "Frequência não informada",
    tips: tipsFromRoot.length > 0 ? tipsFromRoot : tipsFromPayload
  };
}

export async function getPlants(): Promise<Plant[]> {
  const payload = await apiRequest<PlantListResponse>("/plants");
  return payload.plants.map(toPlantModel);
}

export async function createPlant(input: {
  name: string;
  species?: string;
  location: string;
}): Promise<{ id: string }> {
  const payload = await apiRequest<{ plant: { id: string } }>("/plants", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  return { id: payload.plant.id };
}

export async function deletePlant(id: string) {
  await apiRequest(`/plants/${id}`, {
    method: "DELETE"
  });
}

export async function getPlantById(id: string): Promise<{
  plant: Plant;
  diagnoses: Diagnosis[];
}> {
  const payload = await apiRequest<PlantDetailResponse>(`/plants/${id}`);
  const images = [...payload.plant.images].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  const latestImagePath = images[0]?.imagePath;
  const diagnoses = payload.plant.diagnoses.map(toDiagnosisModel);
  const latestDiagnosisStatus = payload.plant.diagnoses[0]?.healthStatus;

  return {
    plant: {
      id: payload.plant.id,
      name: payload.plant.name,
      species: payload.plant.species || "Espécie não informada",
      location: payload.plant.location,
      imageUrl: resolveImageUrl(latestImagePath),
      healthStatus: normalizeHealthStatus(latestDiagnosisStatus),
      lastAnalysis: diagnoses[0]?.date || payload.plant.createdAt,
      nextWatering: payload.plant.careSchedule?.nextWateringDate || payload.plant.createdAt,
      wateringIntervalDays: payload.plant.careSchedule?.wateringIntervalDays || 7,
      createdAt: payload.plant.createdAt
    },
    diagnoses
  };
}

export async function uploadPlantImage(plantId: string, file: File): Promise<{ id: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const payload = await apiRequest<{ image: { id: string } }>(`/plants/${plantId}/upload-image`, {
    method: "POST",
    body: formData
  });

  return { id: payload.image.id };
}

export async function analyzePlant(plantId: string, imageId?: string): Promise<Diagnosis> {
  const payload = await apiRequest<{
    diagnosis: PlantDetailResponse["plant"]["diagnoses"][number];
  }>("/ai/analyze-plant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ plantId, imageId })
  });

  return toDiagnosisModel(payload.diagnosis);
}

export async function identifyPlantFromImage(file: File): Promise<PlantIdentification> {
  const formData = new FormData();
  formData.append("file", file);

  const payload = await apiRequest<{
    identification: PlantIdentification;
  }>("/ai/identify-plant", {
    method: "POST",
    body: formData
  });

  return payload.identification;
}

export async function getCareEvents(): Promise<CareEvent[]> {
  const [carePayload, historyPayload] = await Promise.all([
    apiRequest<CareScheduleResponse>("/care-schedule"),
    apiRequest<HistoryResponse>("/history")
  ]);

  const careEvents: CareEvent[] = carePayload.events.map((event) => ({
    id: event.id,
    plantId: event.plantId,
    type: event.type === "fertilization" ? "fertilizing" : event.type,
    date: event.eventDate,
    notes: event.note || undefined
  }));

  const analysisEvents: CareEvent[] = historyPayload.history.map((item) => ({
    id: `analysis-${item.id}`,
    plantId: item.plantId,
    type: "analysis",
    date: item.createdAt
  }));

  return [...careEvents, ...analysisEvents].sort((a, b) => b.date.localeCompare(a.date));
}
