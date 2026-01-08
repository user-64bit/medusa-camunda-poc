"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Spinner } from "@/components/ui/spinner";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isPending}>
      {isPending ? (
        <Spinner size="sm" className="mr-2" />
      ) : (
        <LogOut className="h-4 w-4 mr-2" />
      )}
      Sign Out
    </Button>
  );
}
