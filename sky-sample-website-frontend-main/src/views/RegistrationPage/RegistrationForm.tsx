import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Autocomplete,
} from "@mui/material";
import { useState, useEffect } from "react";
import groupLogo from "../../assets/group-logo.png";
import { useForm, Controller } from "react-hook-form";
import CustomButton from "../../components/CustomButton";
import LoginIcon from "@mui/icons-material/Login";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { registerUser } from "../../api/userApi";
import { getOrganization } from "../../api/OrganizationSettings/organizationSettingsApi";
import SwitchButton from "../../components/SwitchButton";
import AutoCheckBox from "../../components/AutoCheckbox";
import companyLogo from "../../assets/company-logo1.jpg";

//API Imports
import { departmentSchema, fetchDepartmentData } from "../../api/departmentApi";
import {
  jobPositionSchema,
  fetchJobPositionData,
} from "../../api/jobPositionApi";

function RegistrationForm() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up(990));
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  //API Fetch Data
  // const [departments, setDepartments] = useState<departmentSchema[]>([]);
  // const [factory, setFactory] = useState<factorySchema[]>([]);
  // const [jobPositions, setJobPositions] = useState<jobPositionSchema[]>([]);

  const { data: orgData } = useQuery({
    queryKey: ["organization"],
    queryFn: getOrganization,
  });

  const selfRegAllowed = orgData?.allowSelfRegistration !== false; // default allow if not set
  const allowedDomains: string[] = (orgData?.allowedEmailDomains as string[] | null) || [];

  const { data: departments, isFetched: isDepartmentsFetched } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartmentData,
  });

  const { data: jobPositions, isFetched: isJobPositionsFetched } = useQuery({
    queryKey: ["jobPositions"],
    queryFn: fetchJobPositionData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm({
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
      mobileNumber: null,
      name: "",
      confirmPassword: "",
      isCompanyEmployee: false,
      jobPosition: "",
      department: "",
      employeeNumber: "",
    },
  });

  const isNotEmployee = watch("isCompanyEmployee");
  const userPassword = watch("password");

  const { mutate: registrationMutation, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: async (data) => {
      localStorage.setItem("token", data?.access_token);
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      enqueueSnackbar("Account Created Successfully!", { variant: "success" });
      navigate("/pending-access");
    },
    onError: (error: any) => {
      const errors = error?.data?.errors;
      const firstError = errors
        ? Object.values(errors).flat()[0] as string
        : null;
      enqueueSnackbar(firstError ?? error?.data?.message ?? "Registration Failed", {
        variant: "error",
      });
    },
  });

  const onRegistrationSubmit = (data) => {
    if (!selfRegAllowed) {
      enqueueSnackbar("Self-registration is disabled. Contact an administrator.", { variant: "error" });
      return;
    }
    if (allowedDomains.length > 0) {
      const domain = data.email.split("@")[1]?.toLowerCase();
      const ok = allowedDomains.some(d => d.toLowerCase() === domain);
      if (!ok) {
        enqueueSnackbar(`Email domain "@${domain}" is not allowed. Use a company email.`, { variant: "error" });
        return;
      }
    }
    registrationMutation(data);
  };

  //API functions to get data
  // useEffect(() => {
  //   async function getDepartments() {
  //     const data = await fetchDepartmentData();
  //     setDepartments(data);
  //   }
  //   getDepartments();
  // }, []);

  // useEffect(() => {
  //   async function getFactory() {
  //     const data = await fetchFactoryData();
  //     setFactory(data);
  //   }
  //   getFactory();
  // }, []);

  // useEffect(() => {
  //   async function getJobPosition() {
  //     const data = await fetchJobPositionData();
  //     setJobPositions(data);
  //   }
  //   getJobPosition();
  // }, []);

  return (
    <Stack
      spacing={2}
      sx={{
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
          Create an account to access the platform
        </Typography>
      </Box>

      {!selfRegAllowed && (
        <Alert severity="error" sx={{ mb: 1 }}>
          Self-registration is currently disabled. Please contact an administrator to create your account.
        </Alert>
      )}
      {selfRegAllowed && allowedDomains.length > 0 && (
        <Alert severity="info" sx={{ mb: 1 }}>
          Only email addresses from <strong>{allowedDomains.join(", ")}</strong> are accepted.
        </Alert>
      )}

      <form onSubmit={handleSubmit(onRegistrationSubmit)}>
        <TextField
          required
          id="name"
          label="Name"
          error={!!errors.name}
          fullWidth
          size="small"
          sx={{ marginTop: "1rem" }}
          helperText={errors.name ? errors.name.message : ""}
          {...register("name", {
            required: {
              value: true,
              message: "Required",
            },
            pattern: {
              value: /^[a-zA-Z\s]+$/,
              message: "Name must contain only letters and spaces",
            },
          })}
        />

        <TextField
          required
          id="email"
          label="Email Address"
          placeholder="sample@company.com"
          error={!!errors.email}
          fullWidth
          type="email"
          size="small"
          sx={{ marginTop: "1rem" }}
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

        <TextField
          required
          id="confirmPassword"
          label="Confirm Password"
          type={"password"}
          size="small"
          fullWidth
          helperText={
            errors.confirmPassword ? errors.confirmPassword.message : ""
          }
          sx={{ marginTop: "1rem" }}
          error={!!errors.confirmPassword}
          {...register("confirmPassword", {
            required: {
              value: true,
              message: "Confirm Password is required",
            },
            validate: {
              matchesPreviousPassword: (value) =>
                value === userPassword || "Passwords do not match",
            },
          })}
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
              marginTop: "1rem",
            }}
          />
        </Box>

        <TextField
          required
          id="mobileNumber"
          label="Mobile Number"
          type="tel"
          error={!!errors.mobileNumber}
          fullWidth
          size="small"
          sx={{ marginTop: "1rem" }}
          helperText={
            typeof errors.mobileNumber?.message === "string"
              ? errors.mobileNumber.message
              : ""
          }
          {...register("mobileNumber", {
            required: {
              value: true,
              message: "Mobile number is required",
            },
            minLength: {
              value: 6,
              message: "Mobile number must be at least 6 digits",
            },
            maxLength: {
              value: 16,
              message: "Mobile number cannot exceed 16 digits",
            },
            pattern: {
              value: /^[0-9]+$/,
              message: "Enter a valid mobile number (digits only)",
            },
          })}
        />

        <Box sx={{ marginTop: "2rem" }}>
          <Controller
            control={control}
            name={"isCompanyEmployee"}
            render={({ field }) => {
              return (
                <SwitchButton
                  label="Is Company Employee"
                  onChange={field.onChange}
                  value={field.value}
                />
              );
            }}
          />
        </Box>

        {isNotEmployee ? (
          <Stack
            sx={{
              display: "flex",
            }}
          >
            <Controller
              control={control}
              name="department"
              rules={{ required: "Department is required" }}
              render={({ field }) => (
                <Autocomplete
                  size="small"
                  options={
                    departments?.map((supplierType) => supplierType.department) ||
                    []
                  }
                  value={field.value || null}
                  onChange={(_, newValue) => field.onChange(newValue ?? "")}
                  sx={{}}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={!!errors.department}
                      helperText={errors.department ? errors.department.message : ""}
                      label="Department"
                    />
                  )}
                />
              )}
            />
            <Controller
              control={control}
              name="jobPosition"
              rules={{ required: "Job Position is required" }}
              render={({ field }) => (
                <Autocomplete
                  size="small"
                  options={
                    jobPositions?.map(
                      (supplierType) => supplierType.jobPosition
                    ) || []
                  }
                  value={field.value || null}
                  onChange={(_, newValue) => field.onChange(newValue ?? "")}
                  sx={{ marginTop: "1rem" }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={!!errors.jobPosition}
                      helperText={errors.jobPosition ? errors.jobPosition.message : ""}
                      label="Job Position"
                    />
                  )}
                />
              )}
            />

            <TextField
              required
              id="employeeNumber"
              label="Employee Number"
              error={!!errors.employeeNumber}
              size="small"
              sx={{ marginTop: "1rem" }}
              {...register("employeeNumber", {
                required: {
                  value: true,
                  message: "Employee Number is required",
                },
                pattern: {
                  value: /^[a-zA-Z0-9]+$/,
                  message:
                    "Employee Number must contain only letters and numbers",
                },
              })}
              helperText={
                errors.employeeNumber ? errors.employeeNumber.message : ""
              }
            />
          </Stack>
        ) : null}

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
            Create Account
          </CustomButton>
          <CustomButton
            variant="text"
            sx={{
              color: "var(--pallet-orange)",
            }}
            size="medium"
            onClick={() => navigate("/")}
          >
            Login to an existing account
          </CustomButton>
        </Box>
      </form>
    </Stack>
  );
}

export default RegistrationForm;
