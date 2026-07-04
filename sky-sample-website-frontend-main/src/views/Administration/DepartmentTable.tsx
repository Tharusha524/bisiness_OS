import { useState } from "react";
import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchDepartmentData, createDepartment } from "../../api/departmentApi";
import queryClient from "../../state/queryClient";

export default function DepartmentTable() {
  const { enqueueSnackbar } = useSnackbar();
  const [newDepartmentName, setNewDepartmentName] = useState("");

  const { data: departments, isFetching } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartmentData,
  });

  const { mutate: createMutation, isPending } = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      enqueueSnackbar("Department Created Successfully!", {
        variant: "success",
      });
      setNewDepartmentName("");
    },
    onError: () => {
      enqueueSnackbar(`Failed to create department`, {
        variant: "error",
      });
    },
  });

  const handleCreate = () => {
    if (!newDepartmentName.trim()) return;
    createMutation(newDepartmentName.trim());
  };

  return (
    <Stack spacing={2} sx={{ width: "100%", maxWidth: 600 }}>
      <Paper elevation={2} sx={{ padding: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="New Department Name"
          variant="outlined"
          size="small"
          fullWidth
          value={newDepartmentName}
          onChange={(e) => setNewDepartmentName(e.target.value)}
        />
        <Button
          variant="contained"
          sx={{ backgroundColor: "var(--pallet-blue)", minWidth: '120px' }}
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={isPending || !newDepartmentName.trim()}
        >
          Add
        </Button>
      </Paper>

      <TableContainer component={Paper} elevation={2}>
        {isFetching && <LinearProgress />}
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Department Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments && departments.length > 0 ? (
              departments.map((dept: any) => (
                <TableRow key={dept.id}>
                  <TableCell>{dept.id}</TableCell>
                  <TableCell>{dept.department}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography variant="body2">No Departments found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
