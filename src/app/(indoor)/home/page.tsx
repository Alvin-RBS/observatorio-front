"use client";

import { Typography, Box, Grid, Paper, Button, Stack, Select, MenuItem, Divider } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import SecurityIcon from "@mui/icons-material/Security"; 
import LocalPoliceIcon from "@mui/icons-material/LocalPolice"; 

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useFile } from "@/context/FileContext"; 

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setUploadedFile } = useFile();

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      setUploadedFile(file);
      
      router.push("/meus-envios/adicionar");
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size = {{ xs: 12, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon color="action" sx={{ ml: 1 }} />
                <Select fullWidth variant="standard" disableUnderline defaultValue="01-01-2025" sx={{ fontWeight: 500 }}>
                    <MenuItem value="01-01-2025">01/01/2025</MenuItem>
                </Select>
            </Paper>
        </Grid>
        <Grid size = {{ xs: 12, md: 3 }}>
             <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon color="action" sx={{ ml: 1 }} />
                <Select fullWidth variant="standard" disableUnderline defaultValue="30-01-2025" sx={{ fontWeight: 500 }}>
                    <MenuItem value="30-01-2025">30/01/2025</MenuItem>
                </Select>
            </Paper>
        </Grid>
        <Grid size = {{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="action" sx={{ ml: 1 }} />
                <Select fullWidth variant="standard" disableUnderline defaultValue="pernambuco" sx={{ fontWeight: 500 }}>
                    <MenuItem value="pernambuco">Pernambuco</MenuItem>
                    <MenuItem value="recife">Recife</MenuItem>
                </Select>
            </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6"  sx={{ mb: 2 }}>Ocorrências gerais</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        <Grid size = {{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, height: "100%", borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Série histórica de violência letal</Typography>
                <Box sx={{ height: 200, display: "flex", alignItems: "flex-end", gap: 1, mt: 2 }}>
                    <svg viewBox="0 0 300 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        <line x1="0" y1="0" x2="300" y2="0" stroke="#eee" strokeWidth="1" />
                        <line x1="0" y1="50" x2="300" y2="50" stroke="#eee" strokeWidth="1" />
                        <line x1="0" y1="100" x2="300" y2="100" stroke="#eee" strokeWidth="1" />
                        
                        <polyline 
                            fill="none" 
                            stroke="#2196F3" 
                            strokeWidth="3" 
                            points="0,120 40,90 80,100 120,40 160,60 200,20 240,50 300,30" 
                        />
                         <polyline 
                            fill="rgba(33, 150, 243, 0.1)" 
                            stroke="none"
                            points="0,150 0,120 40,90 80,100 120,40 160,60 200,20 240,50 300,30 300,150" 
                        />
                    </svg>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={1}>
                   <Typography variant="caption" color="text.secondary">2019</Typography>
                   <Typography variant="caption" color="text.secondary">2025</Typography>
                </Box>
            </Paper>
        </Grid>

        <Grid size = {{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, height: "100%", borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Panorama de violência letal</Typography>
                <Box sx={{ height: 160, bgcolor: "#E3F2FD", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", mt: 2, mb: 2 }}>
                    <LocationOnIcon sx={{ fontSize: 40, color: "primary.main", opacity: 0.5 }} />
                    <Typography variant="caption" color="primary.main" fontWeight="bold">MAPA DE CALOR</Typography>
                </Box>
                <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between" sx={{ borderBottom: '1px solid #eee', pb: 0.5 }}>
                        <Typography variant="caption">Recife</Typography>
                        <Typography variant="caption" fontWeight="bold">40</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" sx={{ borderBottom: '1px solid #eee', pb: 0.5 }}>
                        <Typography variant="caption">Jaboatão</Typography>
                        <Typography variant="caption" fontWeight="bold">28</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption">Caruaru</Typography>
                        <Typography variant="caption" fontWeight="bold">15</Typography>
                    </Box>
                </Stack>
            </Paper>
        </Grid>

        <Grid size = {{ xs: 12, md: 4 }}>
             <Paper sx={{ p: 3, height: "100%", borderRadius: 3, overflow: 'hidden' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Registros de violência</Typography>
                <Box sx={{ mt: 2 }}>
                    <Box display="flex" bgcolor="#0D47A1" color="white" p={1} borderRadius={1}>
                        <Typography variant="caption" sx={{ flex: 1, fontWeight: 'bold' }}>Tipo</Typography>
                        <Typography variant="caption" sx={{ width: 50, fontWeight: 'bold', textAlign: 'center' }}>2025</Typography>
                        <Typography variant="caption" sx={{ width: 50, fontWeight: 'bold', textAlign: 'center' }}>Var %</Typography>
                    </Box>
                    {[1,2,3,4,5].map((i) => (
                         <Box key={i} display="flex" p={1} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                            <Typography variant="caption" sx={{ flex: 1 }}>Feminicídio</Typography>
                            <Typography variant="caption" sx={{ width: 50, textAlign: 'center' }}>40.900</Typography>
                            <Typography variant="caption" sx={{ width: 50, textAlign: 'center', color: 'error.main', fontWeight: 'bold' }}>↓ 15%</Typography>
                        </Box>
                    ))}
                </Box>
             </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size = {{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: "white",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              border: "1px solid #E0E0E0"
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Você tem algum arquivo com dados para adicionar?
            </Typography>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={onFileChange} 
                style={{ display: 'none' }} 
                accept=".csv,.xls,.xlsx,.ods"
            />

            <Box
              sx={{
                mt: 3,
                flexGrow: 1,
                border: "2px dashed #90CAF9",
                borderRadius: 2,
                bgcolor: "#F5F9FF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 4,
                gap: 2,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": { bgcolor: "#E3F2FD", borderColor: "primary.main" }
              }}
              onClick={handlePickFile} 
            >
              <CloudUploadIcon sx={{ fontSize: 60, color: "primary.main" }} />
              
              <Button 
                variant="contained" 
                size="large"
                onClick={(e) => {
                    e.stopPropagation();
                    handlePickFile();
                }}
                sx={{ 
                    bgcolor: "#003B88", 
                    textTransform: "none", 
                    fontWeight: "bold",
                    px: 4
                }}
              >
                Escolher arquivo
              </Button>
              
              <Typography variant="caption" color="text.secondary">
                Formatos aceitos: .csv, .xls, .xlsx, .ods
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size = {{ xs: 12 , md: 7 }}>
            <Paper sx={{ p: 4, height: "100%", borderRadius: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                     <Typography variant="h6" fontWeight="bold">Principais relatórios</Typography>
                     <Button size="small" sx={{ textTransform: 'none', fontWeight: 'bold' }}>Montar um relatório</Button>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Não encontrou a base de dados ou precisa de um relatório específico?
                </Typography>

                <Grid container spacing={2}>
                    <Grid size = {{ xs: 6 }}>
                        <Button variant="outlined" fullWidth startIcon={<DescriptionIcon />} sx={{ justifyContent: "flex-start", py: 1.5, textTransform: 'none', color: 'text.primary', borderColor: '#E0E0E0' }}>Crimes contra mulher</Button>
                    </Grid>
                    <Grid size = {{ xs: 6 }}>
                         <Button variant="outlined" fullWidth startIcon={<DescriptionIcon />} sx={{ justifyContent: "flex-start", py: 1.5, textTransform: 'none', color: 'text.primary', borderColor: '#E0E0E0' }}>Crimes de racismo</Button>
                    </Grid>
                    <Grid size = {{ xs: 6 }}>
                         <Button variant="outlined" fullWidth startIcon={<LocalPoliceIcon />} sx={{ justifyContent: "flex-start", py: 1.5, textTransform: 'none', color: 'text.primary', borderColor: '#E0E0E0' }}>Apreensão de drogas</Button>
                    </Grid>
                    <Grid size = {{ xs: 6 }}>
                         <Button variant="outlined" fullWidth startIcon={<SecurityIcon />} sx={{ justifyContent: "flex-start", py: 1.5, textTransform: 'none', color: 'text.primary', borderColor: '#E0E0E0' }}>Armas de fogo</Button>
                    </Grid>
                     <Grid size = {{ xs: 6 }}>
                         <Button variant="outlined" fullWidth startIcon={<DescriptionIcon />} sx={{ justifyContent: "flex-start", py: 1.5, textTransform: 'none', color: 'text.primary', borderColor: '#E0E0E0' }}>Violência Doméstica</Button>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}