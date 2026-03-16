type DiagnosisWithRecommendations = {
  recommendations: string | null;
};

type SerializedDiagnosis<T extends DiagnosisWithRecommendations> = Omit<T, "recommendations"> & {
  recommendations: string[];
};

const RECOMMENDATIONS_SEPARATOR = "|";

export function parseRecommendations(recommendations: string | null | undefined) {
  if (!recommendations) {
    return [];
  }

  return recommendations
    .split(RECOMMENDATIONS_SEPARATOR)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function formatRecommendations(recommendations: string[]) {
  return recommendations.join(" | ");
}

export function serializeDiagnosis<T extends DiagnosisWithRecommendations>(
  diagnosis: T
): SerializedDiagnosis<T> {
  return {
    ...diagnosis,
    recommendations: parseRecommendations(diagnosis.recommendations)
  };
}
