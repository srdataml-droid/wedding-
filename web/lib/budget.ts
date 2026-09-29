// A private wedding budget (D-011). Numbers only: Together never holds or moves money.
// Line ids are stored in the couple's budget, so never rename an id once it is live.

export const BUDGET_LINES = [
  { id: "venue", label: "Venues" },
  { id: "catering", label: "Catering and drinks" },
  { id: "decor", label: "Decoration" },
  { id: "photo-video", label: "Photography and video" },
  { id: "attire", label: "Outfits and aso-ebi" },
  { id: "makeup", label: "Makeup and gele" },
  { id: "entertainment", label: "MC, DJ or band" },
  { id: "cake", label: "Cake and small chops" },
  { id: "traditional", label: "Traditional rites and list items" },
  { id: "rings", label: "Rings" },
  { id: "souvenirs", label: "Souvenirs" },
  { id: "transport", label: "Transport" },
  { id: "other", label: "Other" },
] as const;

export type BudgetLine = { planned: number | null; paid: number | null };
export type Budget = { target: number | null; lines: Record<string, BudgetLine> };

const MAX_NAIRA = 100_000_000_000;

// "₦1,500,000" or "1500000" → 1500000. Empty or junk → null.
export function parseNaira(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const value = Number.parseInt(digits, 10);
  return Number.isFinite(value) ? Math.min(value, MAX_NAIRA) : null;
}

export function readBudget(raw: unknown): Budget {
  const empty: Budget = { target: null, lines: {} };
  if (!raw || typeof raw !== "object") return empty;
  const obj = raw as { target?: unknown; lines?: unknown };
  const target = typeof obj.target === "number" ? obj.target : null;
  const lines: Record<string, BudgetLine> = {};
  if (obj.lines && typeof obj.lines === "object") {
    for (const { id } of BUDGET_LINES) {
      const line = (obj.lines as Record<string, { planned?: unknown; paid?: unknown }>)[id];
      if (!line) continue;
      lines[id] = {
        planned: typeof line.planned === "number" ? line.planned : null,
        paid: typeof line.paid === "number" ? line.paid : null,
      };
    }
  }
  return { target, lines };
}

export function budgetTotals(budget: Budget) {
  let planned = 0;
  let paid = 0;
  for (const line of Object.values(budget.lines)) {
    planned += line.planned ?? 0;
    paid += line.paid ?? 0;
  }
  return { planned, paid, toPay: Math.max(planned - paid, 0) };
}
