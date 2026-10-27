"use client";

import { useEffect, useState } from "react";
import { QuickLogModal } from "@/components/QuickLogModal";
import { LiveExtractionModal } from "@/components/LiveExtractionModal";
import { HomeIntro } from "@/components/HomeIntro";
import { beanLabel } from "@/lib/beans";
import { loadRecipes, saveRecipes, type Recipe } from "@/lib/recipes";
import {
  clearLiveDraft,
  loadLiveDraft,
  requiredProgress,
  saveLiveDraft,
  type LiveDraft,
} from "@/lib/liveExtraction";
import { formatWhen } from "@/lib/format";
import type { Bean, Shot } from "@/lib/api";

const BEAN_KEY = "csi:currentBean";

function daysOffRoast(roastDate: string): number {
  const ms = Date.now() - new Date(roastDate).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

export function HomeActions({ beans, shots }: { beans: Bean[]; shots: Shot[] }) {
  const [beanId, setBeanId] = useState<number | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [addingRecipe, setAddingRecipe] = useState(false);
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [liveDraft, setLiveDraft] = useState<LiveDraft | null>(null);
  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [liveModalDraft, setLiveModalDraft] = useState<LiveDraft | null>(
    null,
  );
  const [interruptedElapsedS, setInterruptedElapsedS] = useState<
    number | null
  >(null);
  const [newName, setNewName] = useState("");
  const [newDose, setNewDose] = useState("");
  const [newYield, setNewYield] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrating from
       localStorage (client-only) after mount is the standard exception */
    let storedId = NaN;
    try {
      storedId = Number(localStorage.getItem(BEAN_KEY));
    } catch {
      // localStorage can throw (private browsing, storage restrictions) -
      // fall through to the default bean below instead of getting stuck.
    }
    const initialBeanId =
      beans.find((b) => b.id === storedId)?.id ?? beans[0]?.id ?? null;
    const loadedRecipes = loadRecipes();
    setBeanId(initialBeanId);
    setRecipes(loadedRecipes);
    setRecipeId(
      loadedRecipes.find((r) => r.beanId === initialBeanId)?.id ?? null,
    );
    setLiveDraft(loadLiveDraft());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [beans]);

  useEffect(() => {
    if (beanId === null) return;
    try {
      localStorage.setItem(BEAN_KEY, String(beanId));
    } catch {
      // ignore - remembering the last bean is a convenience, not required
    }
  }, [beanId]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- reading the system
       clock (an external source) is the standard exception */
    if (liveDraft && liveDraft.phase === "running") {
      setInterruptedElapsedS((Date.now() - liveDraft.startedAt) / 1000);
    } else {
      setInterruptedElapsedS(null);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [liveDraft]);

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
    saveRecipes(next);
    setRecipeId(newRecipe.id);
    setAddingRecipe(false);
    setNewName("");
    setNewDose("");
    setNewYield("");
    setNewTime("");
  }

  function handleDraftChange(draft: LiveDraft | null) {
    setLiveDraft(draft);
    if (draft) {
      saveLiveDraft(draft);
    } else {
      clearLiveDraft();
    }
  }

  function discardDraft() {
    setLiveDraft(null);
    clearLiveDraft();
  }

  function startLiveExtraction() {
    setLiveModalDraft(null);
    setLiveModalOpen(true);
  }

  function resumeDraft() {
    setLiveModalDraft(liveDraft);
    setLiveModalOpen(true);
  }

  function restoreInterrupted() {
    if (!liveDraft) return;
    const elapsed = Math.round(((Date.now() - liveDraft.startedAt) / 1000) * 10) / 10;
    const reviewDraft: LiveDraft = {
      ...liveDraft,
      phase: "review",
      durationS: elapsed,
    };
    setLiveDraft(reviewDraft);
    saveLiveDraft(reviewDraft);
    setLiveModalDraft(reviewDraft);
    setLiveModalOpen(true);
  }

  const draftBean = liveDraft
    ? beans.find((b) => b.id === liveDraft.beanId)
    : undefined;
  const draftProgress = liveDraft ? requiredProgress(liveDraft) : null;

  if (bean === undefined) return null;

  return (
    <div className="flex flex-col gap-3">
      {!introDone ? (
        <HomeIntro onFinished={() => setIntroDone(true)} />
      ) : null}

      <div
        className={`flex flex-col gap-3 transition-all duration-300 ${
          introDone
            ? "opacity-100 scale-100"
            : "pointer-events-none h-0 overflow-hidden opacity-0 scale-95"
        }`}
      >
      {liveDraft && draftBean ? (
        liveDraft.phase === "running" ? (
          <div className="flex flex-col gap-2 rounded-xl border border-warning-border bg-warning-bg p-4">
            <span className="self-start rounded-full bg-warning-border/50 px-2.5 py-1 text-[11px] font-semibold">
              Extraction interrupted
            </span>
            <div className="text-[14.5px] font-semibold">{draftBean.name}</div>
            <p className="m-0 text-[13px] leading-relaxed text-text-muted">
              The timer had reached{" "}
              {interruptedElapsedS !== null
                ? interruptedElapsedS.toFixed(1)
                : "—"}{" "}
              s ({formatWhen(new Date(liveDraft.startedAt).toISOString())})
              when the page closed. Restore to confirm the time and finish
              logging.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={restoreInterrupted}
                className="h-10 rounded-full bg-text px-4 text-xs font-semibold text-background"
              >
                Restore
              </button>
              <button
                type="button"
                onClick={discardDraft}
                className="h-10 rounded-full border border-border px-4 text-xs font-semibold"
              >
                Discard
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-draft/30 px-2.5 py-1 text-[11px] font-semibold">
                Draft &middot; not saved
              </span>
              <span className="text-[11px] text-text-muted">
                In this browser only
              </span>
            </div>
            <div className="text-[14.5px] font-semibold">{draftBean.name}</div>
            <div className="font-mono text-[13px] text-text-muted">
              {liveDraft.actualDose.toFixed(1)} g &rarr;{" "}
              {(liveDraft.actualYield ?? liveDraft.targetYield ?? 0).toFixed(
                1,
              )}{" "}
              g &middot; {draftProgress?.done} of {draftProgress?.total}{" "}
              required &middot;{" "}
              {formatWhen(new Date(liveDraft.startedAt).toISOString())}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resumeDraft}
                className="h-10 rounded-full bg-text px-4 text-xs font-semibold text-background"
              >
                Resume draft
              </button>
              <button
                type="button"
                onClick={discardDraft}
                className="h-10 rounded-full border border-border px-4 text-xs font-semibold"
              >
                Discard
              </button>
            </div>
          </div>
        )
      ) : null}

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
        className="h-[60px] w-full rounded-full bg-text text-base font-semibold text-background"
      >
        Quick log
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={startLiveExtraction}
          aria-label="Time a live extraction"
          className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-primary shadow-[0_6px_18px_-4px_rgba(169,201,119,0.55)] transition-all duration-150 ease-out hover:brightness-95 active:scale-[0.97] active:shadow-[0_2px_8px_-2px_rgba(169,201,119,0.5)]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-text">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <span className="text-[13.5px] font-semibold text-text">
          Time a live extraction
        </span>
      </div>

      {quickLogOpen ? (
        <QuickLogModal
          beans={beans}
          defaultBeanId={beanId ?? undefined}
          onClose={() => setQuickLogOpen(false)}
        />
      ) : null}

      {liveModalOpen ? (
        <LiveExtractionModal
          beans={beans}
          shots={shots}
          defaultBeanId={beanId}
          defaultRecipe={recipe}
          draft={liveModalDraft}
          onClose={() => setLiveModalOpen(false)}
          onDraftChange={handleDraftChange}
        />
      ) : null}
      </div>
    </div>
  );
}
