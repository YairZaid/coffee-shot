"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addShotAction, type AddShotState } from "@/app/actions";
import { beanLabel } from "@/lib/beans";
import { formatWhen } from "@/lib/format";
import type { Recipe } from "@/lib/recipes";
import type { LiveDraft } from "@/lib/liveExtraction";
import type { Bean, Shot } from "@/lib/api";

const initialState: AddShotState = { error: null };

const RATINGS = Array.from({ length: 5 }, (_, i) => i + 1);

type Step = "setup" | "extract" | "review";

export function LiveExtractionModal({
  beans,
  shots,
  defaultBeanId,
  defaultRecipe,
  draft,
  onClose,
  onDraftChange,
}: {
  beans: Bean[];
  shots: Shot[];
  defaultBeanId: number | null;
  defaultRecipe: Recipe | null;
  draft: LiveDraft | null;
  onClose: () => void;
  onDraftChange: (draft: LiveDraft | null) => void;
}) {
  const [state, formAction, pending] = useActionState(
    addShotAction,
    initialState,
  );
  const submittedRef = useRef(false);

  const [step, setStep] = useState<Step>(draft ? "review" : "setup");
  const [beanId, setBeanId] = useState<number | null>(
    draft?.beanId ?? defaultBeanId,
  );
  const [recipe, setRecipe] = useState<Recipe | null>(defaultRecipe);
  const [actualDose, setActualDose] = useState(
    draft ? String(draft.actualDose) : "",
  );
  const [startedAt, setStartedAt] = useState<number | null>(
    draft?.startedAt ?? null,
  );
  const [elapsedS, setElapsedS] = useState(draft?.durationS ?? 0);
  const [actualYield, setActualYield] = useState(
    draft?.actualYield != null ? String(draft.actualYield) : "",
  );
  const [durationInput, setDurationInput] = useState(
    draft?.durationS != null ? String(draft.durationS) : "",
  );
  const [grindSize, setGrindSize] = useState(
    draft?.grindSize != null ? String(draft.grindSize) : "",
  );
  const [grindTime, setGrindTime] = useState(
    draft?.grindTime != null ? String(draft.grindTime) : "",
  );
  const [rating, setRating] = useState<number | null>(draft?.rating ?? null);
  const [notes, setNotes] = useState(draft?.notes ?? "");

  useEffect(() => {
    if (submittedRef.current && !pending && state.error === null) {
      onDraftChange(null);
      onClose();
    }
  }, [pending, state, onClose, onDraftChange]);

  useEffect(() => {
    if (step !== "extract" || startedAt === null) return;
    const id = setInterval(() => {
      setElapsedS((Date.now() - startedAt) / 1000);
    }, 100);
    return () => clearInterval(id);
  }, [step, startedAt]);

  const bean = beans.find((b) => b.id === beanId);
  const lastShot = shots.find((s) => s.bean_id === beanId);
  const doseNum = Number(actualDose);
  const yieldNum = Number(actualYield);
  const ratio =
    doseNum > 0 && yieldNum > 0 ? (yieldNum / doseNum).toFixed(2) : null;

  function buildDraft(phase: LiveDraft["phase"]): LiveDraft {
    return {
      phase,
      beanId: beanId as number,
      recipeId: recipe?.id ?? null,
      recipeName: recipe?.name ?? null,
      targetDose: recipe?.dose ?? null,
      targetYield: recipe?.yield ?? null,
      targetTimeS: recipe?.time ?? null,
      startedAt: startedAt as number,
      actualDose: doseNum,
      actualYield: yieldNum > 0 ? yieldNum : null,
      durationS: Number(durationInput) || elapsedS || null,
      grindSize: Number(grindSize) || null,
      grindTime: Number(grindTime) || null,
      rating,
      notes,
    };
  }

  function startExtraction() {
    const now = Date.now();
    setStartedAt(now);
    setElapsedS(0);
    setStep("extract");
    onDraftChange({
      phase: "running",
      beanId: beanId as number,
      recipeId: recipe?.id ?? null,
      recipeName: recipe?.name ?? null,
      targetDose: recipe?.dose ?? null,
      targetYield: recipe?.yield ?? null,
      targetTimeS: recipe?.time ?? null,
      startedAt: now,
      actualDose: doseNum,
      actualYield: null,
      durationS: null,
      grindSize: null,
      grindTime: null,
      rating: null,
      notes: "",
    });
  }

  function stopExtraction() {
    const finalElapsed = startedAt ? (Date.now() - startedAt) / 1000 : 0;
    setElapsedS(finalElapsed);
    setDurationInput(finalElapsed.toFixed(1));
    setStep("review");
    onDraftChange(buildDraft("review"));
  }

  function saveDraft() {
    onDraftChange(buildDraft("review"));
    onClose();
  }

  if (bean === undefined && beanId !== null) {
    // bean list still loading/mismatched; nothing sane to render
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center md:items-center">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-text/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-ext-title"
        className="relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-background md:max-w-md md:rounded-2xl"
      >
        <div className="flex items-start gap-3 px-5 pt-3.5 pb-2.5">
          <div className="flex flex-1 items-center gap-2">
            {(["setup", "extract", "review"] as const).map((s, i) => (
              <span
                key={s}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  step === s
                    ? "bg-text text-background"
                    : "border border-border text-text-muted"
                }`}
              >
                {i + 1} {s === "setup" ? "Setup" : s === "extract" ? "Extract" : "Review"}
              </span>
            ))}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-soft text-text"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <h2 id="live-ext-title" className="m-0 mb-3 text-xl font-medium">
            {step === "setup"
              ? "Live extraction"
              : step === "extract"
                ? "Extracting"
                : "Review shot"}
          </h2>

          {step === "setup" ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-semibold">Coffee</span>
                <div className="flex flex-wrap gap-2">
                  {beans.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      aria-pressed={beanId === b.id}
                      onClick={() => {
                        setBeanId(b.id);
                        setRecipe(null);
                      }}
                      className={`h-11 rounded-full px-4 text-[13.5px] font-semibold ${
                        beanId === b.id
                          ? "bg-text text-background"
                          : "border border-border bg-surface"
                      }`}
                    >
                      {beanLabel(b, beans)}
                    </button>
                  ))}
                </div>
              </div>

              {recipe ? (
                <div className="flex flex-col gap-1.5 rounded-[10px] bg-surface px-3.5 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-semibold text-text-muted">
                      Recipe targets &middot; {recipe.name}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      On this device
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[13.5px]">
                    <div>
                      <div className="text-[11px] text-text-muted">
                        Target dose
                      </div>
                      {recipe.dose.toFixed(1)} g
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted">
                        Target yield
                      </div>
                      {recipe.yield.toFixed(1)} g
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted">
                        Target time
                      </div>
                      {recipe.time.toFixed(0)} s
                    </div>
                  </div>
                </div>
              ) : null}

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold">
                  Actual dose <span className="font-normal text-text-muted">&middot; what&apos;s in the basket</span>
                </span>
                <div className="relative">
                  <input
                    value={actualDose}
                    onChange={(e) => setActualDose(e.target.value)}
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    className="h-[52px] w-full rounded-[10px] border border-border bg-surface px-3.5 pr-9 font-mono text-base"
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[13px] text-text-muted">
                    g
                  </span>
                </div>
              </label>
              {recipe && actualDose !== String(recipe.dose) ? (
                <button
                  type="button"
                  onClick={() => setActualDose(String(recipe.dose))}
                  className="self-start rounded-full border border-border bg-surface px-3 py-1.5 text-[12.5px] font-semibold"
                >
                  Use {recipe.dose.toFixed(1)} g &middot; recipe {recipe.name}
                </button>
              ) : null}

              <div className="text-[12.5px] text-text-muted">
                Choose a coffee and confirm the dose to start.
              </div>

              <button
                type="button"
                disabled={!beanId || !(doseNum > 0)}
                onClick={startExtraction}
                className="h-[52px] rounded-full bg-text text-[14.5px] font-semibold text-background disabled:opacity-40"
              >
                Start extraction
              </button>
            </div>
          ) : null}

          {step === "extract" ? (
            <div className="flex flex-col items-center gap-5">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <div
                  className="animate-timer-glow absolute inset-0 rounded-full bg-primary/40"
                  aria-hidden="true"
                />
                <svg width={160} height={160} className="relative -rotate-90">
                  <circle
                    cx={80}
                    cy={80}
                    r={70}
                    fill="none"
                    stroke="var(--soft)"
                    strokeWidth={10}
                  />
                  {recipe ? (
                    <circle
                      cx={80}
                      cy={80}
                      r={70}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth={10}
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 70}
                      strokeDashoffset={
                        2 * Math.PI * 70 * (1 - Math.min(elapsedS / recipe.time, 1))
                      }
                      className="transition-[stroke-dashoffset] duration-100 ease-linear"
                    />
                  ) : (
                    <circle
                      cx={80}
                      cy={80}
                      r={70}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth={10}
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 70 * 0.25} ${2 * Math.PI * 70 * 0.75}`}
                      className="animate-timer-spin origin-center"
                    />
                  )}
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[12px] font-semibold text-text/70">
                    Timer running
                  </span>
                  <span className="font-mono text-4xl font-light tabular-nums">
                    {elapsedS.toFixed(1)}
                  </span>
                  <span className="text-[12px] text-text/70">seconds</span>
                </div>
              </div>

              <div className="grid w-full grid-cols-3 gap-2 rounded-[10px] bg-surface px-3.5 py-3 text-center font-mono text-[13.5px]">
                <div>
                  <div className="text-[11px] text-text-muted">
                    Actual dose
                  </div>
                  {doseNum.toFixed(1)} g
                </div>
                <div>
                  <div className="text-[11px] text-text-muted">
                    Target time
                  </div>
                  {recipe ? `${recipe.time.toFixed(0)} s` : "—"}
                </div>
                <div>
                  <div className="text-[11px] text-text-muted">
                    Target yield
                  </div>
                  {recipe ? `${recipe.yield.toFixed(1)} g` : "—"}
                </div>
              </div>

              <p className="m-0 text-center text-[12.5px] text-text-muted">
                The timer keeps running until you tap Stop &mdash; even past
                the target.
              </p>

              <button
                type="button"
                onClick={stopExtraction}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-text text-[14.5px] font-semibold text-background"
              >
                <span className="h-2 w-2 rounded-full bg-destructive" />
                Stop extraction
              </button>
            </div>
          ) : null}

          {step === "review" ? (
            <form
              action={(formData) => {
                submittedRef.current = true;
                formAction(formData);
              }}
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="bean_id" value={beanId ?? ""} />
              <input type="hidden" name="rating" value={rating ?? ""} />
              <input type="hidden" name="dose" value={actualDose} />

              <p className="m-0 -mt-2 text-[13px] text-text-muted">
                Measured {(Number(durationInput) || elapsedS).toFixed(1)} s.
                Nothing is saved until you tap Complete to save.
              </p>

              {bean ? (
                <div className="rounded-[10px] bg-surface px-3.5 py-3">
                  <div className="text-[12.5px] text-text-muted">Coffee</div>
                  <div className="text-[14.5px] font-semibold">
                    {beanLabel(bean, beans)}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold">Dose</span>
                  <div className="flex h-[52px] items-center rounded-[10px] border border-border bg-soft px-3.5 font-mono text-base text-text-muted">
                    {doseNum.toFixed(1)} g
                  </div>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold">
                    Actual yield
                  </span>
                  <div className="relative">
                    <input
                      name="shot_yield"
                      value={actualYield}
                      onChange={(e) => setActualYield(e.target.value)}
                      type="number"
                      step="0.1"
                      required
                      placeholder="0.0"
                      className="h-[52px] w-full rounded-[10px] border border-border bg-surface px-3.5 pr-9 font-mono text-base"
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[13px] text-text-muted">
                      g
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between rounded-[10px] bg-surface px-3.5 py-3">
                <span className="text-[13.5px] font-semibold">
                  Brew ratio
                </span>
                {ratio ? (
                  <span className="font-mono text-lg font-medium">
                    1:{ratio}
                  </span>
                ) : (
                  <span className="text-[12.5px] text-text-muted">
                    Enter actual yield
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold">
                    Extraction time
                  </span>
                  <div className="relative">
                    <input
                      name="duration"
                      value={durationInput}
                      onChange={(e) => setDurationInput(e.target.value)}
                      type="number"
                      step="0.1"
                      required
                      className="h-[52px] w-full rounded-[10px] border border-border bg-surface px-3.5 pr-9 font-mono text-base"
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[13px] text-text-muted">
                      s
                    </span>
                  </div>
                  <span className="text-[11.5px] text-text-muted">
                    Measured by the timer. Correct it if needed.
                  </span>
                </label>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold">
                    Grind size
                  </span>
                  <input
                    name="grind_size"
                    value={grindSize}
                    onChange={(e) => setGrindSize(e.target.value)}
                    type="number"
                    step="0.1"
                    required
                    placeholder="—"
                    className="h-[52px] w-full rounded-[10px] border border-border bg-surface px-3.5 font-mono text-base"
                  />
                  <span className="text-[11.5px] text-text-muted">
                    Your grinder setting. No unit.
                  </span>
                  {lastShot && !grindSize ? (
                    <button
                      type="button"
                      onClick={() => setGrindSize(String(lastShot.grind_size))}
                      className="self-start rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold"
                    >
                      Use {lastShot.grind_size} &middot; last shot,{" "}
                      {formatWhen(lastShot.created_at)}
                    </button>
                  ) : null}
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold">Grind time</span>
                <div className="relative">
                  <input
                    name="grind_time"
                    value={grindTime}
                    onChange={(e) => setGrindTime(e.target.value)}
                    type="number"
                    step="0.1"
                    required
                    className="h-[52px] w-full rounded-[10px] border border-border bg-surface px-3.5 pr-9 font-mono text-base"
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[13px] text-text-muted">
                    s
                  </span>
                </div>
                <span className="text-[11.5px] text-text-muted">
                  How long the grinder ran, not the extraction.
                </span>
                {lastShot && !grindTime ? (
                  <button
                    type="button"
                    onClick={() => setGrindTime(String(lastShot.grind_time))}
                    className="self-start rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold"
                  >
                    Use {lastShot.grind_time} s &middot; last shot,{" "}
                    {formatWhen(lastShot.created_at)}
                  </button>
                ) : null}
              </label>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold">Rating</span>
                  <span className="text-[12.5px] text-text-muted">
                    {rating ? `${rating}/5` : "Not rated yet"}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {RATINGS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={rating === n}
                      onClick={() => setRating(n)}
                      className={`h-[46px] rounded-xl font-mono text-[15px] font-medium ${
                        rating === n
                          ? "bg-text text-background"
                          : "border border-border bg-surface"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>1 &middot; undrinkable</span>
                  <span>5 &middot; excellent</span>
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold">
                  Notes{" "}
                  <span className="font-normal text-text-muted">
                    &middot; optional
                  </span>
                </span>
                <textarea
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Taste, texture, what to change next time"
                  className="rounded-[10px] border border-border bg-surface px-3.5 py-3 text-[14.5px]"
                />
              </label>

              {state.error ? (
                <div className="text-[12.5px] font-semibold text-destructive">
                  {state.error}
                </div>
              ) : null}

              <p className="m-0 text-[12px] leading-relaxed text-text-muted">
                To save, add actual yield, grind size, grind time and rating.
                A draft is kept in this browser only and isn&apos;t a saved
                shot.
              </p>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="h-[52px] flex-1 rounded-full border border-border bg-surface text-[14.5px] font-semibold"
                >
                  Save draft
                </button>
                <button
                  type="submit"
                  disabled={pending || !rating}
                  className="h-[52px] flex-[1.3] rounded-full bg-text text-[14.5px] font-semibold text-background disabled:opacity-40"
                >
                  {pending ? "Saving..." : "Complete to save"}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
