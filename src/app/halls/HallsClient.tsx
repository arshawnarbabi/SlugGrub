// Owner: Ethan. Client UI for dining halls menu and campus cafe board.

"use client";

import { useState } from "react";
import type { Cafe } from "@/lib/menus";
import type { DayMenu, HallId, MealName } from "@/lib/types";

const HALLS: { id: HallId; name: string }[] = [
  { id: "40", name: "College Nine & JRL" },
  { id: "05", name: "Cowell & Stevenson" },
  { id: "20", name: "Crown & Merrill" },
  { id: "25", name: "Porter & Kresge" },
  { id: "30", name: "Rachel Carson & Oakes" },
];

const MEALS: MealName[] = ["Breakfast", "Lunch", "Dinner", "Late Night"];

interface HallsClientProps {
  initialMenus: DayMenu[];
  cafes: Cafe[];
}

export function HallsClient({ initialMenus, cafes }: HallsClientProps) {
  const [board, setBoard] = useState<"halls" | "cafes">("halls");
  const [selectedHall, setSelectedHall] = useState<HallId>("40");
  const [selectedMeal, setSelectedMeal] = useState<MealName>("Dinner");
  const [selectedCafeId, setSelectedCafeId] = useState<string>(cafes[0]?.id ?? "");

  const menu = initialMenus.find((m) => m.hallId === selectedHall) ?? null;
  const dishes = menu?.meals[selectedMeal] ?? [];
  const activeCafe = cafes.find((c) => c.id === selectedCafeId) ?? cafes[0] ?? null;

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Halls vs Cafes Board Toggle */}
      <div className="flex bg-neutral-100 rounded-lg p-1 text-xs">
        <button
          onClick={() => setBoard("halls")}
          className={`flex-1 py-1.5 rounded-md font-medium transition ${
            board === "halls" ? "bg-white shadow-sm font-semibold" : "text-neutral-500"
          }`}
        >
          Dining Halls
        </button>
        <button
          onClick={() => setBoard("cafes")}
          className={`flex-1 py-1.5 rounded-md font-medium transition ${
            board === "cafes" ? "bg-white shadow-sm font-semibold" : "text-neutral-500"
          }`}
        >
          Cafe Board ({cafes.length})
        </button>
      </div>

      {board === "halls" ? (
        <>
          {/* Hall Selector Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {HALLS.map((h) => (
              <button
                key={h.id}
                onClick={() => setSelectedHall(h.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedHall === h.id ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {h.name}
              </button>
            ))}
          </div>

          {/* Meal Tabs */}
          <div className="flex bg-neutral-100 rounded-lg p-1 text-xs">
            {MEALS.map((meal) => (
              <button
                key={meal}
                onClick={() => setSelectedMeal(meal)}
                className={`flex-1 py-1.5 rounded-md font-medium capitalize transition ${
                  selectedMeal === meal ? "bg-white shadow-sm font-semibold" : "text-neutral-500"
                }`}
              >
                {meal}
              </button>
            ))}
          </div>

          {/* Dish List */}
          <div className="space-y-3">
            {dishes.length === 0 ? (
              <p className="text-center text-sm text-neutral-400 py-8">No menu available for this meal.</p>
            ) : (
              dishes.map((dish, idx) => (
                <div
                  key={`${dish.category}-${dish.recipeId}-${idx}`}
                  className="p-3 border rounded-xl bg-white shadow-xs flex justify-between items-center"
                >
                  <div>
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">{dish.category}</p>
                    <h3 className="font-medium text-sm text-neutral-900">{dish.name}</h3>
                    {dish.portion && <p className="text-xs text-neutral-400">Serving: {dish.portion}</p>}
                  </div>
                  {dish.nutrition?.calories !== undefined ? (
                    <span className="text-xs font-bold px-2.5 py-1 bg-neutral-100 rounded-lg">
                      {dish.nutrition.calories} cal
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Cafe Selector Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {cafes.map((cafe) => (
              <button
                key={cafe.id}
                onClick={() => setSelectedCafeId(cafe.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  activeCafe?.id === cafe.id ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {cafe.short}
              </button>
            ))}
          </div>

          {!activeCafe ? (
            <p className="text-center text-sm text-neutral-400 py-8">No cafe data available.</p>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-xl border bg-neutral-50 space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm text-neutral-900">{activeCafe.name}</h2>
                  <span className="text-[11px] font-medium text-neutral-500">{activeCafe.location}</span>
                </div>
                <p className="text-xs text-neutral-600">{activeCafe.description}</p>
                <p className="text-[11px] text-neutral-400">
                  Static menu ({activeCafe.itemCount} items) — rankings carry over daily
                </p>
              </div>

              {activeCafe.categories.map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">{cat.name}</p>
                  {cat.items.map((item, idx) => (
                    <div
                      key={`${cat.name}-${item.recipeId}-${idx}`}
                      className="p-3 border rounded-xl bg-white shadow-xs flex justify-between items-center"
                    >
                      <h3 className="font-medium text-sm text-neutral-900">{item.name}</h3>
                      {item.portion && (
                        <span className="text-xs text-neutral-500 px-2 py-0.5 bg-neutral-100 rounded-md">
                          {item.portion}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
