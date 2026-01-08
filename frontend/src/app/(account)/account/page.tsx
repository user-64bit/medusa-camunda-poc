import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomer } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { Package, User, MapPin, Mail, Phone, ChevronRight } from "lucide-react";

export const metadata = {
  title: "My Account | Medusa Store",
  description: "Manage your account",
};

export default async function AccountPage() {
  const customer = await getCustomer();

  if (!customer) {
    redirect("/login");
  }

  const menuItems = [
    {
      href: "/account/orders",
      icon: Package,
      title: "Orders",
      description: "View order history and track shipments",
      color: "primary",
    },
    {
      href: "/account/profile",
      icon: User,
      title: "Profile",
      description: "Edit your personal information",
      color: "accent",
    },
    {
      href: "/account/addresses",
      icon: MapPin,
      title: "Addresses",
      description: "Manage shipping addresses",
      color: "success",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-secondary/30 border-b border-border">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {customer.first_name?.[0] || customer.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome back, {customer.first_name || "there"}!
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your account and view your orders
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group p-6 rounded-2xl border border-border bg-secondary/30 hover:border-primary/50 transition-all duration-300 card-hover"
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
                    item.color === "primary" ? "bg-primary/10 text-primary" :
                    item.color === "accent" ? "bg-accent/10 text-accent" :
                    "bg-success/10 text-success"
                  }`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Account Info */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="p-6 rounded-2xl border border-border bg-secondary/30">
              <dl className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wider">Name</dt>
                    <dd className="font-medium mt-0.5">
                      {customer.first_name || customer.last_name 
                        ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
                        : "Not set"}
                    </dd>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wider">Email</dt>
                    <dd className="font-medium mt-0.5">{customer.email}</dd>
                  </div>
                </div>
                
                {customer.phone && (
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground uppercase tracking-wider">Phone</dt>
                      <dd className="font-medium mt-0.5">{customer.phone}</dd>
                    </div>
                  </div>
                )}
              </dl>

              <Link
                href="/account/profile"
                className="mt-6 block text-center text-sm text-primary font-medium hover:underline"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
