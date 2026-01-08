import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomer } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata = {
  title: "Profile | Medusa Store",
  description: "Edit your profile",
};

export default async function ProfilePage() {
  const customer = await getCustomer();

  if (!customer) {
    redirect("/login");
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground mt-1">
              Update your personal information
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-border bg-background">
          <ProfileForm customer={customer} />
        </div>
      </div>
    </div>
  );
}
