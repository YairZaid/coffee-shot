export type Recipe = {
  id: string;
  beanId: number;
  name: string;
  dose: number;
  yield: number;
  time: number;
};

const RECIPES_KEY = "csi:recipes";

export function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecipes(recipes: Recipe[]) {
  try {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
  } catch {
    // ignore
  }
}
