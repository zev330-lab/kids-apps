import { useEffect, useState } from "react";

export function useSync<T>(load: () => T, eventName: string): T {
  const [value, setValue] = useState(load);
  useEffect(() => {
    const update = () => setValue(load());
    window.addEventListener(eventName, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(eventName, update);
      window.removeEventListener("storage", update);
    };
  }, [load, eventName]);
  return value;
}
