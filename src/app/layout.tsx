import type { Metadata } from "next";
import ThemeRegistry from "@/components/themes/ThemeRegistry";
import { Toaster } from "react-hot-toast"; 
import { FileProvider } from "@/context/FileContext";
import { DashboardProvider } from "@/context/DashboardContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema de Monitoramento",
  description: "Observatório de Violência",
  icons: {
    icon: "/logoSite.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <ThemeRegistry>
          <FileProvider>
            <DashboardProvider>
              <Toaster position="top-right" />
              {children}
            </DashboardProvider>

          </FileProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}