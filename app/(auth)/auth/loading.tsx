import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-4">
      <div className="flex w-full max-w-md flex-col gap-2">
        <Skeleton className="h-8 w-3/4 bg-gray-200" />
        <Skeleton className="h-4 w-1/2 bg-gray-200" />
      </div>

      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-12 w-full bg-gray-200" />
        <Skeleton className="h-12 w-full bg-gray-200" />
        <Skeleton className="h-12 w-full bg-gray-200" />
      </div>

      <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:justify-between">
        <Skeleton className="h-4 w-1/4 bg-gray-200" />
        <Skeleton className="h-4 w-1/4 bg-gray-200" />
      </div>

      <Skeleton className="h-10 w-full max-w-md bg-gray-200" />
    </div>
  );
}
