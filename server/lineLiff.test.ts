import { describe, expect, it, vi } from "vitest";
import { LINE_CHANNEL_ID } from "../shared/lineLiff";
import { LineTokenVerificationError, verifyLineIdToken } from "./lineLiff";

const validPayload = () => ({
  iss: "https://access.line.me",
  sub: `U${"a".repeat(32)}`,
  aud: LINE_CHANNEL_ID,
  exp: Math.floor(Date.now() / 1000) + 300,
});

function mockFetch(payload: unknown, status = 200) {
  return vi.fn<typeof fetch>(async () => new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  }));
}

describe("verifyLineIdToken", () => {
  it("asks LINE to verify the token using the expected channel ID", async () => {
    const request = mockFetch(validPayload());
    const identity = await verifyLineIdToken("signed.line.id.token.value.example", request);
    expect(identity.userId).toBe(`U${"a".repeat(32)}`);
    const [url, init] = request.mock.calls[0]!;
    expect(url).toBe("https://api.line.me/oauth2/v2.1/verify");
    expect(init?.method).toBe("POST");
    expect(new URLSearchParams(init?.body as URLSearchParams).get("client_id")).toBe(LINE_CHANNEL_ID);
    expect(new URLSearchParams(init?.body as URLSearchParams).get("id_token")).toBe("signed.line.id.token.value.example");
  });

  it("rejects non-2xx token verification responses", async () => {
    await expect(verifyLineIdToken("signed.line.id.token.value.example", mockFetch({}, 400)))
      .rejects.toMatchObject({ code: "INVALID_TOKEN" });
  });

  it("rejects tokens for the wrong issuer, audience, subject, or expiry", async () => {
    for (const payload of [
      { ...validPayload(), iss: "https://attacker.example" },
      { ...validPayload(), aud: "wrong-channel" },
      { ...validPayload(), sub: "not-a-line-user" },
      { ...validPayload(), exp: Math.floor(Date.now() / 1000) - 1 },
    ]) {
      await expect(verifyLineIdToken("signed.line.id.token.value.example", mockFetch(payload)))
        .rejects.toBeInstanceOf(LineTokenVerificationError);
    }
  });

  it("does not accept oversized or malformed input", async () => {
    await expect(verifyLineIdToken("short")).rejects.toMatchObject({ code: "INVALID_TOKEN_SHAPE" });
    await expect(verifyLineIdToken("x".repeat(8193))).rejects.toMatchObject({ code: "INVALID_TOKEN_SHAPE" });
  });
});
