"use client";

import { Stack, Link, FormControlLabel, SxProps, Theme } from "@mui/material";
import { InputGroup } from "@/components/common/inputs";
import { DefaultCheckBox } from "@/components/common/checkboxs";

const forgotPasswordLinkSx: SxProps<Theme> = {
  color: "primary",
  textDecoration: "underline",
  textDecorationColor: "primary",
  fontSize: "16px",
  fontWeight: 500,
  mt: 1,
};

export type FormErrors = { email?: string; password?: string };

type Props = {
  email: string;
  password: string;
  remember: boolean;
  errors: FormErrors;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onRememberChange: (v: boolean) => void;
};

export function LoginFields({
  email,
  password,
  remember,
  errors,
  onEmailChange,
  onPasswordChange,
  onRememberChange,
}: Props) {
  return (
    <Stack spacing={2}>
      <InputGroup
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
      />

      <InputGroup
        id="senha"
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        error={!!errors.password}
        helperText={errors.password}
      />

      <Link href="/recuperar-senha" underline="none" sx={forgotPasswordLinkSx}>
        Esqueceu a senha?
      </Link>

      <FormControlLabel
        control={
          <DefaultCheckBox
            id="continuar-logado"
            checked={remember}
            onChange={(e) => onRememberChange(e.target.checked)}
          />
        }
        label="Continuar logado"
      />
    </Stack>
  );
}
