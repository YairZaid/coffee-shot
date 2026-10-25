"use client";

import { useActionState, useEffect, useRef } from "react";
import { addBeanAction, type AddBeanState } from "@/app/actions";

const initialState: AddBeanState = { error: null };

export function AddBeanModal({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(
    addBeanAction,
    initialState,
  );
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && !pending && state.error === null) {
      onClose();
    }
  }, [pending, state, onClose]);

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
        aria-labelledby="add-bean-title"
        className="relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-background md:max-w-md md:rounded-2xl"
      >
        <div className="flex items-start gap-3 px-5 pt-3.5 pb-2.5">
          <div className="flex-1">
            <h2 id="add-bean-title" className="m-0 text-xl font-medium">
              Add coffee
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
          className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-5 pt-1.5 pb-5"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-[13px] font-semibold">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Bean or blend name"
              required
              aria-invalid={state.error ? true : undefined}
              aria-describedby={state.error ? "name-error" : undefined}
              className={`h-[52px] rounded-[10px] border bg-surface px-3.5 text-base font-semibold ${
                state.error ? "border-destructive" : "border-border"
              }`}
            />
            {state.error ? (
              <div
                id="name-error"
                className="text-[12.5px] font-semibold text-destructive"
              >
                {state.error}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="roaster" className="text-[13px] font-semibold">
              Roaster
            </label>
            <input
              id="roaster"
              name="roaster"
              type="text"
              required
              className="h-[52px] rounded-[10px] border border-border bg-surface px-3.5 text-base"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="origin" className="text-[13px] font-semibold">
              Origin
            </label>
            <input
              id="origin"
              name="origin"
              type="text"
              required
              className="h-[52px] rounded-[10px] border border-border bg-surface px-3.5 text-base"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="roast_date" className="text-[13px] font-semibold">
              Roast date
            </label>
            <input
              id="roast_date"
              name="roast_date"
              type="date"
              required
              aria-describedby="roast-date-hint"
              className="h-[52px] rounded-[10px] border border-border bg-surface px-3.5 font-mono text-[15px]"
            />
            <div id="roast-date-hint" className="text-[12.5px] text-text-muted">
              The date printed on the bag, not the purchase date.
            </div>
          </div>
          <div className="mt-1 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-[52px] flex-1 rounded-full border border-border bg-surface text-[14.5px] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-[52px] flex-[1.4] rounded-full bg-text text-[14.5px] font-semibold text-background disabled:opacity-60"
            >
              {pending ? "Saving..." : "Add coffee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
