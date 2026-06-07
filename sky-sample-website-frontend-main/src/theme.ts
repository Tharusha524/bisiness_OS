import { createTheme } from "@mui/material/styles";

export const getTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'dark' ? {
        background: {
          default: '#0f172a',
          paper: '#1e293b',
        },
      } : {}),
    },
    typography: {
      fontFamily: "Poppins, sans-serif",
    },
  });
};

const theme = getTheme('light');
export default theme;
