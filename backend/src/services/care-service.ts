import { AlertType, HealthStatus, type EventType, type Prisma } from "@prisma/client";
import dayjs from "dayjs";

type AIAnalysis = {
  probableSpecies: string;
  healthStatus: string;
  possibleDiseases: string[];
  recommendations: string[];
  wateringFrequencyDays: number;
  careTips: string[];
};

const healthMap: Record<string, HealthStatus> = {
  healthy: HealthStatus.healthy,
  warning: HealthStatus.warning,
  critical: HealthStatus.critical,
  unknown: HealthStatus.unknown
};

export function normalizeHealthStatus(status: string): HealthStatus {
  return healthMap[status] ?? HealthStatus.unknown;
}

export function buildCareEvents(plantId: string, wateringIntervalDays: number): Prisma.CareEventCreateManyInput[] {
  const now = dayjs();
  return [
    {
      plantId,
      type: "watering" satisfies EventType,
      eventDate: now.add(wateringIntervalDays, "day").toDate(),
      note: "Rega sugerida pela IA"
    },
    {
      plantId,
      type: "fertilization" satisfies EventType,
      eventDate: now.add(14, "day").toDate(),
      note: "Fertilizacao preventiva"
    },
    {
      plantId,
      type: "pruning" satisfies EventType,
      eventDate: now.add(30, "day").toDate(),
      note: "Podas leves de manutencao"
    }
  ];
}

export function buildAlerts(analysis: AIAnalysis): Array<{ type: AlertType; message: string }> {
  const alerts: Array<{ type: AlertType; message: string }> = [];
  const recommendationsBlob = analysis.recommendations.join(" ").toLowerCase();

  if (analysis.healthStatus === "critical" || analysis.possibleDiseases.length > 0) {
    alerts.push({
      type: AlertType.disease,
      message: analysis.possibleDiseases.length
        ? `Possivel doenca detectada: ${analysis.possibleDiseases.join(", ")}.`
        : "A planta apresentou sinais criticos e precisa de atencao imediata."
    });
  }

  if (recommendationsBlob.includes("desidrat") || recommendationsBlob.includes("falta de agua")) {
    alerts.push({
      type: AlertType.dehydration,
      message: "A planta pode estar desidratada. Revise a frequencia de rega."
    });
  }

  if (recommendationsBlob.includes("excesso") || recommendationsBlob.includes("encharc")) {
    alerts.push({
      type: AlertType.overwatering,
      message: "Possivel excesso de agua. Ajuste drenagem e intervalo entre regas."
    });
  }

  if (alerts.length === 0 && analysis.healthStatus === "warning") {
    alerts.push({
      type: AlertType.general,
      message: "A planta esta em estado de atencao. Siga as recomendacoes preventivas."
    });
  }

  return alerts;
}
