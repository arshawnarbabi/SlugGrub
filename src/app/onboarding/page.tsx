// Owner: Ethan. Meal plan, current points, college, usual hall.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HALLS, MEAL_PLANS } from "@/lib/halls";
import type { College, HallId, MealPlanId, UserProfile } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<MealPlanId>("blue");
  const [points, setPoints] = useState(String(MEAL_PLANS[0].pointsPerQuarter));
  const [college, setCollege] = useState<College>("Cowell");
  const [usualHall, setUsualHall] = useState<HallId>("05");

  function handlePlanChange(nextPlan: MealPlanId) {
    const prevPlanObj = MEAL_PLANS.find((p) => p.id === plan);
    const nextPlanObj = MEAL_PLANS.find((p) => p.id === nextPlan);
    setPlan(nextPlan);
    if (nextPlanObj && (!points || points === String(prevPlanObj?.pointsPerQuarter))) {
      setPoints(String(nextPlanObj.pointsPerQuarter));
    }
  }

  function handleSave() {
    const profile: UserProfile = {
      plan,
      pointsNow: Math.max(0, parseInt(points, 10) || 0),
      college,
      usualHall,
    };
    localStorage.setItem("sluggrub_profile", JSON.stringify(profile));
    router.push("/budget");
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome to SlugGrub</h1>
        <p className="text-sm text-neutral-500">Personalize your dining hall rankings & budget</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-neutral-600 block mb-1">Your Meal Plan</label>
          <select
            value={plan}
            onChange={(e) => handlePlanChange(e.target.value as MealPlanId)}
            className="w-full border p-2.5 rounded-lg text-sm bg-white"
          >
            {MEAL_PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} Plan ({p.pointsPerQuarter.toLocaleString()} {p.id === "unlimited" ? "cafe " : ""}pts)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-600 block mb-1">
            Current Slug Points Balance
          </label>
          <input
            type="number"
            min={0}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="w-full border p-2.5 rounded-lg text-sm"
            placeholder="e.g. 1120"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-600 block mb-1">
            Your Residential College
          </label>
          <select
            value={college}
            onChange={(e) => setCollege(e.target.value as College)}
            className="w-full border p-2.5 rounded-lg text-sm bg-white"
          >
            <option value="Cowell">Cowell</option>
            <option value="Stevenson">Stevenson</option>
            <option value="Crown">Crown</option>
            <option value="Merrill">Merrill</option>
            <option value="Porter">Porter</option>
            <option value="Kresge">Kresge</option>
            <option value="Rachel Carson">Rachel Carson</option>
            <option value="Oakes">Oakes</option>
            <option value="College Nine">College Nine</option>
            <option value="John R. Lewis">John R. Lewis</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-600 block mb-1">
            Default Dining Hall
          </label>
          <select
            value={usualHall}
            onChange={(e) => setUsualHall(e.target.value as HallId)}
            className="w-full border p-2.5 rounded-lg text-sm bg-white"
          >
            {HALLS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleSave}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-sm hover:bg-blue-700 transition"
      >
        Get Started
      </button>
    </div>
  );
}
