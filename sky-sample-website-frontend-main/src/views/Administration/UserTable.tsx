import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Stack,
  TableFooter,
  TablePagination,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import theme from "../../theme";
import PageTitle from "../../components/PageTitle";
import Breadcrumb from "../../components/BreadCrumb";
import { useMemo, useState } from "react";
import ViewDataDrawer, { DrawerHeader } from "../../components/ViewDataDrawer";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { useSnackbar } from "notistack";
import { fetchAllUsers, updateUserType, deleteUser, User, grantUserAccess } from "../../api/userApi";
import { getAccessRolesList, createAccessRole } from "../../api/accessManagementApi";
import ViewUserContent from "./ViewUserContent";
import EditUserRoleDialog from "./EditUserRoleDialog";

import { PermissionKeys } from "./SectionList";
import useCurrentUserHaveAccess from "../../hooks/useCurrentUserHaveAccess";
import { useMutation, useQuery } from "@tanstack/react-query";
import { green, grey } from "@mui/material/colors";
import queryClient from "../../state/queryClient";

function UserTable() {
  const { enqueueSnackbar } = useSnackbar();
  const canEditUsers = useCurrentUserHaveAccess(PermissionKeys.ADMIN_USERS_EDIT);
  const [openViewDrawer, setOpenViewDrawer] = useState(false);
  const [selectedRow, setSelectedRow] = useState<User>(null);
  const [openEditUserRoleDialog, setOpenEditUserRoleDialog] = useState(false);
  const [grantingUserId, setGrantingUserId] = useState<number | null>(null);
  // const [userData, setUserData] = useState<User[]>(sampleUsers);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // handle pagination
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Users" },
  ];

  const { data: usersData, isFetching: isUserDataFetching } = useQuery({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["access-roles"],
    queryFn: getAccessRolesList,
  });

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  const paginatedUsersData = useMemo(() => {
    if (!usersData) return [];
    if (rowsPerPage === -1) {
      return usersData; // If 'All' is selected, return all data
    }
    return usersData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [usersData, page, rowsPerPage]);

  const { mutate: updateUserRoleMutation, isPending } = useMutation({
    mutationFn: updateUserType,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      setOpenEditUserRoleDialog(false);
      setOpenViewDrawer(false);
      enqueueSnackbar("User Updated Successfully!", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      const msg =
        error?.data?.errors
          ? (Object.values(error.data.errors).flat()[0] as string)
          : error?.data?.message ?? "User Role Update Failed";
      enqueueSnackbar(msg, { variant: "error" });
    },
  });

  const { mutate: grantAccessMutation } = useMutation({
    mutationFn: grantUserAccess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["access-roles"] });
      enqueueSnackbar(`Access granted successfully!`, { variant: "success" });
      setGrantingUserId(null);
    },
    onError: () => {
      enqueueSnackbar("Failed to grant access", { variant: "error" });
      setGrantingUserId(null);
    },
  });

  const { mutate: deleteUserMutation } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["access-roles"] });
      setDeleteDialogOpen(false);
      setOpenViewDrawer(false);
      setSelectedRow(null);
      enqueueSnackbar("User deleted successfully!", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Failed to delete user", { variant: "error" });
    },
  });

  return (
    <Stack>
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          marginY: 2,
          borderRadius: 1,
          overflowX: "hidden",
        }}
      >
        <PageTitle title="Users" />
        <Breadcrumb breadcrumbs={breadcrumbItems} />
        
      </Box>
      <Stack sx={{ alignItems: "center", width: "100%" }}>
        <TableContainer
            component={Paper}
            elevation={2}
            sx={{
              overflowX: "auto",
              maxWidth: isMobile ? "88vw" : "100%",
            }}
          >
            {isUserDataFetching && <LinearProgress sx={{ width: "100%" }} />}
            <Table aria-label="simple table">
              <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                <TableRow>
                  <TableCell>Id</TableCell>
                  <TableCell align="left">Name</TableCell>
                  <TableCell align="left">Email</TableCell>
                  <TableCell align="left">Role</TableCell>
                  <TableCell align="right">Job Position</TableCell>
                  <TableCell align="center">Access</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsersData?.length > 0 ? (
                  paginatedUsersData?.map((row) => (
                    <TableRow
                      key={`${row.id}`}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setSelectedRow(row);
                        setOpenViewDrawer(true);
                      }}
                    >
                      <TableCell align="left">{row.id}</TableCell>
                      <TableCell align="left">{row.name}</TableCell>
                      <TableCell align="left">{row.email}</TableCell>
                      <TableCell align="left">{row.userType?.userType}</TableCell>
                      <TableCell align="right">
                        {row.jobPosition ?? "--"}
                      </TableCell>
                      <TableCell align="center">
                        {row.userType?.id === 2 ? (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={grantingUserId === row.id ? <CircularProgress size={16} color="inherit" /> : <LockOpenIcon fontSize="small" />}
                            onClick={async (e) => {
                              e.stopPropagation();
                              setGrantingUserId(row.id);
                              
                              try {
                                let targetRole = (roles as any[]).find(r => r.userType?.toLowerCase() === row.name?.toLowerCase());
                                
                                if (!targetRole) {
                                  const baselineRole = (roles as any[]).find(r => r.userType?.toLowerCase() === 'user') || (roles as any[]).find(r => r.id !== 1 && r.id !== 2);
                                  
                                  const newRolePayload = {
                                    userType: row.name,
                                    description: `Custom access role for ${row.name}`,
                                    permissionObject: baselineRole ? baselineRole.permissionObject : {}
                                  };
                                  
                                  targetRole = await createAccessRole(newRolePayload as any);
                                }
                                
                                grantAccessMutation({ id: row.id, userTypeId: targetRole.id });
                                
                              } catch (error) {
                                enqueueSnackbar("Failed to grant custom access", { variant: "error" });
                                setGrantingUserId(null);
                              }
                            }}
                            disabled={!canEditUsers || grantingUserId === row.id}
                            sx={{
                              backgroundColor: "#e65100",
                              fontSize: "0.75rem",
                              textTransform: "none",
                              "&:hover": { backgroundColor: "#bf360c" },
                            }}
                          >
                            Give Access
                          </Button>
                        ) : (
                          <Chip
                            label="Access Assigned"
                            size="small"
                            sx={{
                              backgroundColor: green[50],
                              color: green[700],
                              border: `1px solid ${green[300]}`,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {row.availability ? (
                          <Chip
                            label="Active"
                            sx={{
                              backgroundColor: green[100],
                              color: green[800],
                            }}
                          />
                        ) : (
                          <Chip
                            label="Inactive"
                            sx={{
                              backgroundColor: grey[100],
                              color: grey[800],
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={!canEditUsers}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRow(row);
                            setDeleteDialogOpen(true);
                          }}
                          sx={{ minWidth: 0, padding: "4px 8px" }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      <Typography variant="body2">No Users found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                    colSpan={100}
                    count={usersData?.length ?? 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    showFirstButton={true}
                    showLastButton={true}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>

      </Stack>
      <ViewDataDrawer
        open={openViewDrawer}
        handleClose={() => setOpenViewDrawer(false)}
        fullScreen={true}
        drawerContent={
          <Stack spacing={1} sx={{ paddingX: theme.spacing(1) }}>
            <DrawerHeader
              title="User Details"
              handleClose={() => setOpenViewDrawer(false)}
              onEdit={() => {
                setSelectedRow(selectedRow);
                setOpenEditUserRoleDialog(true);
              }}
              disableEdit={!canEditUsers}
              // onDelete={() => setDeleteDialogOpen(true)}
              // disableDelete={
              //   !useCurrentUserHaveAccess(PermissionKeys.ADMIN_USERS_DELETE)
              // }
            />

            {selectedRow && (
              <Stack>
                <ViewUserContent selectedUser={selectedRow} />
              </Stack>
            )}
          </Stack>
        }
      />
      {openEditUserRoleDialog && (
        <EditUserRoleDialog
          open={openEditUserRoleDialog}
          handleClose={() => {
            setSelectedRow(null);
            setOpenViewDrawer(false);
            setOpenEditUserRoleDialog(false);
          }}
          onSubmit={(data) => {
            updateUserRoleMutation(data);
          }}
          defaultValues={selectedRow}
        />
      )}


      {deleteDialogOpen && (
        <DeleteConfirmationModal
          open={deleteDialogOpen}
          title="Remove User Confirmation"
          content={
            <>
              Are you sure you want to remove this user?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                This action is not reversible.
              </Alert>
            </>
          }
          handleClose={() => setDeleteDialogOpen(false)}
          deleteFunc={async () => deleteUserMutation(selectedRow?.id)}
          onSuccess={() => {
          }}
          handleReject={() => {
            setOpenViewDrawer(false);
            setSelectedRow(null);
            setDeleteDialogOpen(false);
          }}
        />
      )}
    </Stack>
  );
}

export default UserTable;
