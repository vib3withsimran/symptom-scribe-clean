import { describe, expect, it } from "vitest";
import {
  computeRiskScore,
  parseSymptomConsultation,
  shouldPersistConsultation,
} from "@/lib/symptom-consultation";

describe("symptom consultation helpers", () => {
  it("parses consultation sections without relying on exact heading casing", () => {
    const parsed = parseSymptomConsultation(`
possible causes
- Viral infection
- Dehydration

severity: Moderate

RECOMMENDATIONS
1. Rest
2. Increase fluids
`);

    expect(parsed.possibleCauses).toEqual(["Viral infection", "Dehydration"]);
    expect(parsed.recommendations).toEqual(["Rest", "Increase fluids"]);
    expect(parsed.severityLevel).toBe("moderate");
  });

  it("persists completed consultations even when the AI response format varies", () => {
    expect(shouldPersistConsultation("Likely a mild viral illness. Please rest and hydrate.")).toBe(
      true
    );
    expect(shouldPersistConsultation("   ")).toBe(false);
  });

  it("keeps computed risk scores within the expected severity bands", () => {
    expect(computeRiskScore("high", 2, 1)).toBeGreaterThanOrEqual(70);
    expect(computeRiskScore("moderate", 1, 1)).toBeGreaterThanOrEqual(40);
    expect(computeRiskScore("moderate", 1, 1)).toBeLessThanOrEqual(69);
    expect(computeRiskScore("low", 0, 0)).toBeLessThanOrEqual(39);
  });
});
