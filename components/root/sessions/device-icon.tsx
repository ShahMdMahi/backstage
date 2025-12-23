import {
  MonitorIcon,
  TabletIcon,
  SmartphoneIcon,
  GamepadIcon,
  CpuIcon,
  TvIcon,
  WatchIcon,
  GlassesIcon,
  HelpCircleIcon,
} from "lucide-react";
import { SESSION_DEVICE_TYPE } from "@/lib/prisma/enums";

interface DeviceIconProps {
  deviceType: SESSION_DEVICE_TYPE;
  className?: string;
}

export function DeviceIcon({ deviceType, className }: DeviceIconProps) {
  switch (deviceType) {
    case SESSION_DEVICE_TYPE.DESKTOP:
      return <MonitorIcon className={className} />;
    case SESSION_DEVICE_TYPE.TABLET:
      return <TabletIcon className={className} />;
    case SESSION_DEVICE_TYPE.MOBILE:
      return <SmartphoneIcon className={className} />;
    case SESSION_DEVICE_TYPE.CONSOLE:
      return <GamepadIcon className={className} />;
    case SESSION_DEVICE_TYPE.EMBEDDED:
      return <CpuIcon className={className} />;
    case SESSION_DEVICE_TYPE.SMARTTV:
      return <TvIcon className={className} />;
    case SESSION_DEVICE_TYPE.WEARABLE:
      return <WatchIcon className={className} />;
    case SESSION_DEVICE_TYPE.XR:
      return <GlassesIcon className={className} />;
    default:
      return <HelpCircleIcon className={className} />;
  }
}
