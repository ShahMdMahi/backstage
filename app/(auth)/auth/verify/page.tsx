import { VerifyForm } from "@/components/auth/verify-form";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Verify() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* Theme Toggle in top right */}
      <div className="absolute top-0 right-0 z-10">
        <ThemeToggle />
      </div>

      {/* Logo in center */}
      <div className="mb-4 flex justify-center">
        <Image
          src="/icon_logo.png"
          alt="Royal Records Logo"
          width={48}
          height={48}
          className="h-12 w-12"
        />
      </div>

      {/* Description */}
      <div className="mb-5 text-center">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          Verify
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Real Music, Real Impact
        </p>
      </div>

      {/* Form */}
      <VerifyForm />

      {/* Link */}
      <div className="text-muted-foreground mt-4 text-center text-xs">
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
