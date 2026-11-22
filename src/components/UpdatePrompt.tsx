import { useEffect, useState } from "react";

export function UpdatePrompt() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    let installing: ServiceWorker | null = null;
    const check = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void registration?.update().catch(() => {});
      }
    };
    const observe = () => {
      if (navigator.serviceWorker.controller) {
        const worker = registration?.waiting ?? (installing?.state === "installed" ? installing : null);
        if (worker) setWaiting(worker);
      }
    };
    const found = () => {
      installing?.removeEventListener("statechange", observe);
      installing = registration?.installing ?? null;
      installing?.addEventListener("statechange", observe);
    };
    const url = new URL(import.meta.env.BASE_URL + "sw.js", document.baseURI);
    void navigator.serviceWorker
      .register(url, { updateViaCache: "none" })
      .then((reg) => {
        if (disposed) return;
        registration = reg;
        reg.addEventListener("updatefound", found);
        found();
        observe();
        check();
      })
      .catch(() => {});
    document.addEventListener("visibilitychange", check);
    const hour = window.setInterval(check, 60 * 60 * 1000);
    return () => {
      disposed = true;
      clearInterval(hour);
      document.removeEventListener("visibilitychange", check);
      registration?.removeEventListener("updatefound", found);
      installing?.removeEventListener("statechange", observe);
    };
  }, []);
  if (!waiting) return null;
  return (
    <aside className="update-prompt" role="status">
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          if (waiting.state === "activated" || waiting.state === "redundant") {
            window.location.reload();
            return;
          }
          navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), { once: true });
          waiting.postMessage({ type: "SKIP_WAITING" });
        }}
      >
        A new version is ready. Tap to refresh
      </button>
    </aside>
  );
}
