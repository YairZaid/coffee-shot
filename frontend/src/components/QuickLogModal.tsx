"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addShotAction, type AddShotState } from "@/app/actions";
import { beanLabel } from "@/lib/beans";
import type { Bean } from "@/lib/api";

const initialState: AddShotState = { error: null };

const NUMERIC_FIELDS = [
  { name: "dose", label: "Dose", unit: "g" },
  { name: "grind_size", label: "Grind size", unit: "" },
  { name: "grind_time", label: "Grind time", unit: "s" },
  { name: "shot_yield", label: "Yield", unit: "g" },
  { name: "duration", label: "Duration", unit: "s" },
] as const;

const RATINGS = Array.from({ length: 5 }, (_, i) => i + 1);

export function QuickLogModal({
  beans,
  defaultBeanId,
  onClose,
}: {
  beans: Bean[];
  defaultBeanId?: number;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    addShotAction,
    initialState,
  );
  const submittedRef = useRef(false);
  const [beanId, setBeanId] = useState<number | null>(
    defaultBeanId ?? beans[0]?.id ?? null,
  );
  const [rating, setRating] = useState<number | null>(null);
  const [dose, setDose] = useState("");
  const [yieldVal, setYieldVal] = useState("");

  useEffect(() => {
    if (submittedRef.current && !pending && state.error === null) {
      onClose();
    }
  }, [pending, state, onClose]);

  const doseNum = Number(dose);
  const yieldNum = Number(yieldVal);
  const ratio =
    doseNum > 0 && yieldNum > 0 ? (yieldNum / doseNum).toFixed(1) : null;

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
        aria-labelledby="quicklog-title"
        className="relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-background md:max-w-md md:rounded-2xl"
      >
        <div className="flex items-start gap-3 px-5 pt-3.5 pb-2.5">
          <div className="flex-1">
            <h2 id="quicklog-title" className="m-0 text-xl font-medium">
              Log a shot
            </h2>
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

        <form
          action={(formData) => {
            submittedRef.current = true;
            formAction(formData);
          }}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-1.5 pb-5"
        >
          <input type="hidden" name="bean_id" value={beanId ?? ""} />
          <input type="hidden" name="rating" value={rating ?? ""} />

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold">Coffee</span>
            <div className="flex flex-wrap gap-2">
              {beans.map((bean) => (
                <button
                  key={bean.id}
                  type="button"
                  aria-pressed={beanId === bean.id}
                  onClick={() => setBeanId(bean.id)}
                  className={`h-11 rounded-full px-4 text-[13.5px] font-semibold ${
                    beanId === bean.id
                      ? "bg-text text-background"
                      : "border border-border bg-surface"
                  }`}
                >
                  {beanLabel(bean, beans)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {NUMERIC_FIELDS.map((field) => (
              <label key={field.name} className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold">
                  {field.label}
                </span>
                <div className="relative">
                  <input
                    name={field.name}
                    type="number"
                    step="0.1"
                    required
                    onChange={
                      field.name === "dose"
                        ? (e) => setDose(e.target.value)
                        : field.name === "shot_yield"
                          ? (e) => setYieldVal(e.target.value)
                          : undefined
                    }
                    className="h-[52px] w-full rounded-[10px] border border-border bg-surface px-3.5 pr-9 font-mono text-base"
                  />
                  {field.unit ? (
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[13px] text-text-muted">
                      {field.unit}
                    </span>
                  ) : null}
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-[10px] bg-surface px-3.5 py-3">
            <span className="text-[13.5px] font-semibold">Brew ratio</span>
            {ratio ? (
              <span className="font-mono text-lg font-medium">1:{ratio}</span>
            ) : (
              <span className="text-[12.5px] text-text-muted">
                Enter dose and yield
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold">Rating</span>
              <span className="text-[12.5px] text-text-muted">
                {rating ? `${rating}/5` : "Not rated"}
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
              Notes <span className="font-normal text-text-muted">&middot; optional</span>
            </span>
            <textarea
              name="notes"
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

          <button
            type="submit"
            disabled={pending}
            className="h-[52px] rounded-full bg-text text-[14.5px] font-semibold text-background disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save shot"}
          </button>
        </form>
      </div>
    </div>
  );
}
