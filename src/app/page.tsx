// Owner: Arshawn. Today tab. Placeholder: shows the data each card will use, unstyled.
// Card list and order: PLAN.md, "Today page cards".

import { getTopDishNow, getTopDishOnCampus, getLeaderboard } from "@/lib/rankings";
import { getBudgetSnapshot } from "@/lib/budget";
import { HALLS } from "@/lib/halls";

export default async function TodayPage() {
  const [top, campus, board, budget] = await Promise.all([
    getTopDishNow("40"), // TODO: the user's usual hall from onboarding
    getTopDishOnCampus(),
    getLeaderboard(),
    getBudgetSnapshot(),
  ]);
  const hallName = (id: string) => HALLS.find((h) => h.id === id)?.short ?? id;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Today</h1>
      <section>
        <h2 className="text-sm opacity-60">Top pick right now</h2>
        <p>{top?.name}</p>
        <p className="text-sm opacity-60">
          Best on campus: {campus?.name} at {campus && hallName(campus.hallId)}
        </p>
      </section>
      <section>
        <h2 className="text-sm opacity-60">This week</h2>
        {board.slice(0, 3).map((s) => (
          <p key={s.hallId}>
            {s.rank}. {hallName(s.hallId)}
          </p>
        ))}
      </section>
      <section>
        <h2 className="text-sm opacity-60">Slug Points</h2>
        <p>
          {budget.pointsLeft} points, {budget.daysLeft} days left
        </p>
      </section>
    </div>
  );
}
