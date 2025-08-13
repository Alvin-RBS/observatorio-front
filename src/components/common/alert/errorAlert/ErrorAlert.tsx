import { Alert, AlertTitle, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { ReactNode } from 'react';

type ErrorAlertProps = {
  title: string;
  message: ReactNode;
  helpText?: ReactNode;
  onClose: () => void;
};

export default function ErrorAlert({ title, message, helpText, onClose }: ErrorAlertProps) {
  return (
    <Alert
      severity="error"
      onClose={onClose}
      icon={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        maxWidth: '320px',
        margin: '1rem 0',
        padding: '6px 16px',
        borderRadius: 'var(--borderRadius, 4px)',
        backgroundColor: '#FDEDED',
        color: 'var(--_components-alert-error-color, #5F2120)',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
        fontFamily: 'var(--fontFamily, Roboto)',
      }}
      action={
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Fechar alerta"
          sx={{ position: 'absolute', top: 4, right: 4 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    >
      <AlertTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          fontWeight: 'bold',
          gap: '8px',
        }}
      >
        <ErrorOutlineIcon color="error" fontSize="small" />
        {title}
      </AlertTitle>

      <Box
        sx={{
          paddingLeft: '28px',
          color: 'var(--_components-alert-error-color, #5F2120)',
          fontFamily: 'var(--fontFamily, Roboto)',
          fontSize: 'var(--font-size-0875-rem, 14px)',
          fontStyle: 'normal',
          fontWeight: 'var(--fontWeightRegular, 400)',
          lineHeight: '143%',
          letterSpacing: '0.17px',
          fontFeatureSettings: "'liga' off, 'clig' off'",
          marginTop: '4px',
        }}
      >
        {message}

        {helpText && (
          <Box
            component="div"
            sx={{
              marginTop: '14px',
              fontSize: 'var(--font-size-0875-rem, 14px)',
              fontWeight: 'var(--fontWeightRegular, 400)',
              lineHeight: '143%',
              letterSpacing: '0.17px',
              fontFeatureSettings: "'liga' off, 'clig' off'",
            }}
          >
            {helpText}
          </Box>
        )}
      </Box>
    </Alert>
  );
}
