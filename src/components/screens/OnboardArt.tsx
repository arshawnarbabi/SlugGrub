"use client";

// Owner: Arshawn. Onboarding illustrations (his ask 2026-11-14: "really nice and polished graphics and not crowd everything to the
// top of the screen"). Drawn from the design system, not stock art: card fills, the Sidestash raise and chip shadow, the primary
// blue for what the student picked, ink tokens for everything else. Each one answers its question visually and follows the choice:
//   plan:    three plan cards fanned out, the chosen plan in front with its points per quarter
//   points:  the Budget ring, filled to the points they enter
//   college: a raised college card (fanned like the plan cards) with the college's name, its blue seal and its dining hall
//   hall:    a raised card previewing their usual hall now: one of today's dishes with its photo, the hall's open status
// (the campus maps were dropped at his review 2026-11-14, S12/S13: "i dont like this ggraphic")
// State changes blur-fade (DESIGN motion.state_change); nothing slides in when a step opens.
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RiceBowl01Icon, Mortarboard01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Swap } from "@/components/ui/motion";
import type { College, HallId, MealName, MealPlanId } from "@/lib/types";
import { HALLS, MEAL_PLANS, mealNow } from "@/lib/halls";
import type { DemoPlates } from "./demoPlates";
import { campusNow, mealLabel } from "./now";

const ART_H = 236;

function Frame({ children }: { children: React.ReactNode }) {
  return <div style={{ height: ART_H, display: "grid", placeItems: "center", position: "relative" }}>{children}</div>;
}

