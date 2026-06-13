import * as React from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Props {
  children: JSX.Element | JSX.Element[];
}

export default function FullScreenLayout({ children }: Props) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-primary, #f8fafc)",
      }}
    >
      <CssBaseline />

      {/* Top AppBar - matches existing app style */}
      <MuiAppBar
        position="fixed"
        sx={{
          backgroundColor: "#fff",
          color: "#1a1a2e",
          boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
          zIndex: 1200,
        }}
      >
        <Toolbar>
          {/* Back Button */}
          <IconButton
            edge="start"
            onClick={() => navigate(-1)}
            aria-label="go back"
            sx={{ color: "#024271", mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* BizOS Logo - consistent with MainLayout */}
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <Typography
              component="span"
              sx={{
                fontFamily: '"ALTRONED Trial", "Orbitron", sans-serif',
                fontWeight: 900,
                fontSize: { xs: "1.5rem", sm: "1.9rem" },
                color: "#1a1a2e",
                letterSpacing: 1,
                lineHeight: 1,
              }}
            >
              Bis
            </Typography>
            <Typography
              component="span"
              sx={{
                fontFamily: '"ALTRONED Trial", "Orbitron", sans-serif',
                fontWeight: 900,
                fontSize: { xs: "1.5rem", sm: "1.9rem" },
                color: "var(--pallet-orange, #f97316)",
                letterSpacing: 1,
                lineHeight: 1,
              }}
            >
              OS
            </Typography>
          </Box>

          <Typography
            component="span"
            sx={{
              fontSize: "0.75rem",
              color: "var(--pallet-blue, #024271)",
              letterSpacing: 0.5,
              fontStyle: "italic",
              display: { xs: "none", sm: "block" },
              ml: 1.5,
              lineHeight: 1,
            }}
          >
            One Platform. Complete Visibility.
          </Typography>
        </Toolbar>
      </MuiAppBar>

      {/* Main content — full width, horizontal scroll enabled */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: "64px",             /* offset for fixed AppBar */
          width: "100%",
          overflowX: "auto",      /* allows horizontal scroll on small screens */
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
