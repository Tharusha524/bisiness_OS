import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import { useState } from "react";
import companyLogo from "../../assets/company-logo1.jpg";
import { useForm } from "react-hook-form";
import CustomButton from "../../components/CustomButton";
import LoginIcon from "@mui/icons-material/Login";
import ForgotPasswordDialog from "./ForgotPasswordDialog";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, verify2fa } from "../../api/userApi";

function LoginForm() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up(990));
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);
  const [openForgotPasswordDialog, setOpenForgotPasswordDialog] = useState(false);

  // 2FA states
  const [show2faModal, setShow2faModal] = useState(false);
  const [userIdFor2fa, setUserIdFor2fa] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSuccessfulLogin = async (data: any) => {
    localStorage.setItem("token", data?.access_token);
    await queryClient.invalidateQueries({ queryKey: ["current-user"] });
    enqueueSnackbar("Welcome Back!", { variant: "success" });
    if (data?.user?.role === 'user') {
      navigate("/dashboard");
    } else {
      navigate("/home");
    }
  };

  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      if (data.requires_2fa) {
        enqueueSnackbar(data.message, { variant: "info" });
        setUserIdFor2fa(data.user_id);
        setShow2faModal(true);
      } else {
        handleSuccessfulLogin(data);
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Login Failed";
      enqueueSnackbar(msg, {
        variant: "error",
      });
    },
  });

  const { mutate: verify2faMutation, isPending: isVerifying } = useMutation({
    mutationFn: verify2fa,
    onSuccess: async (data) => {
      setShow2faModal(false);
      handleSuccessfulLogin(data);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Invalid OTP code";
      enqueueSnackbar(msg, { variant: "error" });
    }
  });

  const onLoginSubmit = (data: { email: string; password: string }) => {
    loginMutation(data);
  };

  const onVerify2faSubmit = () => {
    if (!userIdFor2fa || !otpCode) return;
    verify2faMutation({ user_id: userIdFor2fa, otp: otpCode });
  };

  return (
    <Stack
      spacing={2}
      sx={{
        height: isMdUp ? "100vh" : "auto",
        justifyContent: "center",
        margin: "2.5rem",
        marginBottom: isMdUp ? "2.5rem" : "22vh",
      }}
    >
      <Box>
        <img src={companyLogo} alt="logo" height={"65em"} />
      </Box>
      <Box>
        <Typography variant={"body2"}>
          Please sign-in to your account using your credentials
          <br /> Don't have an account?{" "}
          <span
            style={{ color: "var(--pallet-blue)", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Sign Up Here
          </span>
        </Typography>
      </Box>
      <form onSubmit={handleSubmit(onLoginSubmit)}>
        <TextField
          required
          id="email"
          label="Email Address"
          placeholder="sample@company.com"
          error={!!errors.email}
          fullWidth
          type="email"
          size="small"
          sx={{ marginTop: "0.5rem" }}
          {...register("email", {
            required: {
              value: true,
              message: "Email is required",
            },
            minLength: {
              value: 5,
              message: "Email must be at least 5 characters long",
            },
            maxLength: {
              value: 320,
              message: "Email cannot exceed 320 characters long",
            },
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Invalid email format",
            },
          })}
          helperText={errors.email ? errors.email.message : ""}
        />

        <TextField
          required
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          size="small"
          fullWidth
          sx={{ marginTop: "1rem" }}
          error={!!errors.password}
          {...register("password", {
            required: {
              value: true,
              message: "Password is required",
            },
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long",
            },
            maxLength: {
              value: 128,
              message: "Password cannot exceed 128 characters long",
            },
          })}
          helperText={errors.password ? errors.password.message : ""}
        />

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                size="small"
              />
            }
            label="Show Password"
            sx={{
              "& .MuiTypography-body1": {
                fontSize: "0.85rem",
              },
              marginTop: "0.5rem",
            }}
          />
        </Box>

        <Box
          sx={{
            marginTop: "1.6rem",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <CustomButton
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "var(--pallet-blue)",
            }}
            size="medium"
            disabled={isPending}
            startIcon={
              isPending ? (
                <CircularProgress color="inherit" size={"1rem"} />
              ) : (
                <LoginIcon />
              )
            }
          >
            Log In
          </CustomButton>
          <CustomButton
            variant="text"
            sx={{
              color: "var(--pallet-orange)",
            }}
            size="medium"
            onClick={() => setOpenForgotPasswordDialog(true)}
          >
            Forgot Password
          </CustomButton>
        </Box>
      </form>

      <Dialog open={show2faModal} onClose={() => setShow2faModal(false)}>
        <DialogTitle>Two-Factor Authentication Required</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A 6-digit verification code has been sent to your email address. Please enter it below to complete login.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="otp"
            label="6-Digit OTP Code"
            type="text"
            fullWidth
            variant="outlined"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            inputProps={{ maxLength: 6 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShow2faModal(false)} color="inherit">Cancel</Button>
          <Button onClick={onVerify2faSubmit} color="primary" variant="contained" disabled={isVerifying || otpCode.length !== 6}>
            {isVerifying ? "Verifying..." : "Verify & Login"}
          </Button>
        </DialogActions>
      </Dialog>

      <ForgotPasswordDialog
        open={openForgotPasswordDialog}
        handleClose={() => setOpenForgotPasswordDialog(false)}
      />
    </Stack>
  );
}

export default LoginForm;
