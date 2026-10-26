"use client";

import { useEffect, useState } from "react";
import { QuickLogModal } from "@/components/QuickLogModal";
import { beanLabel } from "@/lib/beans";
import type { Bean } from "@/lib/api";

type Recipe = {
  id: string;
  beanId: number;
  name: string;
  dose: number;
  yield: number;
  time: number;
};

const BEAN_KEY = "csi:currentBean";
const RECIPES_KEY = "csi:recipes";

function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function daysOffRoast(roastDate: string): number {
  const ms = Date.now() - new Date(roastDate).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

export function HomeActions({ beans }: { beans: Bean[] }) {
  const [beanId, setBeanId] = useState<number | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [addingRecipe, setAddingRecipe] = useState(false);
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDose, setNewDose] = useState("");
  const [newYield, setNewYield] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrating from
       localStorage (client-only) after mount is the standard exception */
    const storedId = Number(localStorage.getItem(BEAN_KEY));
    const initialBeanId =
      beans.find((b) => b.id === storedId)?.id ?? beans[0]?.id ?? null;
    const loadedRecipes = loadRecipes();
    setBeanId(initialBeanId);
    setRecipes(loadedRecipes);
    setRecipeId(
      loadedRecipes.find((r) => r.beanId === initialBeanId)?.id ?? null,
    );
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [beans]);

  useEffect(() => {
    if (beanId !== null) localStorage.setItem(BEAN_KEY, String(beanId));
  }, [beanId]);

  const bean = beans.find((b) => b.id === beanId);
  const beanRecipes = recipes.filter((r) => r.beanId === beanId);
  const recipe = beanRecipes.find((r) => r.id === recipeId) ?? null;

  function selectBean(id: number) {
    setBeanId(id);
    setRecipeId(recipes.find((r) => r.beanId === id)?.id ?? null);
    setAddingRecipe(false);
  }

  function saveRecipe() {
    const dose = Number(newDose);
    const yieldAmount = Number(newYield);
    const time = Number(newTime);
    if (
      !newName.trim() ||
      !(dose > 0) ||
      !(yieldAmount > 0) ||
      !(time > 0) ||
      beanId === null
    ) {
      return;
    }
    const newRecipe: Recipe = {
      id: crypto.randomUUID(),
      beanId,
      name: newName.trim(),
      dose,
      yield: yieldAmount,
      time,
    };
    const next = [...recipes, newRecipe];
    setRecipes(next);
    localStorage.setItem(RECIPES_KEY, JSON.stringify(next));
    setRecipeId(newRecipe.id);
    setAddingRecipe(false);
    setNewName("");
    setNewDose("");
    setNewYield("");
    setNewTime("");
  }

  if (bean === undefined) return null;

  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col gap-3 rounded-xl bg-white/55 p-4 backdrop-blur-md">
        <div className="text-[13px] text-text-muted">Brewing now</div>
        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold">Coffee</span>
            <select
              value={beanId ?? ""}
              onChange={(e) => selectBean(Number(e.target.value))}
              className="h-11 rounded-[10px] border border-border bg-surface px-3 text-sm font-semibold"
            >
              {beans.map((b) => (
                <option key={b.id} value={b.id}>
                  {beanLabel(b, beans)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold">Recipe</span>
            <select
              value={recipeId ?? ""}
              onChange={(e) => setRecipeId(e.target.value || null)}
              className="h-11 rounded-[10px] border border-border bg-surface px-3 text-sm font-semibold"
            >
              <option value="">No recipe</option>
              {beanRecipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-col gap-0.5 text-[12.5px] text-text-muted">
          <span>
            {bean.roaster} &middot; {daysOffRoast(bean.roast_date)} days off
            roast
          </span>
          {recipe ? (
            <span className="font-mono">
              Target {recipe.dose.toFixed(1)} &rarr; {recipe.yield.toFixed(1)} g
              &middot; {recipe.time.toFixed(0)} s &middot; on this device
            </span>
          ) : (
            <span>No recipe &middot; measurements only</span>
          )}
        </div>

        {addingRecipe ? (
          <div className="flex flex-col gap-2 rounded-[10px] bg-surface p-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Recipe name"
              className="h-10 rounded-lg border border-border px-2.5 text-sm"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                value={newDose}
                onChange={(e) => setNewDose(e.target.value)}
                type="number"
                step="0.1"
                placeholder="Dose g"
                className="h-10 rounded-lg border border-border px-2 font-mono text-sm"
              />
              <input
                value={newYield}
                onChange={(e) => setNewYield(e.target.value)}
                type="number"
                step="0.1"
                placeholder="Yield g"
                className="h-10 rounded-lg border border-border px-2 font-mono text-sm"
              />
              <input
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                type="number"
                step="1"
                placeholder="Time s"
                className="h-10 rounded-lg border border-border px-2 font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveRecipe}
                className="h-10 flex-1 rounded-full bg-text text-xs font-semibold text-background"
              >
                Save recipe
              </button>
              <button
                type="button"
                onClick={() => setAddingRecipe(false)}
                className="h-10 rounded-full border border-border px-3 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingRecipe(true)}
            className="self-start text-xs font-semibold underline"
          >
            + New recipe
          </button>
        )}
      </section>

      <button
        type="button"
        onClick={() => setQuickLogOpen(true)}
        className="h-[60px] w-full rounded-[34px_40px_36px_42px] bg-text text-base font-semibold text-background"
      >
        Quick log
      </button>

      {quickLogOpen ? (
        <QuickLogModal
          beans={beans}
          defaultBeanId={beanId ?? undefined}
          onClose={() => setQuickLogOpen(false)}
        />
      ) : null}
    </div>
  );
}
