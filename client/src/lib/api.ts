import { COOKIE_NAME } from "@shared/const";

function previewAuthorizationHeader() {
  try {
    const raw = sessionStorage.getItem("manus-cookie");
    if (!raw) return {};
    const prefix = `${COOKIE_NAME}=`;
    const pair = raw.split(";").find(item => item.trim().startsWith(prefix));
    const token = pair?.trim().slice(prefix.length);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const authorization = previewAuthorizationHeader();
  if (authorization.Authorization && !headers.has("Authorization")) {
    headers.set("Authorization", authorization.Authorization);
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}
