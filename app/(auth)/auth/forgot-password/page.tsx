import { ForgotPasswordForm } from "@/components/auth/forgot-password";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ForgotPassword() {
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
          Forgot Password
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Real Music, Real Impact
        </p>
      </div>

      {/* Form */}
      <ForgotPasswordForm />

      {/* Link */}
      <div className="text-muted-foreground mt-4 text-center text-xs sm:text-sm">
        <p>
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="text-primary focus-visible:ring-ring font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
