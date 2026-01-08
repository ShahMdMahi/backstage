import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-8 sm:size-10 md:size-12" />
        <p className="text-sm text-muted-foreground sm:text-base">Loading...</p>
      </div>
    </div>
  );
}
