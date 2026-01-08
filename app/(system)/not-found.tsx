import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <h1 className="text-foreground text-6xl font-bold tracking-tight sm:text-7xl md:text-8xl">
            404
          </h1>
          <h2 className="text-foreground mt-4 text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has
            been moved.
          </p>
        </CardHeader>
        <div className="px-4 pb-6 sm:px-6">
          <Button asChild size="lg" className="w-full">
            <Link href="/">Go Home</Link>
          </Button>
          <div className="text-muted-foreground mt-6 text-center text-xs sm:text-sm">
            <p>
              Need help?{" "}
              <Link
                href="/faq"
                className="text-primary font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                FAQ
              </Link>{" "}
              or{" "}
              <Link
                href="/contact"
                className="text-primary font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Contact
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
