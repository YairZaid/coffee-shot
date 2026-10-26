"use server";

import { revalidatePath } from "next/cache";
import { createBean, createShot } from "@/lib/api";

export type AddBeanState = {
  error: string | null;
};

export async function addBeanAction(
  _prevState: AddBeanState,
  formData: FormData,
): Promise<AddBeanState> {
  const name = String(formData.get("name") ?? "").trim();
  const roaster = String(formData.get("roaster") ?? "").trim();
  const origin = String(formData.get("origin") ?? "").trim();
  const roastDate = String(formData.get("roast_date") ?? "").trim();

  if (!name) {
    return { error: "Name is required to add a coffee." };
  }

  try {
    await createBean({ name, roaster, origin, roast_date: roastDate });
  } catch {
    return {
      error: "Couldn't save this coffee. Check your connection and try again.",
    };
  }

  revalidatePath("/");
  return { error: null };
}

export type AddShotState = {
  error: string | null;
};

export async function addShotAction(
  _prevState: AddShotState,
  formData: FormData,
): Promise<AddShotState> {
  const beanId = Number(formData.get("bean_id"));
  const rating = Number(formData.get("rating"));
  const dose = Number(formData.get("dose"));
  const grindSize = Number(formData.get("grind_size"));
  const grindTime = Number(formData.get("grind_time"));
  const shotYield = Number(formData.get("shot_yield"));
  const duration = Number(formData.get("duration"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!beanId) {
    return { error: "Choose a coffee to log this shot against." };
  }
  if (!rating) {
    return { error: "Rate the shot to save it." };
  }
  if ([dose, grindSize, grindTime, shotYield, duration].some((n) => !Number.isFinite(n) || n <= 0)) {
    return { error: "Fill in dose, grind size, grind time, yield, and duration." };
  }

  try {
    await createShot({
      bean_id: beanId,
      dose,
      grind_size: grindSize,
      grind_time: grindTime,
      shot_yield: shotYield,
      duration,
      rating,
      notes: notes || null,
    });
  } catch {
    return {
      error: "Couldn't save this shot. Check your connection and try again.",
    };
  }

  revalidatePath("/");
  return { error: null };
}
