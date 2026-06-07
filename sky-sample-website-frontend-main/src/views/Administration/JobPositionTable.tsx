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
import { fetchJobPositionData, createJobPosition } from "../../api/jobPositionApi";
import queryClient from "../../state/queryClient";

export default function JobPositionTable() {
  const { enqueueSnackbar } = useSnackbar();
  const [newJobPositionName, setNewJobPositionName] = useState("");

  const { data: jobPositions, isFetching } = useQuery({
    queryKey: ["jobPositions"],
    queryFn: fetchJobPositionData,
  });

  const { mutate: createMutation, isPending } = useMutation({
    mutationFn: createJobPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobPositions"] });
      enqueueSnackbar("Job Position Created Successfully!", {
        variant: "success",
      });
      setNewJobPositionName("");
    },
    onError: () => {
      enqueueSnackbar(`Failed to create job position`, {
        variant: "error",
      });
    },
  });

  const handleCreate = () => {
    if (!newJobPositionName.trim()) return;
    createMutation(newJobPositionName.trim());
  };

  return (
    <Stack spacing={2} sx={{ width: "100%", maxWidth: 600 }}>
      <Paper elevation={2} sx={{ padding: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="New Job Position Name"
          variant="outlined"
          size="small"
          fullWidth
          value={newJobPositionName}
          onChange={(e) => setNewJobPositionName(e.target.value)}
        />
        <Button
          variant="contained"
          sx={{ backgroundColor: "var(--pallet-blue)", minWidth: '120px' }}
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={isPending || !newJobPositionName.trim()}
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
              <TableCell>Job Position Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobPositions && jobPositions.length > 0 ? (
              jobPositions.map((jp: any) => (
                <TableRow key={jp.id}>
                  <TableCell>{jp.id}</TableCell>
                  <TableCell>{jp.jobPosition}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography variant="body2">No Job Positions found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
