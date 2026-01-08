export const dynamic = "force-dynamic";

export default async function Settings() {
  return (
    <div className="w-full p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          System Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Manage your system configuration
        </p>
      </div>
    </div>
  );
}
