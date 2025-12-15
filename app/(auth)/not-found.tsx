import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
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
        <h1 className="text-foreground text-8xl font-bold tracking-tight">
          404
        </h1>
        <h2 className="text-foreground mt-4 text-2xl font-semibold tracking-tight">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
      </div>

      {/* Action Button */}
      <div className="mt-8 flex justify-center">
        <Button asChild size="lg">
          <Link href="/">Go Home</Link>
        </Button>
      </div>

      {/* Additional Links */}
      <div className="text-muted-foreground mt-6 text-center text-xs">
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
