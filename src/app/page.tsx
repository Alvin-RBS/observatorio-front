// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // Assim que o usuário entra na raiz, ele é enviado para o login
  redirect("/login");
  
  // O código abaixo nunca será renderizado, mas o TypeScript exige um retorno
  return null;
}