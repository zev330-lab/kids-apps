export type RouteName = "home" | "story" | "scribble" | "parker";

export function parseHash(hash: string): RouteName {
  const path = hash.replace(/^#/, "");
  if (path.startsWith("/story")) return "story";
  if (path.startsWith("/scribble")) return "scribble";
  if (path.startsWith("/parker")) return "parker";
  return "home";
}

export function go(route: RouteName) {
  const next = route === "home" ? "#/" : `#/${route}`;
  if (window.location.hash === next) return;
  window.location.hash = next;
}
