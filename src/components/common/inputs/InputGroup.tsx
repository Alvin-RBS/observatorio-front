import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import inputMask, { MaskTypes } from "@/utils/mask";
import { SxProps, Theme } from "@mui/material/styles";

type InputGroupProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string | null;
  placeholder?: string;
  size?: "small" | "medium";
  options?: { label: string; value: string }[];
  disabled?: boolean;
  maxLength?: number;
  maskType?: MaskTypes;
  shrinkLabel?: boolean;
  maxWidth?: string;
  sx?: SxProps<Theme>; 
};

export default function InputGroup({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  error = false,
  helperText = "",
  placeholder = "",
  size = "medium",
  options = [],
  disabled = false,
  maxLength,
  maskType,
  shrinkLabel = false,
  maxWidth = "100%",
  sx, 
}: InputGroupProps) {
  const isSelect = !!options.length;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (maskType && inputMask[maskType]) {
      const masked = inputMask[maskType](event);
      const syntheticEvent = {
        ...event,
        target: {
          ...event.target,
          value: masked,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    } else {
      onChange(event);
    }
  }

  return (
    <TextField
      id={id}
      label={label}
      type={isSelect ? undefined : type}
      value={value}
      onChange={handleChange}
      variant="outlined"
      size={size}
      fullWidth
      select={isSelect}
      error={!!error}
      helperText={helperText}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      sx={sx} 
      slotProps={{
        input: {
          inputProps: maxLength ? { maxLength } : undefined,
          style: {
            maxWidth: maxWidth,
          },
        },
        inputLabel: shrinkLabel ? { shrink: true } : undefined,
        select: {
          MenuProps: {
            PaperProps: {
              style: {
                maxHeight: 300,
              },
            },
          },
        },
      }}
    >
      {isSelect &&
        options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
    </TextField>
  );
}
