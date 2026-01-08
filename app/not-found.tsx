import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center px-4 sm:max-w-md sm:px-6 md:max-w-lg">
      {/* Theme Toggle in top right */}
      <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div className="mb-8">
        <Logo />
      </div>

      {/* 404 Content */}
      <div className="text-center">
        <h1 className="text-foreground text-6xl font-bold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
          404
        </h1>
        <h2 className="text-foreground mt-4 text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base md:text-lg">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
      </div>

      {/* Action Button */}
      <div className="mt-8">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/">Go Home</Link>
        </Button>
      </div>

      {/* Additional Links */}
      <div className="text-muted-foreground mt-6 text-center text-xs sm:text-sm">
        <p>
          Need help?{" "}
          <Link
            href="/auth/login"
            className="text-primary font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Sign In
          </Link>{" "}
          or{" "}
          <Link
            href="/auth/register"
            className="text-primary font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
