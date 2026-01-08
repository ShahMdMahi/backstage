import { VerifyForm } from "@/components/auth/verify-form";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Verify() {
  return (
    <div className="relative mx-auto w-full max-w-sm px-4 sm:px-6">
      {/* Theme Toggle in top right */}
      <div className="absolute top-0 right-0 z-10">
        <ThemeToggle />
      </div>

      {/* Logo in center */}
      <div className="mb-4 flex justify-center sm:mb-6">
        <Image
          src="/icon_logo.png"
          alt="Royal Records Logo"
          width={48}
          height={48}
          className="h-12 w-12 sm:h-14 sm:w-14"
        />
      </div>

      {/* Description */}
      <div className="mb-5 text-center sm:mb-6">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Verify
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Real Music, Real Impact
        </p>
      </div>

      {/* Form */}
      <VerifyForm />

      {/* Link */}
      <div className="text-muted-foreground mt-4 text-center text-xs sm:text-sm">
        <p>
          Already verfied your account?{" "}
          <Link
            href="/auth/login"
            className="text-primary focus-visible:ring-ring font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Sign In
          </Link>
        </p>
      </div>
      <div className="text-muted-foreground mt-4 text-center text-xs">
        <p>
          Verification link expired?{" "}
          <Link
            href="/auth/resend-verification"
            className="text-primary focus-visible:ring-ring font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Resend Verification Email
          </Link>
        </p>
      </div>
    </div>
  );
}
