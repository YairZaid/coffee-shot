const API_ORIGIN = process.env.COFFEE_API_ORIGIN ?? "http://localhost:8000";

export type Bean = {
  id: number;
  name: string;
  roaster: string;
  origin: string;
  roast_date: string;
  created_at: string;
};

export type BeanCreateInput = {
  name: string;
  roaster: string;
  origin: string;
  roast_date: string;
};

export async function getBeans(): Promise<Bean[]> {
  const res = await fetch(`${API_ORIGIN}/beans`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load beans (${res.status})`);
  }
  return res.json();
}

export async function createBean(input: BeanCreateInput): Promise<Bean> {
  const res = await fetch(`${API_ORIGIN}/beans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create bean (${res.status}): ${body}`);
  }
  return res.json();
}

export type Shot = {
  id: number;
  bean_id: number;
  dose: number;
  grind_size: number;
  grind_time: number;
  shot_yield: number;
  duration: number;
  rating: number;
  ratio: number;
  notes: string | null;
  created_at: string;
};

export async function getShots(): Promise<Shot[]> {
  const res = await fetch(`${API_ORIGIN}/shots`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load shots (${res.status})`);
  }
  return res.json();
}

export type ShotCreateInput = {
  bean_id: number;
  dose: number;
  grind_size: number;
  grind_time: number;
  shot_yield: number;
  duration: number;
  rating: number;
  notes: string | null;
};

export type BeanStats = {
  bean_id: number;
  shot_count: number;
  avg_rating: number | null;
  avg_ratio: number | null;
};

export async function getBeanStats(beanId: number): Promise<BeanStats> {
  const res = await fetch(`${API_ORIGIN}/beans/${beanId}/stats`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load bean stats (${res.status})`);
  }
  return res.json();
}

export async function createShot(input: ShotCreateInput): Promise<Shot> {
  const res = await fetch(`${API_ORIGIN}/shots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create shot (${res.status}): ${body}`);
  }
  return res.json();
}
