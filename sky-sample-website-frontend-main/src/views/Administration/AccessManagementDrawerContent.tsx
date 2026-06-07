import { useEffect, useState } from "react";
import api from "../../utils/api";
import { UserRole } from "../../api/userApi";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import theme from "../../theme";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DrawerContentItem } from "../../components/ViewDataDrawer";
import {
  PermissionKeysObject,
  PermissionSection,
  getDynamicPermissionSections,
} from "./SectionList";
import useIsMobile from "../../customHooks/useIsMobile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

function AccessManagementDrawerContent({
  selectedRole,
}: {
  selectedRole: UserRole;
}) {
  const [systems, setSystems] = useState<any[]>([]);

  useEffect(() => {
    api.get("/systems").then((res) => {
      setSystems(res.data);
    }).catch(console.error);
  }, []);

  const dynamicSections = getDynamicPermissionSections(systems);

  return (
    <Stack spacing={1} sx={{ padding: theme.spacing(1) }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <DrawerContentItem
          label="Name"
          value={selectedRole.userType}
          sx={{ flex: 1 }}
        />
        <DrawerContentItem
          label="Description"
          value={selectedRole?.description}
          sx={{ flex: 1 }}
        />
      </Box>
      <Box sx={{ paddingY: "1rem" }}>
        <Typography variant="subtitle2" sx={{ marginBottom: "1rem" }}>
          User Roles Permission
        </Typography>
        <Alert severity="info">
          Below are the permissions assigned to the selected role.
        </Alert>
      </Box>
      <Stack>
        {dynamicSections.map((permissionSection) => (
          <SectionAccordion
            key={permissionSection.mainSection}
            permissionSection={permissionSection}
            selectedRolePermissions={selectedRole.permissionObject}
          />
        ))}
      </Stack>
    </Stack>
  );
}

const SectionAccordion = ({
  permissionSection,
  selectedRolePermissions,
}: {
  permissionSection: PermissionSection;
  selectedRolePermissions: PermissionKeysObject;
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
              </TableRow>
            </TableHead>
            <TableBody>
              {permissionSection.subSections.map((row) => {
                if ("break" in row) {
                  return (
                    <TableRow key={`break-${row.name}`}>
                      <TableCell
                        colSpan={5}
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
                  return (
                    <TableRow key={`${row.key}`}>
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      {row.permissionsExists.VIEW ? (
                        <TableCell align="center">
                          {selectedRolePermissions[`${row.key}_VIEW`] ? (
                            <CheckCircleIcon
                              fontSize="small"
                              sx={{ color: "var(--pallet-blue)" }}
                            />
                          ) : (
                            <CancelIcon
                              fontSize="small"
                              sx={{ color: "var(--pallet-grey)" }}
                            />
                          )}
                        </TableCell>
                      ) : (
                        <TableCell align="center"></TableCell>
                      )}
                      {row.permissionsExists.CREATE ? (
                        <TableCell align="center">
                          {selectedRolePermissions[`${row.key}_CREATE`] ? (
                            <CheckCircleIcon
                              fontSize="small"
                              sx={{ color: "var(--pallet-blue)" }}
                            />
                          ) : (
                            <CancelIcon
                              fontSize="small"
                              sx={{ color: "var(--pallet-grey)" }}
                            />
                          )}
                        </TableCell>
                      ) : (
                        <TableCell align="center">-</TableCell>
                      )}
                      {row.permissionsExists.EDIT ? (
                        <TableCell align="center">
                          {selectedRolePermissions[`${row.key}_EDIT`] ? (
                            <CheckCircleIcon
                              fontSize="small"
                              sx={{ color: "var(--pallet-blue)" }}
                            />
                          ) : (
                            <CancelIcon
                              fontSize="small"
                              sx={{ color: "var(--pallet-grey)" }}
                            />
                          )}
                        </TableCell>
                      ) : (
                        <TableCell align="center">-</TableCell>
                      )}
                      {row.permissionsExists.DELETE ? (
                        <TableCell align="center">
                          {selectedRolePermissions[`${row.key}_DELETE`] ? (
                            <CheckCircleIcon
                              fontSize="small"
                              sx={{ color: "var(--pallet-blue)" }}
                            />
                          ) : (
                            <CancelIcon
                              fontSize="small"
                              sx={{ color: "var(--pallet-grey)" }}
                            />
                          )}
                        </TableCell>
                      ) : (
                        <TableCell align="center">-</TableCell>
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

export default AccessManagementDrawerContent;
