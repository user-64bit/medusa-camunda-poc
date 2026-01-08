"use server";

import { medusa } from "@/lib/medusa";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const phone = formData.get("phone") as string;

  try {
    await medusa.store.customer.update(
      {
        first_name: first_name || undefined,
        last_name: last_name || undefined,
        phone: phone || undefined,
      },
      {},
      { Authorization: `Bearer ${token}` }
    );

    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}
