import { LINE_CHANNEL_ID } from "../shared/lineLiff";

const LINE_VERIFY_ENDPOINT = "https://api.line.me/oauth2/v2.1/verify";

type LineVerifyResponse = {
  iss?: unknown;
  sub?: unknown;
  aud?: unknown;
  exp?: unknown;
};

export class LineTokenVerificationError extends Error {
  readonly code: string;

  constructor(code: string) {
    super("LINE ID token verification failed");
    this.name = "LineTokenVerificationError";
    this.code = code;
  }
}

/**
 * Verifies an ID token directly with LINE. Never decode or trust a profile sent
 * by the browser; persist only the verified LINE subject returned by LINE.
 */
export async function verifyLineIdToken(
  idToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ userId: string }> {
  if (typeof idToken !== "string" || idToken.length < 32 || idToken.length > 8192) {
    throw new LineTokenVerificationError("INVALID_TOKEN_SHAPE");
  }

  const form = new URLSearchParams({ id_token: idToken, client_id: LINE_CHANNEL_ID });
  let response: Response;
  try {
    response = await fetchImpl(LINE_VERIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new LineTokenVerificationError("LINE_UNAVAILABLE");
  }

  if (!response.ok) throw new LineTokenVerificationError("INVALID_TOKEN");

  let payload: LineVerifyResponse;
  try {
    payload = await response.json() as LineVerifyResponse;
  } catch {
    throw new LineTokenVerificationError("INVALID_RESPONSE");
  }

  if (payload.iss !== "https://access.line.me") throw new LineTokenVerificationError("INVALID_ISSUER");
  if (payload.aud !== LINE_CHANNEL_ID) throw new LineTokenVerificationError("INVALID_AUDIENCE");
  if (typeof payload.sub !== "string" || !/^U[a-f0-9]{20,64}$/i.test(payload.sub)) {
    throw new LineTokenVerificationError("INVALID_SUBJECT");
  }
  if (typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new LineTokenVerificationError("EXPIRED_TOKEN");
  }

  return { userId: payload.sub };
}
