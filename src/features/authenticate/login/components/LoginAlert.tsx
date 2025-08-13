"use client";

import { Box, Link, SxProps, Theme, useMediaQuery, useTheme } from "@mui/material";
import { ErrorAlert } from "@/components/common/alert/errorAlert";

const alertLinkSx: SxProps<Theme> = {
  color: "var(--_components-alert-error-color, #5F2120)",
  textDecoration: "underline",
  fontSize: "14px",
  fontWeight: 700,
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function LoginAlert({ open, onClose }: Props) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md")); 

  if (!open) return null;

  return (
    <Box
      sx={{
        position: { xs: "fixed", md: "absolute" },
        top: {
          xs: "calc(env(safe-area-inset-top) + 8px)", 
          md: 20,
        },
        left: { xs: 0, md: "26%" },
        right: { xs: 0, md: "auto" },
        transform: { xs: "none", md: "translateX(-50%)" },
        width: "100%",
        px: { xs: 2, md: 2 },
        zIndex: (t) => t.zIndex.snackbar + 1, 
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none", 
      }}
      role="region"
      aria-live="assertive"
      aria-atomic="true"
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: 560, md: 400 },
          pointerEvents: "auto", 
        }}
      >
        <ErrorAlert
          title="Ops! Algo não deu certo."
          message={
            <>
              Parece que e-mail ou senha estão incorretos.
              <br />
              Lembre-se de que maiúsculas e minúsculas fazem diferença.
            </>
          }
          helpText={
            <>
              Precisa de ajuda? Tente{" "}
              <Link href="/recuperar-senha" underline="none" sx={alertLinkSx}>
                Esqueceu a senha?
              </Link>
            </>
          }
          onClose={onClose}
        />
      </Box>
    </Box>
  );
}
