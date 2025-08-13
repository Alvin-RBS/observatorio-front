"use client";

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";

import { DefaultButton } from "@/components/common/buttons";
import { useLogin } from "../hooks/useLogin";

import { LoginLogo } from "./LoginLogo";
import { LoginAlert } from "./LoginAlert";
import { LoginFields, FormErrors } from "./LoginFields";

export default function LoginForm() {
  const { doLogin, loading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [hasShownAlert, setHasShownAlert] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (error && !hasShownAlert) {
      setShowAlert(true);
      setHasShownAlert(true);
    } else if (!error) {
      setHasShownAlert(false);
      setShowAlert(false);
    }
  }, [error, hasShownAlert]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const errs: FormErrors = {};
    if (!email.trim()) errs.email = "Email obrigatório";
    if (!password.trim()) errs.password = "Senha obrigatória";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const result = await doLogin({ email, password, remember_me: remember });
    if (result) {
      localStorage.setItem("userData", JSON.stringify(result));
      router.push("/");
    }
  }

  return (
    <>
      <LoginAlert open={!!error && showAlert} onClose={() => setShowAlert(false)} />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 400,
          width: 350,
          mx: "auto",
          px: 2,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          mt: 10,
          position: "relative",
        }}
      >
        <Box display="flex" justifyContent="center">
          <LoginLogo priority />
        </Box>

        <LoginFields
          email={email}
          password={password}
          remember={remember}
          errors={formErrors}
          onEmailChange={(v) => setEmail(v)}
          onPasswordChange={(v) => setPassword(v)}
          onRememberChange={(v) =>
            setRemember(v)
          }
        />

        <DefaultButton type="submit" loading={loading}>
          Entrar
        </DefaultButton>
      </Box>
    </>
  );
}
