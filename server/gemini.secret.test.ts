import { describe, expect, it } from "vitest";

describe("Gemini API secret", () => {
  it("authenticates against the Gemini models endpoint", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey, "GEMINI_API_KEY must be configured").toBeTruthy();

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?pageSize=1",
      {
        headers: {
          "x-goog-api-key": apiKey!,
        },
      }
    );

    const body = await response.text();
    expect(response.ok, `Gemini credential validation failed (${response.status})`).toBe(true);
    expect(body).toContain("models");
  }, 30_000);
});
