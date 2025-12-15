import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <h1 className="text-foreground text-8xl font-bold tracking-tight">
            404
          </h1>
          <h2 className="text-foreground mt-4 text-2xl font-semibold tracking-tight">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has
            been moved.
          </p>
        </CardHeader>
        <div className="px-6 pb-6">
          <Button asChild size="lg" className="w-full">
            <Link href="/">Go Home</Link>
          </Button>
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
      </Card>
    </div>
  );
}
