import Grid from '@mui/material/Grid'; 
import BaseChart from "@/components/charts/BaseChart";
import { Typography } from "@mui/material";

export default function DashboardTest() {
  return (
    <div style={{ padding: 30 }}>
      <Typography variant="h4" mb={4}>Dashboard Teste</Typography>
      
      <Grid container spacing={3}>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <BaseChart
            title="Ocorrências por Mês"
            subtitle="Comparativo 2024"
            type="bar"
            categories={["Jan", "Fev", "Mar", "Abr"]}
            series={[{ name: "CVLI", data: [30, 40, 45, 50] }]}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseChart
            title="Distribuição"
            type="pie"
            series={[44, 55, 13, 43]}
          />
        </Grid>
        
      </Grid>
    </div>
  );
}