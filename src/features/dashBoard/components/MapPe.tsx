"use client";

import { useEffect, useState } from "react";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { Box, Typography, useTheme } from "@mui/material";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// IMPORTANTE: Certifique-se que este arquivo existe no seu projeto conforme seu snippet
import municipiosPE from "@/components/common/map/municipiosPE.json";
import type { Feature, FeatureCollection, Geometry } from "geojson";

// Correção para ícones do Leaflet sumindo no build do Webpack/Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const geoData = municipiosPE as FeatureCollection<Geometry, { NM_MUN: string }>;

type AggressionMapProps = { 
  dataMap: Record<string, number>; // Renomeei para ficar genérico (era by_address)
};

// Funções utilitárias do seu código original
function normalizeCityName(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

function titleCase(s: string) {
  return s.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase());
}

// Hook de AutoResize do seu código original
function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 0);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    // ResizeObserver para detectar mudança no tamanho do container pai (drag & drop ou zoom)
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());
    
    return () => { 
        clearTimeout(t); 
        window.removeEventListener("resize", onResize); 
        ro.disconnect(); 
    };
  }, [map]);
  return null;
}

export default function PernambucoMap({ dataMap }: AggressionMapProps) {
  const theme = useTheme();

  // Normalização dos dados para garantir match com o GeoJSON
  const normalizedData = Object.fromEntries(
    Object.entries(dataMap).map(([city, count]) => [normalizeCityName(city), count])
  );

  // Define o valor máximo para a escala de cores
  const values = Object.values(dataMap);
  const maxValue = values.length > 0 ? Math.max(...values) : 1;

  // Função de cor baseada na intensidade (Seu código original)
  // Ajustei para usar tons de azul/vermelho baseados na intensidade
  const getColor = (v: number) => {
    if (v === 0) return "#F1F5F9"; // Slate-100 (Cinza muito suave para áreas sem dados)
    
    // Calcula a intensidade (0 a 1)
    const intensity = v / maxValue;

    // Gradiente manual simples para ficar bonito
    if (intensity > 0.8) return "#1e3a8a"; // Azul escuro (quase preto)
    if (intensity > 0.6) return "#1d4ed8"; // Azul forte
    if (intensity > 0.4) return "#3b82f6"; // Azul médio
    if (intensity > 0.2) return "#93c5fd"; // Azul claro
    return "#dbeafe"; // Azul muito claro
  };

 const styleFeature = (
    feature: Feature<Geometry, { NM_MUN?: string }> | undefined
  ): L.PathOptions => {
    const name = feature?.properties?.NM_MUN ?? "";
    const count = normalizedData[normalizeCityName(name)] || 0;
    
    return { 
        fillColor: getColor(count), 
        weight: 0.8,           // Borda fina
        color: "#727a8b",      // Borda BRANCA (dá o visual "clean")
        opacity: 1,
        fillOpacity: 0.9,      // Leve transparência para ver relevo se quiser
    };
  };



  // Coordenadas de PE aproximadas para centrar
  const bounds: [[number, number], [number, number]] = [[-9.6, -41.4], [-7.2, -34.5]];

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#F9FAFB",
        position: "relative",
        zIndex: 0 // Garante que não fique na frente de modais
      }}
    >
      <MapContainer
        style={{ width: "100%", height: "100%", background: "transparent" }}
        center={[-8.38, -37.9]} // Centro aproximado de PE
        zoom={6}
        minZoom={1}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        zoomControl={false} // Removemos o zoom padrão para ficar mais limpo, ou true se preferir
        scrollWheelZoom={true}
      >
        <AutoResize />
        {/* TileLayer Clean (CartoDB Light) */}
        <TileLayer 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
        />
        
        <GeoJSON
          data={geoData}
          style={styleFeature}
          onEachFeature={(feature, layer) => {
            const rawName = feature.properties?.NM_MUN || "";
            const count = normalizedData[normalizeCityName(rawName)] || 0;
            
            // Tooltip nativo do Leaflet
            layer.bindTooltip(
                `<div style="font-family: Roboto, sans-serif; text-align: center;">
                    <strong>${titleCase(rawName)}</strong><br/>
                    ${count} ocorrência${count !== 1 ? 's' : ''}
                </div>`, 
                {
                    direction: "top",
                    sticky: true,
                    opacity: 0.9
                }
            );

            // Efeito de Hover
            layer.on({
                mouseover: (e) => {
                    const l = e.target;
                    l.setStyle({ weight: 2, color: "#111827", fillOpacity: 0.9 });
                    l.bringToFront();
                },
                mouseout: (e) => {
                    // Reseta o estilo (precisa chamar a função styleFeature novamente ou resetStyle)
                    // Aqui simplificamos resetando para o estilo base do GeoJSON
                    const geoJsonLayer = layer.options as any; // Hack simples ou usar ref
                    e.target.setStyle({ weight: 1, color: "#6B7280", fillOpacity: 1 });
                }
            });
          }}
        />
      </MapContainer>
      
      {/* Legenda (Canto Inferior) */}
      <Box 
  sx={{ 
    position: "absolute",
    bottom: 22,
    right: 5,
    width: 90,
    height: 55, 
    bgcolor: "rgba(255,255,255,0.85)", 
    backdropFilter: "blur(8px)",
    p: 1, 
    borderRadius: 2,
    zIndex: 1000,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255,255,255,0.5)",
    display: "flex",
    flexDirection: "column",
    gap: 0.5 
  }}
>
        <Typography variant="caption" sx={{fontSize: 10, fontWeight: 700, color: "#475569"}}>
            INTENSIDADE
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
             {/* Gradiente visual na legenda */}
             <Box sx={{ 
                 width: 80, 
                 height: 6, 
                 background: "linear-gradient(90deg, #dbeafe 0%, #1e3a8a 100%)",
                 borderRadius: 1
             }} />
        </Box>
        <Box display="flex" justifyContent="space-between" width="100%">
            <Typography variant="caption" fontSize={9} color="#64748b">0</Typography>
            <Typography variant="caption" fontSize={9} color="#64748b">Máx ({maxValue})</Typography>
        </Box>
      </Box>

    </Box>
  );
}