"use client";

// import { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Offline - Record Label Dashboard",
//   description:
//     "You are currently offline. Please check your internet connection.",
// };

import { useEffect } from "react";

export default function OfflinePage() {
  useEffect(() => {
    const handleOnline = () => {
      // Automatically redirect to home when back online
      window.location.href = "/";
    };
    const handleOffline = () => {
      // No action needed for offline
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleTryAgain = () => {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      alert("You are still offline. Please check your internet connection.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="max-w-md">
        <h1 className="mb-4 text-2xl font-bold text-foreground">
          You&apos;re Offline
        </h1>
        <p className="mb-6 text-muted-foreground">
          It looks like you&apos;re not connected to the internet. Please check
          your connection and try again.
        </p>
        <button
          onClick={handleTryAgain}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
