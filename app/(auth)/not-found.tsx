import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative mx-auto w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
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
      <div className="mt-8 flex justify-center">
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
