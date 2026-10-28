// What a report shows, not what it was merged under. causes.ts tells `parser` from `hint`; the
// desk's own notes (desk-notes.json) mark the reports where a date moved by one day, which no
// month/day swap can do. Those are a third problem, not a footnote under `parser`.
import { causeOf, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day', 'unplaced'];

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem {
  if (oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const by = new Map<Problem, Report[]>();
  for (const r of reports) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  return PROBLEMS.filter((p) => by.has(p)).map((problem) => {
    const rs = by.get(problem)!;
    const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
    return {
      problem,
      reports: rs,
      tenants: new Set(rs.map((r) => r.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
    };
  });
}
