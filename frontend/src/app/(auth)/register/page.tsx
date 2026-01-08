import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import { Zap, ArrowLeft, Check } from "lucide-react";

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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </Link>
        
        <div className="bg-secondary/50 border border-border rounded-2xl p-8 shadow-xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Medusa<span className="text-primary">Store</span></span>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
            <p className="text-muted-foreground mt-2">
              Join us for a better shopping experience
            </p>
          </div>

          <RegisterForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        
        {/* Benefits */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          {[
            "Real-time order tracking",
            "Secure checkout",
            "Order history",
            "Exclusive offers",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-muted-foreground">
              <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="h-3 w-3 text-success" />
              </div>
              {benefit}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