export function PlanArt({ plan }: { plan: MealPlanId }) {
  const order = MEAL_PLANS.map((p) => p.id);
  const front = MEAL_PLANS.find((p) => p.id === plan) ?? MEAL_PLANS[0];
  const back = order.filter((id) => id !== plan).slice(0, 2);
  return (
    <Frame>
      <div style={{ position: "relative", width: 230, height: 150 }}>
        {back.map((id, k) => (
          <div key={id} className="art-card" style={{ position: "absolute", inset: 0, transform: `rotate(${k === 0 ? -9 : 8}deg) translate(${k === 0 ? -18 : 18}px, ${k === 0 ? 6 : 10}px)`, opacity: 0.7 }} />
        ))}
        <div className="art-card raised" style={{ position: "absolute", inset: 0, padding: 18, display: "grid", alignContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="art-chip"><Icon icon={RiceBowl01Icon} size={14} sw={2} /> Meal plan</span>
            <span style={{ width: 34, height: 22, borderRadius: 6, background: "linear-gradient(135deg, var(--y9), var(--y11))", opacity: 0.85 }} />
          </div>
          <div>
            <div className="label" style={{ fontSize: 12 }}><Swap id={front.id}>{front.label} plan</Swap></div>
            <div className="num" style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              <Swap id={front.id}>{front.pointsPerQuarter.toLocaleString()}</Swap>
            </div>
            <div className="label" style={{ fontSize: 12 }}>Slug Points each quarter</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function PointsArt({ points, total }: { points: number; total: number }) {
  const r = 78, c = 2 * Math.PI * r, SWEEP = 250, arc = c * (SWEEP / 360);
  const share = Math.max(0, Math.min(1, points / Math.max(1, total)));
  const reduce = useReducedMotion();
  return (
    <Frame>
      <div style={{ position: "relative", width: 190, height: 190 }}>
        <svg width="190" height="190" viewBox="0 0 190 190" style={{ transform: `rotate(${90 + (360 - SWEEP) / 2}deg)` }} aria-hidden>
          <circle cx="95" cy="95" r={r} fill="none" stroke="var(--paper-2)" strokeWidth="14" strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
          <motion.circle cx="95" cy="95" r={r} fill="none" stroke="var(--p9)" strokeWidth="14" strokeLinecap="round"
            initial={false} animate={{ strokeDasharray: `${arc * share} ${c}` }} transition={reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div className="hero-num" style={{ fontSize: 40 }}>{points.toLocaleString()}</div>
            <div className="label" style={{ fontSize: 12 }}>of {total.toLocaleString()} points</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/** The two faded cards behind a raised front card, as on the meal plan step. */
function BackCards() {
  return (
    <>
      {[0, 1].map((k) => (
        <div key={k} className="art-card" style={{ position: "absolute", inset: 0, transform: `rotate(${k === 0 ? -9 : 8}deg) translate(${k === 0 ? -18 : 18}px, ${k === 0 ? 6 : 10}px)`, opacity: 0.7 }} />
      ))}
    </>
  );
}

const INITIALS: Partial<Record<College, string>> = { "College Nine": "C9", "John R. Lewis": "JRL", "Rachel Carson": "RC" };

export function CollegeArt({ college }: { college: College }) {
  const hall = HALLS.find((h) => h.colleges.includes(college));
  return (
    <Frame>
      <div style={{ position: "relative", width: 240, height: 158 }}>
        <BackCards />
        <div className="art-card raised" style={{ position: "absolute", inset: 0, padding: 18, display: "grid", alignContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="art-chip"><Icon icon={Mortarboard01Icon} size={14} sw={2} /> Your college</span>
            <span className="art-seal num"><Swap id={college}>{INITIALS[college] ?? college[0]}</Swap></span>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15 }}><Swap id={college}>{college}</Swap></div>
            <div className="label" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
              <Icon icon={RiceBowl01Icon} size={13} sw={2} /><Swap id={hall?.id ?? "none"}>{hall ? `Dining hall: ${hall.short}` : "Pick your college"}</Swap>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/** Their usual hall as it is right now: open status from today's real hours, and one of today's dishes with its photo, so the step
 *  previews what Today will show them. The clock is read after mount (never during render). */
export function HallArt({ hall, dishes }: { hall: HallId; dishes: DemoPlates }) {
  const [now, setNow] = useState<{ date: string; minutes: number } | null>(null);
  useEffect(() => { setNow(campusNow(new Date())); }, []);
  const info = HALLS.find((h) => h.id === hall);
  const status = now ? mealNow(hall, now.date, now.minutes) : null;
  const menu = dishes[hall] ?? {};
  const meal: MealName | undefined = (status?.meal && menu[status.meal] ? status.meal : undefined) ?? (Object.keys(menu) as MealName[]).at(-1);
  const dish = meal ? menu[meal] : undefined;
  const statusText = status ? status.text[0].toUpperCase() + status.text.slice(1) : " ";
  return (
    <Frame>
      <div style={{ position: "relative", width: 240, height: 216 }}>
        <BackCards />
        <div className="art-card raised" style={{ position: "absolute", inset: 0, padding: 8, display: "grid", gridTemplateRows: "auto 1fr" }}>
          <Swap id={hall + (dish?.name ?? "")} style={{ display: "block" }}>
            {dish ? <Photo src={dish.photo} h={112} r={16} eager />
              : <div className="ph" style={{ width: "100%", height: 112, borderRadius: 16, display: "grid", placeItems: "center", color: "var(--ink-3)" }}><Icon icon={RiceBowl01Icon} size={28} /></div>}
          </Swap>
          <div style={{ padding: "10px 8px 2px", display: "grid", alignContent: "center", gap: 2, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}><Swap id={hall}>{info?.short ?? ""}</Swap></div>
            <div className="label" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <span style={{ width: 7, height: 7, borderRadius: 9, flex: "none", background: status?.open ? "var(--ok)" : "var(--ink-3)" }} />
              <Swap id={hall + statusText}>{statusText}</Swap>
            </div>
            <Swap id={hall + (dish?.name ?? "")} style={{ display: "block", minWidth: 0 }}>
              <span className="clamp1 label" style={{ fontSize: 12 }}>{dish && meal ? `${mealLabel(meal)}: ${dish.name}` : " "}</span>
            </Swap>
          </div>
        </div>
      </div>
    </Frame>
  );
}
