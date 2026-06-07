import { useEffect } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import companyLogo from "../../assets/company-logo1.jpg";
import useCurrentUser from "../../hooks/useCurrentUser";

function PendingAccessPage() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && (user as any).userType?.id !== 2) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    navigate("/");
  };

  return (
    <Stack
      sx={{
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f7fa",
        padding: 4,
        gap: 3,
      }}
    >
      <Box component="img" src={companyLogo} alt="logo" height={65} />

      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 3,
          boxShadow: 3,
          padding: 6,
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <HourglassEmptyRoundedIcon
          sx={{ fontSize: 72, color: "var(--pallet-orange)" }}
        />

        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ color: "var(--pallet-blue)" }}
        >
          Account Created Successfully!
        </Typography>

        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Your account is currently pending access assignment.
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Please contact your administrator to get access to the system. Once
          your role is assigned, you will be able to log in and use the
          platform.
        </Typography>

        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            marginTop: 2,
            borderColor: "var(--pallet-blue)",
            color: "var(--pallet-blue)",
            "&:hover": { backgroundColor: "var(--pallet-lighter-blue)" },
          }}
        >
          Back to Login
        </Button>
      </Box>
    </Stack>
  );
}

export default PendingAccessPage;
