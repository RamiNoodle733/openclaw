import { afterEach, expect, it, vi } from "vitest";
import { createTestAdmittedRunContext } from "../agents/admitted-run-context.test-support.js";
import {
  claimAgentRunDelegatedAuthority,
  resetAgentRunRegistryForTest,
} from "../infra/agent-run-registry.js";
import type { AgentRuntimeIdentity } from "./agent-runtime-identity-token.js";
import {
  createCronCreatorAuthorityRunScope,
  mintCronCreatorAuthorityGrant,
  revokeCronCreatorAuthorityRunScope,
  withCronManagementGrant,
} from "./cron-creator-authority-grant.js";

afterEach(() => {
  vi.restoreAllMocks();
  resetAgentRunRegistryForTest();
});

it("rejects run history when its management grant expires during processing", async () => {
  const clock = vi.spyOn(Date, "now").mockReturnValue(1_000);
  const runId = "run-history-expiry";
  const { operationalRunInstance } = createTestAdmittedRunContext(runId);
  const authority = claimAgentRunDelegatedAuthority(operationalRunInstance);
  const scope = createCronCreatorAuthorityRunScope(runId, { kind: "local" }, true);
  const operation = new AbortController();
  const identity: AgentRuntimeIdentity = {
    kind: "agentRuntime",
    agentId: "main",
    sessionKey: "agent:main:control-ui",
    operationalRunInstance,
    delegatedAuthority: { kind: "local", ...authority },
  };
  const grant = mintCronCreatorAuthorityGrant(scope, operation.signal, undefined, {
    method: "cron.runs",
    authority,
  });

  await expect(
    withCronManagementGrant(grant, identity, "cron.runs", async () => {
      // Simulate history loading/filtering crossing the 60-second grant boundary.
      clock.mockReturnValue(61_000);
      return { entries: [{ id: "must-not-be-released" }] };
    }),
  ).rejects.toThrow("Automation admin grant is missing, expired, or already used");

  revokeCronCreatorAuthorityRunScope(scope);
});
