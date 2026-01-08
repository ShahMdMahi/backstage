export const dynamic = "force-dynamic";

export default async function Settings() {
  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Manage your application settings
        </p>
      </div>
    </div>
  );
}
