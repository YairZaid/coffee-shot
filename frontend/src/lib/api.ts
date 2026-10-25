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
