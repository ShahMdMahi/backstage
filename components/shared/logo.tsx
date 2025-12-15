import Image from "next/image";

export const Logo = () => (
  <div className="flex items-center gap-2 text-xl font-bold tracking-tight select-none">
    <Image
      src="/icon_logo.png"
      alt="RoyalMotionIT Logo"
      width={32}
      height={32}
      priority
      className="rounded-md transition-transform duration-200 hover:scale-105"
    />
    <span
      className="text-primary font-display"
      style={{ letterSpacing: "0.04em" }}
    >
      Backstage
    </span>
  </div>
);
