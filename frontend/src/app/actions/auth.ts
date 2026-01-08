"use server";

import { login, register, logout } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const result = await login(email, password);
  
  if (result.success) {
    revalidatePath("/", "layout");
  }
  
  return result;
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;

  if (!email || !password || !first_name || !last_name) {
    return { success: false, error: "All fields are required" };
  }

  const result = await register({ email, password, first_name, last_name });
  
  if (result.success) {
    revalidatePath("/", "layout");
  }
  
  return result;
}

export async function logoutAction() {
  await logout();
  revalidatePath("/", "layout");
  redirect("/");
}
