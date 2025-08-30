import * as React from "react"
import { Box, Grid2 } from "@mui/material"
import Avatar from "@mui/material/Avatar"
import { Typography, Button } from "@mui/material"
import {
  DataGrid,
  GridColDef,
  renderActionsCell,
  renderBooleanCell,
} from "@mui/x-data-grid"
import Paper from "@mui/material/Paper"
import { Chip } from "@mui/material"

import { Divider } from "@mui/material"
import ChangeAvatar from "./ChangeAvatar"
import EditIcon from "@mui/icons-material/Edit"
import { IconButton } from "@mui/material"

const columns = [
  { field: "name", headerName: "Name", flex: 1 },
  {
    field: "value",
    headerName: "Value",
    flex: 1,
    renderCell: (params) => params.value,
  },
  {
    field: "edit",
    headerName: "Edit",
    renderCell: (params) =>
      params.row.canEdit ? ( // Check if editing is allowed
        <IconButton color="primary" onClick={() => handleEdit(params.row)}>
          <EditIcon />
        </IconButton>
      ) : null,
  },
]

const handleEdit = (row) => {
  alert(`Editing ${row.name}`)
}

const rows = [
  { id: 1, name: "Name", value: "Mohammad Rahman", canEdit: true },
  {
    id: 2,
    name: "Email",
    value: "mohammadk.rahman@mail.utoronto.ca",
    canEdit: true,
  },
  { id: 3, name: "Utorid", value: "rahma706", canEdit: true },
  { id: 4, name: "Acount Created", value: "2024-01-01" },
  { id: 5, name: "Last Joined", value: "2025-01-25 5:00PM" },
  {
    id: 6,
    name: "Roles",
    value: <Chip color="success" label="Admin"></Chip>,
  },
]

function UserInformation() {
  return (
    <Paper>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        sx={{
          "& .MuiDataGrid-columnHeaders": { display: "none" }, // Hide header
          "& .MuiDataGrid-virtualScroller": { marginTop: "0px !important" }, // Fix alignment
          "& .MuiDataGrid-virtualScroller": { overflow: "hidden" },
        }}
        hideFooter
      />
    </Paper>
    // <Box>
    //   <Typography>Name: {"Mohammad Rahman"}</Typography>
    //   <Typography>Email: {"mohammadk.rahman@mail.utoronot.ca"}</Typography>
    //   <Typography>Utorid: {"rahma706"}</Typography>
    //   <Typography>Acount Created: {"2024-01-01"}</Typography>
    //   <Typography>Last Joined: {"2025-01-25 5:00PM"}</Typography>
    //   <Typography>Role: {placeholder}</Typography>
    // </Box>
  )
}

export default UserInformation
