"use client";

import { useSearchParams } from "next/navigation";

export function AuthError() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") ?? "Something went wrong. Please try again.";

  return (
    <p className="text-gray-500 text-sm">{decodeURIComponent(message)}</p>
  );
}
