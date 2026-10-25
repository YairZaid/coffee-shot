"use server";

import { revalidatePath } from "next/cache";
import { createBean } from "@/lib/api";

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
