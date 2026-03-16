import { createAuthClient } from "better-auth/react";
import { Capacitor } from "@capacitor/core";

const webApiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:3333";
const mobileApiBaseURL = import.meta.env.VITE_MOBILE_API_URL || webApiBaseURL;

export const isNativePlatform = Capacitor.isNativePlatform();
export const apiBaseURL = isNativePlatform ? mobileApiBaseURL : webApiBaseURL;
export const mobileCallbackURL = import.meta.env.VITE_MOBILE_CALLBACK_URL || "growly://auth/callback";

export const authClient = createAuthClient({
  baseURL: apiBaseURL,
  fetchOptions: {
    credentials: "include"
  }
});

export const { useSession, signIn, signOut, signUp, getSession } = authClient;

export async function getSocialSignInUrl(provider: string, callbackURL: string): Promise<string> {
  const response = await fetch(`${apiBaseURL}/api/auth/mobile/social-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      provider,
      callbackURL
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Nao foi possivel iniciar login social");
  }

  const payload = (await response.json()) as { url?: string };

  if (!payload.url) {
    throw new Error("URL de login social nao retornada pelo servidor");
  }

  return payload.url;
}
