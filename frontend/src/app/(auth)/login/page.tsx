import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export const metadata = {
  title: "Login | Medusa Store",
  description: "Sign in to your account",
};

export default async function LoginPage() {
  const customer = await getCustomer();

  if (customer) {
    redirect("/account");
  }

  return (
    <div className="container max-w-md py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground mt-1">
          Sign in to your account to continue
        </p>
      </div>

      <div className="bg-background border border-border rounded-lg p-6">
        <LoginForm />
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
