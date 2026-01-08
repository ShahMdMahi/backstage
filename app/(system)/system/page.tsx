export default async function System() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          System Dashboard
        </h1>
        <p className="mt-4 text-lg text-muted-foreground sm:text-xl md:text-2xl">
          Manage system settings and administration
        </p>
      </div>
    </div>
  );
}
