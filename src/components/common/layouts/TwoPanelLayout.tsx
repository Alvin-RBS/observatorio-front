"use client";

import { Box, useMediaQuery, useTheme } from "@mui/material";
import Image, { type StaticImageData } from "next/image";
import React from "react";

type ImageMode = "fill" | "auto" | "fixed";
type ImgSrc = string | StaticImageData;

interface TwoPanelLayoutProps {
  leftContent: React.ReactNode;
  bgColor?: string;

  backgroundImageSrc?: ImgSrc;
  backgroundBlendMode?: React.CSSProperties["mixBlendMode"];
  backgroundOpacity?: number;

  imageSrc?: ImgSrc;
  imageAlt?: string;
  imageMode?: ImageMode;
  imageWidth?: number;
  imageHeight?: number;

  hideRightOnMobile?: boolean;
}

export default function TwoPanelLayout({
  leftContent,
  bgColor = "#0049A9",

  backgroundImageSrc,
  backgroundBlendMode = "multiply",
  backgroundOpacity = 0.35,

  imageSrc,
  imageAlt = "",
  imageMode = "auto",
  imageWidth = 400,
  imageHeight = 400,

  hideRightOnMobile = true,
}: TwoPanelLayoutProps) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md")); 
  const showRight = hideRightOnMobile ? mdUp : true;     

  const isFill = imageMode === "fill";

  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      minHeight={{ xs: "auto", md: "100dvh" }}
      height={{ md: "100dvh" }}
    >
      <Box
        width={{ xs: "100%", md: "50%" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="white"
        px={{ xs: 2, md: 0 }}
        py={{ xs: 4, md: 0 }}
      >
        {leftContent}
      </Box>

      {showRight && (
        <Box
          width={{ xs: "100%", md: "50%" }}
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ backgroundColor: bgColor, overflow: "hidden" }}
        >
          {backgroundImageSrc && (
            <Image
              src={backgroundImageSrc}
              alt=""
              fill
              priority={mdUp}
              sizes="(max-width: 900px) 0px, 50vw"  
              style={{
                objectFit: "cover",
                opacity: backgroundOpacity,
                mixBlendMode: backgroundBlendMode,
              }}
            />
          )}

          {imageSrc && (
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: { xs: 2, md: 4 },
              }}
            >
              {isFill ? (
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  priority={mdUp}
                  sizes="(max-width: 900px) 0px, 50vw"
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={imageWidth}
                  height={imageHeight}
                  priority={mdUp}
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
