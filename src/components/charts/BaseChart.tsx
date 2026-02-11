"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { Paper, Box, Typography, useTheme } from "@mui/material";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface BaseChartProps {
  type: "line" | "area" | "bar" | "pie" | "donut";
  series: any[];
  colors?: string[];
  height?: number | string;
  categories?: string[]; // Labels do eixo X
  title?: string;
  subtitle?: string;
}

export default function BaseChart({
  type,
  series,
  colors,
  height = 350,
  categories = [],
  title,
  subtitle,
}: BaseChartProps) {
  const theme = useTheme();

  // Se não passar cores, usa as cores do tema ou um array padrão
  const chartColors = colors || [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.success.main,
    "#FF9800", // Laranja extra
  ];

  const options: ApexOptions = {
    chart: {
      background: "transparent",
      toolbar: { show: false }, // Remove menu de zoom padrão
      fontFamily: theme.typography.fontFamily,
    },
    colors: chartColors,
    dataLabels: { enabled: false },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
    },
    xaxis: {
      categories: categories,
      labels: {
        style: { colors: theme.palette.text.secondary },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary },
      },
    },
    theme: {
      mode: "light", // ou "dark" se seu tema fosse escuro
    },
    tooltip: {
      theme: "light",
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        height: "100%", // Para ocupar altura total em grids
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Cabeçalho do Gráfico */}
      {(title || subtitle) && (
        <Box mb={2}>
          {title && (
            <Typography variant="h6" component="h3" fontWeight="bold">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      {/* Área do Gráfico */}
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <Chart
          options={options}
          series={series}
          type={type}
          height={height}
          width="100%"
        />
      </Box>
    </Paper>
  );
}