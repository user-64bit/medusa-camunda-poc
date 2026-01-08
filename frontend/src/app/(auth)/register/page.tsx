import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";

export const metadata = {
  title: "Create Account | Medusa Store",
  description: "Create a new account",
};

export default async function RegisterPage() {
  const customer = await getCustomer();

  if (customer) {
    redirect("/account");
  }

  return (
    <div className="container max-w-md py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
        <p className="text-muted-foreground mt-1">
          Sign up to start shopping
        </p>
      </div>

      <div className="bg-background border border-border rounded-lg p-6">
        <RegisterForm />
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
