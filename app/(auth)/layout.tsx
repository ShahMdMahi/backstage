import Image from "next/image";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCurrentSession } from "@/actions/session";

const images = Array.from({ length: 39 }, (_, i) => `/posters/${i + 1}.jpg`);

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const shuffledImages = shuffle(images);

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();
  if (session?.data?.user) redirect("/");

  return (
    <div className="grid h-screen w-screen grid-cols-1 overflow-hidden lg:grid-cols-[60%_40%]">
      {/* Left panel with auth banner */}
      <div className="relative hidden h-full w-full lg:block">
        <div className="absolute inset-0 z-10 bg-black/25"></div>
        <div className="grid h-full w-full grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5">
          {shuffledImages.slice(0, 20).map((src, idx) => (
            <div key={src} className="relative h-full w-full overflow-hidden">
              <Image
                src={src}
                alt={`Poster ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 25vw, (max-width: 768px) 20vw, (max-width: 1024px) 16.67vw, 12vw"
                priority={idx < 8}
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-4 z-20 text-white lg:bottom-8 lg:left-8">
          <div className="mb-2 lg:mb-4">
            <ThemeToggle />
          </div>
          <h2 className="mb-1 text-xl font-bold tracking-tight sm:text-2xl lg:mb-2 lg:text-3xl">
            RoyalMotionIT
          </h2>
          <p className="text-sm opacity-90 sm:text-base lg:text-lg">
            Where music comes to life
          </p>
        </div>
      </div>

      {/* Right panel with auth form - scrollable */}
      <div className="bg-background flex min-h-0 flex-col justify-center p-4 lg:p-6">
        <ScrollArea className="h-full w-full">
          <div className="flex w-full items-center justify-center px-4 py-8 lg:px-6">
            <div className="w-full max-w-[400px] lg:max-w-[450px]">
              <div className="w-full">{children}</div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
