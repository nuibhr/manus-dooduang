import { LINE_ENDPOINT_URL, LINE_LIFF_ID, LINE_LIFF_URL } from "@shared/lineLiff";

type LiffSDK = typeof import("@line/liff")["default"];

let liffPromise: Promise<LiffSDK> | null = null;
let initialization: Promise<void> | null = null;

/** Load the LINE SDK only when the user actually opens the LIFF feature. */
function loadLiff(): Promise<LiffSDK> {
  if (!liffPromise) {
    liffPromise = import("@line/liff").then(module => module.default).catch(error => {
      liffPromise = null;
      throw error;
    });
  }
  return liffPromise;
}

/** LIFF init only works at the configured endpoint origin or a path below it. */
export function isLineEndpointOrigin(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.origin === new URL(LINE_ENDPOINT_URL).origin;
}

/** Initialize once per page load, as required by LINE's LIFF SDK. */
export function initializeLineLiff(): Promise<void> {
  if (!isLineEndpointOrigin()) {
    return Promise.reject(new Error("LIFF must be initialized on the configured endpoint URL"));
  }

  if (!initialization) {
    initialization = loadLiff().then(liff => liff.init({
      liffId: LINE_LIFF_ID,
      // Keep login user-initiated in an external browser; inside LINE the LIFF session can already exist.
      withLoginOnExternalBrowser: false,
    })).catch(error => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}

export async function isLineLoggedIn(): Promise<boolean> {
  const liff = await loadLiff();
  return liff.isLoggedIn();
}

export async function startLineLogin(): Promise<void> {
  const liff = await loadLiff();
  liff.login({ redirectUri: window.location.href });
}

/** Return only the opaque signed ID token. Never send a browser-decoded profile to the server. */
export async function getLineIdToken(): Promise<string | null> {
  const liff = await loadLiff();
  return liff.getIDToken();
}

export { LINE_LIFF_URL };
