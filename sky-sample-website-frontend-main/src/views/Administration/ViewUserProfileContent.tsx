import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  colors,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { DrawerContentItem } from "../../components/ViewDataDrawer";
import useIsMobile from "../../customHooks/useIsMobile";
import { updateUserProfileImage, removeUserProfileImage, User } from "../../api/userApi";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import queryClient from "../../state/queryClient";
import { enqueueSnackbar } from "notistack";
import { DrawerUpdateButtons } from "../../components/ViewProfileDataDrawer";
import UpdateUserProfile from "./UpdateUserProfileDialog";
import useCurrentUser from "../../hooks/useCurrentUser";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ProfileImage from "../../components/ProfileImageComponent";
import PasswordResetDialog from "./OpenPasswordResetDiaolg";
import ResetEmailDialog from "./OpenEmailResetDialog";
import CustomButton from "../../components/CustomButton";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

function ViewUserContent({ selectedUser }: { selectedUser: User }) {
  const { isTablet } = useIsMobile();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { user } = useCurrentUser();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      profileUpdateMutation({ id: selectedUser.id, imageFile: file });
    }
  };

  const statusColor = selectedUser?.availability ? "#44b700" : "#f44336";

  const { mutate: profileUpdateMutation, isPending } = useMutation({
    mutationFn: updateUserProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      enqueueSnackbar("Profile updated successfully!", { variant: "success" });
      setImageFile(null);
      setImagePreview(null);
    },
    onError: () => {
      enqueueSnackbar("Profile update failed", { variant: "error" });
    },
  });

  const { mutate: removeImageMutation, isPending: isRemoving } = useMutation({
    mutationFn: removeUserProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      enqueueSnackbar("Profile image removed!", { variant: "success" });
      setImageFile(null);
      setImagePreview(null);
    },
    onError: () => {
      enqueueSnackbar("Failed to remove profile image", { variant: "error" });
    },
  });

  const saveImage = () => {
    if (imageFile) {
      profileUpdateMutation({ id: selectedUser.id, imageFile });
    }
  };
  const [openViewProfileDrawer, setOpenViewProfileDrawer] = useState(false);
  const [openEditUserRoleDialog, setOpenEditUserRoleDialog] = useState(false);
  const [openEditUserPasswordResetDialog, setOpenEditUserPasswordResetDialog] =
    useState(false);
  const [openEditUserEmailResetDialog, setOpenEditUserEmailResetDialog] =
    useState(false);

  return (
    <Stack
      sx={{
        display: "flex",
        flexDirection: isTablet ? "column" : "row",
        px: "1rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        my: 2,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          p: "3rem",
        }}
        gap={2}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: statusColor,
              color: statusColor,
              boxShadow: "0 0 0 2px var(--color-bg-primary)",
              height: "16px",
              width: "16px",
              borderRadius: "50%",
            },
          }}
        >
          <ProfileImage
            name={selectedUser?.name}
            files={imageFile ? [imageFile] : selectedUser?.profileImage}
            fontSize="5rem"
          />
        </Badge>
        <Typography
          variant="h4"
          textAlign={"center"}
          sx={{
            fontSize: "1.5rem",
            color: "var(--pallet-dark-blue)",
          }}
        >
          {selectedUser?.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: isTablet ? "column" : "row",
          }}
          gap={2}
        >
          <CustomButton variant="outlined" component="label" sx={{ mt: 2 }}>
            Change Profile Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </CustomButton>

          {!imageFile && selectedUser?.profileImage && (selectedUser.profileImage as any[]).length > 0 && (
            <CustomButton
              variant="outlined"
              onClick={() => removeImageMutation(selectedUser.id)}
              sx={{ mt: 2, color: "var(--pallet-red)", borderColor: "var(--pallet-red)" }}
              disabled={isRemoving}
              endIcon={
                isRemoving && (
                  <CircularProgress size={20} sx={{ color: "var(--pallet-red)" }} />
                )
              }
            >
              Remove Photo
            </CustomButton>
          )}

          {isPending && (
            <CircularProgress size={24} sx={{ mt: 2, color: "var(--pallet-blue)" }} />
          )}
        </Box>
      </Box>

      <Stack
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--color-bg-card)",
          flex: 2,
          p: "3rem",
        }}
      >
        <Stack
          mb={4}
          sx={{
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <Box>
            <>
              {isTablet ? (
                <IconButton
                  aria-label="edit"
                  onClick={() => setOpenEditUserRoleDialog(true)}
                >
                  <EditOutlinedIcon sx={{ color: "var(--pallet-blue)" }} />
                </IconButton>
              ) : (
                <CustomButton
                  variant="contained"
                  sx={{ backgroundColor: "var(--pallet-blue)" }}
                  size="medium"
                  onClick={() => setOpenEditUserRoleDialog(true)}
                  startIcon={<EditOutlinedIcon />}
                >
                  Edit My Profile
                </CustomButton>
              )}
            </>
          </Box>
        </Stack>
        <Stack direction={isTablet ? "column" : "row"}>
          <DrawerContentItem
            label="Employee Id"
            value={selectedUser?.id}
            sx={{ flex: 1 }}
          />
          <DrawerContentItem
            label="Email"
            value={selectedUser?.email}
            sx={{ flex: 1 }}
          />
        </Stack>

        <Stack direction={isTablet ? "column" : "row"}>
          <DrawerContentItem
            label="Full Name"
            value={selectedUser?.name}
            sx={{ flex: 1 }}
          />
          <DrawerContentItem
            label="Mobile Number"
            value={selectedUser?.mobile}
            sx={{ flex: 1 }}
          />
        </Stack>

        <Stack direction={isTablet ? "column" : "row"}>
          <DrawerContentItem
            label="Designation"
            value={selectedUser?.jobPosition}
            sx={{ flex: 1 }}
          />
          <DrawerContentItem
            label="Gender"
            value={selectedUser?.gender}
            sx={{ flex: 1 }}
          />
        </Stack>

        <Stack
          sx={{
            mt: "1rem",
          }}
        >
          <Accordion
            variant="elevation"
            sx={{
              paddingTop: 0,
              borderRadius: "8px",
              marginTop: "1rem",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              style={{
                borderBottom: `1px solid${colors.grey[100]}`,
                borderRadius: "8px",
              }}
              id="panel1a-header"
            >
              <Box
                style={{
                  display: "flex",
                  flexDirection: "column",
                  margin: "10px 0",
                }}
              >
                <Typography
                  color="textSecondary"
                  variant="body2"
                  sx={{
                    color: "var(--pallet-red)",
                  }}
                >
                  DANGER ZONE
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails style={{ paddingTop: 0 }}>
              <DrawerUpdateButtons
                onResetEmail={() => {
                  setOpenEditUserEmailResetDialog(true);
                }}
                onResetPassword={() => {
                  setOpenEditUserPasswordResetDialog(true);
                }}
              />
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Stack>

      {openEditUserRoleDialog && (
        <UpdateUserProfile
          open={openEditUserRoleDialog}
          handleClose={() => {
            setOpenViewProfileDrawer(true);
            setOpenEditUserRoleDialog(false);
          }}
          defaultValues={user}
        />
      )}
      {openEditUserPasswordResetDialog && (
        <PasswordResetDialog
          open={openEditUserPasswordResetDialog}
          handleClose={() => {
            setOpenEditUserPasswordResetDialog(false);
            setOpenEditUserRoleDialog(false);
          }}
          onSubmit={(data) => {}}
          defaultValues={user}
        />
      )}
      {openEditUserEmailResetDialog && (
        <ResetEmailDialog
          open={openEditUserEmailResetDialog}
          handleClose={() => {
            setOpenEditUserEmailResetDialog(false);
            setOpenEditUserRoleDialog(false);
          }}
          defaultValues={user}
        />
      )}
    </Stack>
  );
}

export default ViewUserContent;
