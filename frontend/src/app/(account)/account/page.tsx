import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomer } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { Package, User, Settings } from "lucide-react";

export const metadata = {
  title: "My Account | Medusa Store",
  description: "Manage your account",
};

export default async function AccountPage() {
  const customer = await getCustomer();

  if (!customer) {
    redirect("/login");
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {customer.first_name || customer.email}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/account/orders"
            className="group p-6 rounded-lg border border-border bg-background hover:border-accent hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-accent transition-colors">
                  Orders
                </h3>
                <p className="text-sm text-muted-foreground">
                  View order history
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/account/profile"
            className="group p-6 rounded-lg border border-border bg-background hover:border-accent hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-accent transition-colors">
                  Profile
                </h3>
                <p className="text-sm text-muted-foreground">
                  Edit your details
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/account/addresses"
            className="group p-6 rounded-lg border border-border bg-background hover:border-accent hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Settings className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-accent transition-colors">
                  Addresses
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage addresses
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Account Info */}
        <div className="mt-8 p-6 rounded-lg border border-border bg-background">
          <h2 className="font-semibold mb-4">Account Information</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd>
                {customer.first_name} {customer.last_name}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{customer.email}</dd>
            </div>
            {customer.phone && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{customer.phone}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
