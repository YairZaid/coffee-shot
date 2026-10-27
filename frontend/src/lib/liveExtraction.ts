export type LiveDraft = {
  phase: "running" | "review";
  beanId: number;
  recipeId: string | null;
  recipeName: string | null;
  targetDose: number | null;
  targetYield: number | null;
  targetTimeS: number | null;
  startedAt: number;
  actualDose: number;
  actualYield: number | null;
  durationS: number | null;
  grindSize: number | null;
  grindTime: number | null;
  rating: number | null;
  notes: string;
};

const LIVE_DRAFT_KEY = "csi:liveExtraction";

export function loadLiveDraft(): LiveDraft | null {
  try {
    const raw = localStorage.getItem(LIVE_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as LiveDraft) : null;
  } catch {
    return null;
  }
}

export function saveLiveDraft(draft: LiveDraft) {
  try {
    localStorage.setItem(LIVE_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore
  }
}

export function clearLiveDraft() {
  try {
    localStorage.removeItem(LIVE_DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function requiredProgress(draft: LiveDraft): {
  done: number;
  total: number;
} {
  const fields = [
    draft.beanId != null,
    draft.actualDose > 0,
    draft.durationS != null && draft.durationS > 0,
    draft.actualYield != null && draft.actualYield > 0,
    draft.grindSize != null && draft.grindSize > 0,
    draft.grindTime != null && draft.grindTime > 0,
    draft.rating != null,
  ];
  return { done: fields.filter(Boolean).length, total: fields.length };
}
