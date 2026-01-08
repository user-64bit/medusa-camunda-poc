"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { updateProfileAction } from "@/app/actions/account";
import { HttpTypes } from "@medusajs/types";

interface ProfileFormProps {
  customer: HttpTypes.StoreCustomer;
}

export function ProfileForm({ customer }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfileAction(formData);

    if (result.success) {
      setSuccess(true);
      router.refresh();
    } else {
      setError(result.error || "Failed to update profile");
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-800 bg-green-100 rounded-md">
          Profile updated successfully!
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="first_name" className="text-sm font-medium">
            First Name
          </label>
          <Input
            id="first_name"
            name="first_name"
            type="text"
            defaultValue={customer.first_name || ""}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="last_name" className="text-sm font-medium">
            Last Name
          </label>
          <Input
            id="last_name"
            name="last_name"
            type="text"
            defaultValue={customer.last_name || ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={customer.email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={customer.phone || ""}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
