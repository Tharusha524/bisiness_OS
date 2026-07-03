import { BrowserRouter } from "react-router";
import AppRoutes from "./Routes.tsx";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { getTheme } from "./theme.ts";
import { SnackbarProvider, useSnackbar } from "notistack";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./state/queryClient.ts";
import useCurrentUser from "./hooks/useCurrentUser.ts";
import { useEffect, useMemo } from "react";
import AutoLogoutProvider from "./components/AutoLogoutProvider.tsx";

function PermissionDeniedListener() {
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail || 'You do not have permission to perform this action.';
      enqueueSnackbar(msg, { variant: 'error' });
    };
    window.addEventListener('permission-denied', handler);
    return () => window.removeEventListener('permission-denied', handler);
  }, [enqueueSnackbar]);
  return null;
}

import { es, fr, de, enUS } from "date-fns/locale";

function AppContent() {
  const { user } = useCurrentUser();

  const themeMode = useMemo(() => {
    if (!user || !user.themePreference || user.themePreference === 'System') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return user.themePreference.toLowerCase() as 'light' | 'dark';
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const locale = useMemo(() => {
    switch (user?.languageOverride) {
      case 'Spanish': return es;
      case 'French': return fr;
      case 'German': return de;
      default: return enUS;
    }
  }, [user]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter basename="/panda_jp_demo/">
          <SnackbarProvider maxSnack={3} autoHideDuration={2500}>
            <PermissionDeniedListener />
            <AutoLogoutProvider>
              <AppRoutes />
            </AutoLogoutProvider>
          </SnackbarProvider>
        </BrowserRouter>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
