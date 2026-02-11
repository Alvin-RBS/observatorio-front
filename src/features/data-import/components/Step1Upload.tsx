"use client";

import { Box, Typography, Button, Paper } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { ChangeEvent, useRef } from "react";

interface Step1UploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

export default function Step1Upload({ file, setFile }: Step1UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", textAlign: "center" }}>
      
      {!file ? (
        // --- ESTADO 1: NENHUM ARQUIVO SELECIONADO ---
        <Box
          sx={{
            border: "2px dashed #90CAF9",
            borderRadius: 3,
            bgcolor: "#F5F9FF",
            p: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#E3F2FD",
              borderColor: "primary.main"
            }
          }}
          onClick={() => inputRef.current?.click()}
        >
          {/* Input invisível */}
          <input
            type="file"
            hidden
            ref={inputRef}
            onChange={handleFileChange}
            accept=".csv, .xls, .xlsx, .ods"
          />

          <CloudUploadOutlinedIcon sx={{ fontSize: 60, color: "primary.main" }} />
          
          <Box>
            <Button 
              variant="contained" 
              component="span"
              sx={{ bgcolor: "#003B88", textTransform: "none", fontWeight: "bold", px: 4, mb: 1 }}
            >
              Escolher arquivo
            </Button>
            <Typography variant="body2" color="text.secondary">
              ou arraste e solte aqui
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            Formatos aceitos: .csv, .xls, .xlsx, .ods
          </Typography>
        </Box>
      ) : (
        // --- ESTADO 2: ARQUIVO SELECIONADO (Feedback Visual) ---
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            border: "1px solid #E0E0E0", 
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 2
          }}
        >
          <Box sx={{ p: 1, bgcolor: "primary.light", borderRadius: 1, color: "white" }}>
            <InsertDriveFileIcon />
          </Box>
          
          <Box sx={{ flexGrow: 1, textAlign: "left" }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(file.size / 1024).toFixed(2)} KB
            </Typography>
          </Box>

          <Button 
            color="error" 
            size="small" 
            startIcon={<DeleteIcon />} 
            onClick={handleClear}
          >
            Remover
          </Button>
        </Paper>
      )}
    </Box>
  );
}