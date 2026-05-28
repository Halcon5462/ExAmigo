export const buildWebSocketUrl = (path) => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${protocol}//${window.location.host}${normalizedPath}`;
};
