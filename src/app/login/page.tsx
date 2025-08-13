"use client";
import { useTheme } from "@mui/material";
import TwoPanelLayout from "@/components/common/layouts/TwoPanelLayout";
import { LoginForm } from "@/features/authenticate/login/components";
import paper from "@/assets/images/paper.png";           
import stream from "@/assets/images/stream-illustration.svg";       

export default function LoginPage() {
  const theme = useTheme();

  return (
    <TwoPanelLayout
      leftContent={<LoginForm />}
      bgColor={theme.palette.primary.main}       
      backgroundImageSrc={paper}                 
      backgroundOpacity={0.35}
      backgroundBlendMode="multiply"            
      imageSrc={stream}                         
      imageMode="auto"
      imageWidth={570.63}
      imageHeight={552.21}
      imageAlt="Logo"
    />
  );
}
