import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../../config/types.openclaw.js";
import { testing } from "./compact.js";

describe("compaction fallback ownership", () => {
  it("keeps explicit agent ownership for a global session", () => {
    const config: OpenClawConfig = {
      agents: {
        ownership: "explicit",
        entries: { main: {}, beta: {} },
      },
    };

    expect(() =>
      testing.resolveCompactionFallbacksOverride({
        config,
        agentId: "main",
        sessionKey: "global",
      } as Parameters<typeof testing.resolveCompactionFallbacksOverride>[0]),
    ).not.toThrow();
  });
});
