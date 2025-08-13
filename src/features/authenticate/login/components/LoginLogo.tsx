import Image from "next/image";
import logoGov from "@/assets/images/LogoGov.png";

type Props = {
  width?: number;
  height?: number;
  alt?: string;
  priority?: boolean;
};

export function LoginLogo({ width = 200, height = 60, alt = "Logo", priority }: Props) {
  return (
    <Image
      src={logoGov}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      unoptimized
      style={{ height: "auto", width: "auto", maxWidth: "100%" }}
    />
  );
}
