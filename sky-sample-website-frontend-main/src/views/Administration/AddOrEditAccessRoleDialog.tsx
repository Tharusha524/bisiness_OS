import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Alert,
  Box,
  Stack,
  Divider,
  DialogContent,
  IconButton,
  DialogTitle,
  Dialog,
  DialogActions,
  Button,
  TextField,
  useTheme,
} from "@mui/material";
import useIsMobile from "../../customHooks/useIsMobile";
import {
  defaultAdminPermissions,
  PermissionKeys,
  PermissionSection,
} from "./SectionList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { UserRole } from "../../api/userApi";
import CloseIcon from "@mui/icons-material/Close";
import { PermissionKeysObject, getDynamicPermissionSections } from "./SectionList";
import { grey } from "@mui/material/colors";
import CustomButton from "../../components/CustomButton";
import { useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { generateRandomNumberId } from "../../util/numbers.util";
import { useEffect, useState } from "react";
import api from "../../utils/api";

function AddOrEditAccessRoleDialog({
  open,
  defaultValues,
  handleClose,
  onSubmit,
}: {
  open: boolean;
  defaultValues: UserRole;
  handleClose: () => void;
  onSubmit: (data: UserRole) => void;
}) {
  const theme = useTheme();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<{
    userType: string;
    description: string;
    permissionObject: PermissionKeysObject;
  }>({
    defaultValues: {
      userType: defaultValues?.userType,
      description: defaultValues?.description,
      permissionObject:
        defaultValues?.permissionObject ?? defaultAdminPermissions,
    },
  });

  const rolePermissions = watch("permissionObject");
  const [systems, setSystems] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      api.get("/systems").then((res) => {
        setSystems(res.data);
      }).catch(console.error);
    }
  }, [open]);

  const dynamicSections = getDynamicPermissionSections(systems);

  const handleSubmitRole = (data: {
    userType: string;
    description: string;
  }) => {
    const submitData: UserRole = {
      id: defaultValues?.id ?? generateRandomNumberId(),
      userType: data.userType,
      description: data.description,
      permissionObject: rolePermissions,
    };
    onSubmit(submitData);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        handleClose();
      }}
      fullScreen={true}
      PaperProps={{
        style: {
          backgroundColor: theme.palette.background.paper,
        },
        component: "form",
      }}
    >
      <DialogTitle
        sx={{
          paddingY: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" component="div">
          {defaultValues ? "Edit Role Details" : "Add a New Role"}
        </Typography>
        <IconButton
          aria-label="open drawer"
          onClick={handleClose}
          edge="start"
          sx={{
            color: theme.palette.text.primary,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={1} sx={{ padding: theme.spacing(1) }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TextField
              required
              label="Role Name"
              size="small"
              sx={{ margin: "0.5rem" }}
              error={!!errors.userType}
              {...register("userType", {
                required: {
                  value: true,
                  message: "Required",
                },
                pattern: {
                  value: /^[a-zA-Z0-9\s]+$/,
                  message: "Role Name can only contain letters and numbers",
                },
              })}
              helperText={errors.userType ? errors.userType.message : ""}
            />
            <TextField
              required
              label="Description"
              multiline
              rows={4}
              size="small"
              sx={{ flex: 1, margin: "0.5rem" }}
              error={!!errors.description}
              {...register("description", {
                required: {
                  value: true,
                  message: "Required",
                },
                pattern: {
                  value: /^[a-zA-Z0-9\s.,-]+$/,
                  message:
                    "Description can only contain letters, numbers, spaces, and punctuation",
                },
              })}
            />
          </Box>
          <Box sx={{ paddingY: "1rem" }}>
            <Typography variant="subtitle2" sx={{ marginBottom: "1rem" }}>
              User Roles Permission
            </Typography>
            <Alert severity="info">
              Set the permissions for the role from the list below.
            </Alert>
          </Box>
          <Stack>
            {dynamicSections.map((permissionSection) => (
              <SectionAccordion
                key={permissionSection.mainSection}
                permissionSection={permissionSection}
                rolePermissions={rolePermissions}
                setRolePermissions={(rolePermissions) => {
                  setValue("permissionObject", rolePermissions);
                }}
                systems={systems}
              />
            ))}
          </Stack>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ padding: "1rem" }}>
        <Button
          onClick={() => {
            handleClose();
          }}
          sx={{ color: "var(--pallet-blue)" }}
        >
          Cancel
        </Button>
        <CustomButton
          variant="contained"
          sx={{
            backgroundColor: "var(--pallet-blue)",
          }}
          size="medium"
          onClick={handleSubmit((data) => {
            handleSubmitRole(data);
          })}
        >
          {defaultValues ? "Update Changes" : "Create Role"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}

export default AddOrEditAccessRoleDialog;

const SectionAccordion = ({
  permissionSection,
  rolePermissions,
  setRolePermissions,
  systems,
}: {
  permissionSection: PermissionSection;
  rolePermissions: PermissionKeysObject;
  setRolePermissions: (rolePermissions: PermissionKeysObject) => void;
  systems?: any[];
}) => {
  const { isMobile } = useIsMobile();
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography component="span">
          {permissionSection.mainSection}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer
          sx={{
            overflowX: "auto",
            maxWidth: isMobile ? "88vw" : "100%",
          }}
        >
          <Table aria-label="simple table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell></TableCell>
                <TableCell align="center">View</TableCell>
                <TableCell align="center">Create</TableCell>
                <TableCell align="center">Update</TableCell>
                <TableCell align="center">Delete</TableCell>
                <TableCell align="center">Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {permissionSection.subSections.map((row) => {
                if ("break" in row) {
                  return (
                    <TableRow key={`${row.name}`}>
                      <TableCell
                        colSpan={6}
                        align="left"
                        sx={{
                          backgroundColor: "var(--pallet-lighter-grey)",
                          marginTop: "0.5rem",
                          borderTop: "2px solid var(--pallet-grey)",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {row.name}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                } else {
                  let isDisabled = false;
                  if (row.key.startsWith('KPI_')) {
                    const kpiId = row.key.split('_')[1];
                    const parentSys = systems?.find((s: any) => s.metrics && s.metrics.some((m: any) => String(m.id) === kpiId));
                    if (parentSys && !rolePermissions[`SYSTEM_${parentSys.id}_VIEW`]) {
                      isDisabled = true;
                    }
                  }

                  return (
                    <TableRow key={`${row.key}`}>
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      {row.permissionsExists.VIEW ? (
                        <TableCell align="center">
                          <Checkbox
                            checked={Boolean(
                              rolePermissions[`${row.key}_VIEW`] ||
                                `${row.key}_VIEW` ===
                                  PermissionKeys.INSIGHT_VIEW
                            )}
                            disabled={
                              isDisabled || `${row.key}_VIEW` === PermissionKeys.INSIGHT_VIEW
                            }
                            onChange={() => {
                              if (rolePermissions[`${row.key}_VIEW`]) {
                                const newPermissions = {
                                  ...rolePermissions,
                                  [`${row.key}_VIEW`]: false,
                                  [`${row.key}_CREATE`]: false,
                                  [`${row.key}_EDIT`]: false,
                                  [`${row.key}_DELETE`]: false,
                                  [`${row.key}_NOTE`]: false,
                                };

                                if (row.key.startsWith("SYSTEM_") && systems) {
                                  const systemId = row.key.split("_")[1];
                                  const system = systems.find((s: any) => String(s.id) === systemId);
                                  if (system && system.metrics) {
                                    system.metrics.forEach((m: any) => {
                                      newPermissions[`KPI_${m.id}_VIEW`] = false;
                                      newPermissions[`KPI_${m.id}_CREATE`] = false;
                                      newPermissions[`KPI_${m.id}_EDIT`] = false;
                                      newPermissions[`KPI_${m.id}_DELETE`] = false;
                                      newPermissions[`KPI_${m.id}_NOTE`] = false;
                                    });
                                  }
                                }

                                setRolePermissions(newPermissions);
                              } else {
                                setRolePermissions({
                                  ...rolePermissions,
                                  [`${row.key}_VIEW`]: true,
                                  [`${row.key}_CREATE`]: true,
                                  [`${row.key}_EDIT`]: true,
                                  [`${row.key}_DELETE`]: true,
                                });
                              }
                            }}
                            inputProps={{ "aria-label": "controlled" }}
                          />
                        </TableCell>
                      ) : (
                        <TableCell align="center"></TableCell>
                      )}
                      {row.permissionsExists.CREATE &&
                      row.permissionsExists.VIEW ? (
                        <TableCell align="center">
                          <Checkbox
                            checked={Boolean(
                              rolePermissions[`${row.key}_CREATE`]
                            )}
                            disabled={isDisabled}
                            onChange={() => {
                              if (rolePermissions[`${row.key}_CREATE`]) {
                                setRolePermissions({
                                  ...rolePermissions,
                                  [`${row.key}_CREATE`]: false,
                                });
                              } else {
                                setRolePermissions({
                                  ...rolePermissions,
                                  [`${row.key}_CREATE`]: true,
                                  [`${row.key}_VIEW`]: true,
                                });
                              }
                            }}
                            inputProps={{ "aria-label": "controlled" }}
                          />
                        </TableCell>
                      ) : (
                        <TableCell align="center"></TableCell>
                      )}
                      {row.permissionsExists.EDIT &&
                      row.permissionsExists.VIEW ? (
                        <TableCell align="center">
                          <Checkbox
                            checked={Boolean(
                              rolePermissions[`${row.key}_EDIT`]
                            )}
                            disabled={isDisabled}
                            onChange={() => {
                              if (rolePermissions[`${row.key}_EDIT`]) {
                                setRolePermissions({
                                  ...rolePermissions,
                                  [`${row.key}_EDIT`]: false,
                                });
                              } else {
                                setRolePermissions({
                                  ...rolePermissions,
                                  [`${row.key}_EDIT`]: true,
                                  [`${row.key}_VIEW`]: true,
                                });
                              }
                            }}
                            inputProps={{ "aria-label": "controlled" }}
                          />
                        </TableCell>
                      ) : (
                        <TableCell align="center"></TableCell>
                      )}
                      {row.permissionsExists.DELETE &&
                      row.permissionsExists.VIEW ? (
                        <TableCell align="center">
                          <Checkbox
                            checked={Boolean(
                              rolePermissions[`${row.key}_DELETE`]
                            )}
                            disabled={isDisabled}
                            onChange={() => {
                              if (rolePermissions[`${row.key}_DELETE`]) {
                                setRolePermissions({
                                  ...rolePermissions,
                                  [`${row.key}_DELETE`]: false,
                                });
                              } else {
                                setRolePermissions({
                                  ...rolePermissions,
                                  [`${row.key}_DELETE`]: true,
                                  [`${row.key}_VIEW`]: true,
                                });
                              }
                            }}
                            inputProps={{ "aria-label": "controlled" }}
                          />
                        </TableCell>
                      ) : (
                        <TableCell align="center"></TableCell>
                      )}
                      {row.permissionsExists.NOTE &&
                      row.permissionsExists.VIEW ? (
                        <TableCell align="center">
                          <Checkbox
                            checked={Boolean(
                              rolePermissions[`${row.key}_NOTE`]
                            )}
                            disabled={isDisabled || !rolePermissions[`${row.key}_VIEW`]}
                            onChange={() => {
                              if (rolePermissions[`${row.key}_NOTE`]) {
                                setRolePermissions({
                                  ...rolePermissions,
                                  [`${row.key}_NOTE`]: false,
                                });
                              } else {
                                setRolePermissions({
                                  ...rolePermissions,
                                  [`${row.key}_NOTE`]: true,
                                  [`${row.key}_VIEW`]: true,
                                });
                              }
                            }}
                            inputProps={{ "aria-label": "controlled" }}
                          />
                        </TableCell>
                      ) : (
                        <TableCell align="center"></TableCell>
                      )}
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};
