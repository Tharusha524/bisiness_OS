import { Avatar, Badge, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { DrawerContentItem } from "../../components/ViewDataDrawer";
import useIsMobile from "../../customHooks/useIsMobile";
import { updateUserProfileImage, removeUserProfileImage, User } from "../../api/userApi";
import { useState } from "react";
import MultiDrawerContent from "../../components/MultiDrawerContent";
import ProfileImage from "../../components/ProfileImageComponent";
import { useMutation } from "@tanstack/react-query";
import queryClient from "../../state/queryClient";
import { enqueueSnackbar } from "notistack";
import CustomButton from "../../components/CustomButton";

function ViewUserContent({ selectedUser }: { selectedUser: User }) {
  const { isTablet } = useIsMobile();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const statusColor = selectedUser?.availability == true ? "#44b700" : "#f44336";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const { mutate: uploadMutation, isPending: isUploading } = useMutation({
    mutationFn: updateUserProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      enqueueSnackbar("Profile image updated!", { variant: "success" });
      setImageFile(null);
      setImagePreview(null);
    },
    onError: () => enqueueSnackbar("Failed to update profile image", { variant: "error" }),
  });

  const { mutate: removeMutation, isPending: isRemoving } = useMutation({
    mutationFn: removeUserProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      enqueueSnackbar("Profile image removed!", { variant: "success" });
      setImageFile(null);
      setImagePreview(null);
    },
    onError: () => enqueueSnackbar("Failed to remove profile image", { variant: "error" }),
  });

  const hasExistingImage =
    selectedUser?.profileImage && (selectedUser.profileImage as any[]).length > 0;

  return (
    <Stack
      sx={{
        display: "flex",
        marginY: 5,
        flexDirection: isTablet ? "column" : "row",
        p: "3rem",
      }}
      gap={4}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          p: "3rem",
          boxShadow: 3,
        }}
        gap={2}
      >
        <Typography
          variant="h4"
          sx={{ fontSize: "1.5rem", color: "var(--pallet-dark-blue)", marginTop: 2 }}
        >
          {selectedUser?.name}
        </Typography>

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

        {/* Change Profile Image */}
        <CustomButton variant="outlined" component="label" sx={{ mt: 1 }}>
          {hasExistingImage ? "Change Profile Image" : "Add Profile Image"}
          <input type="file" hidden accept="image/*" onChange={handleImageChange} />
        </CustomButton>

        {/* Save button — only after a file is selected */}
        {imageFile && (
          <CustomButton
            variant="contained"
            onClick={() => uploadMutation({ id: selectedUser.id, imageFile })}
            sx={{ backgroundColor: "var(--pallet-blue)" }}
            disabled={isUploading}
            endIcon={isUploading && <CircularProgress size={18} sx={{ color: "gray" }} />}
          >
            Save
          </CustomButton>
        )}

        {/* Remove button — only when existing image and no new file selected */}
        {!imageFile && hasExistingImage && (
          <CustomButton
            variant="outlined"
            onClick={() => removeMutation(selectedUser.id)}
            sx={{ color: "var(--pallet-red)", borderColor: "var(--pallet-red)" }}
            disabled={isRemoving}
            endIcon={isRemoving && <CircularProgress size={18} sx={{ color: "var(--pallet-red)" }} />}
          >
            Remove Photo
          </CustomButton>
        )}
      </Box>

      <Stack
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          flex: 2,
          boxShadow: 3,
          p: "3rem",
        }}
      >
        <Stack sx={{ display: "flex", flexDirection: "row", backgroundColor: "var(--color-bg-card)", flex: 1 }}>
          <DrawerContentItem label="Employee Id" value={selectedUser?.id} sx={{ flex: 1 }} />
          <DrawerContentItem label="Email" value={selectedUser?.email} sx={{ flex: 1 }} />
        </Stack>

        <Stack sx={{ display: "flex", flexDirection: "row", backgroundColor: "var(--color-bg-card)", flex: 1 }}>
          <DrawerContentItem label="Full Name" value={selectedUser?.name} sx={{ flex: 1 }} />
          <DrawerContentItem label="Mobile Number" value={selectedUser?.mobile} sx={{ flex: 1 }} />
        </Stack>

        <Stack sx={{ display: "flex", flexDirection: "row", backgroundColor: "var(--color-bg-card)", flex: 1 }}>
          <DrawerContentItem label="Designation" value={selectedUser?.jobPosition} sx={{ flex: 1 }} />
          <DrawerContentItem label="Gender" value={selectedUser?.gender} sx={{ flex: 1 }} />
        </Stack>

        <Stack sx={{ display: "flex", flexDirection: "row", backgroundColor: "var(--color-bg-card)", flex: 1 }}>
          <DrawerContentItem label="User Level" value={selectedUser?.userLevel?.levelName} sx={{ flex: 1 }} />
          <DrawerContentItem label="User Type" value={selectedUser?.userType?.userType} sx={{ flex: 1 }} />
        </Stack>

        <Stack sx={{ display: "flex", flexDirection: "row", backgroundColor: "var(--color-bg-card)", flex: 1 }}>
          <DrawerContentItem label="Department" value={selectedUser?.department} sx={{ flex: 1 }} />
        </Stack>

        <Stack sx={{ display: "flex", flexDirection: "row", backgroundColor: "var(--color-bg-card)", flex: 1 }}>
          <MultiDrawerContent label="Assigned Factories" value={selectedUser?.assignedFactory} sx={{ flex: 1 }} />
          <MultiDrawerContent label="Responsible Sections" value={selectedUser?.responsibleSection} sx={{ flex: 1 }} />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default ViewUserContent;
