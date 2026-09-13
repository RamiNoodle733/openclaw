import { describe, expect, it } from "vitest";
import { resolvePairingSetupFromConfig } from "./setup-code.js";

describe("trusted-proxy pairing setup", () => {
  it("issues a bootstrap setup code without requiring a shared secret", async () => {
    const resolved = await resolvePairingSetupFromConfig(
      {
        gateway: {
          bind: "custom",
          customBindHost: "127.0.0.1",
          auth: {
            mode: "trusted-proxy",
            trustedProxy: { userHeader: "x-forwarded-user" },
          },
        },
      },
      {
        env: {},
        publicUrl: "wss://gateway.example.test",
        issuedBootstrap: {
          token: "bootstrap-123",
          expiresAtMs: 123,
          setupId: "setup-123",
        },
      },
    );

    expect(resolved.ok).toBe(true);
    if (!resolved.ok) {
      throw new Error(`expected setup resolution to succeed: ${resolved.error}`);
    }
    expect(resolved.authLabel).toBe("trusted-proxy");
    expect(resolved.payload).toMatchObject({
      url: "wss://gateway.example.test",
      bootstrapToken: "bootstrap-123",
      expiresAtMs: 123,
    });
  });
});
