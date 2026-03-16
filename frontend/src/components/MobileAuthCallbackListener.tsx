import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { isNativePlatform, mobileCallbackURL } from "@/lib/auth-client";

export default function MobileAuthCallbackListener() {
  const navigate = useNavigate();
  const callbackPrefix = mobileCallbackURL.split("?")[0];

  useEffect(() => {
    if (!isNativePlatform) {
      return;
    }

    const listenerPromise = App.addListener("appUrlOpen", async ({ url }) => {
      if (!url || !url.startsWith(callbackPrefix)) {
        return;
      }

      try {
        await Browser.close();
      } catch {
        // no-op
      }

      const parsedUrl = new URL(url);
      const redirectTo = parsedUrl.searchParams.get("redirectTo") || "/dashboard";
      navigate(redirectTo, { replace: true });
    });

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, [callbackPrefix, navigate]);

  return null;
}
