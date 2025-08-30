import { useState } from "react"
import { Avatar, Button, IconButton, Stack } from "@mui/material"
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"

const ChangeAvatar = () => {
  const [avatar, setAvatar] = useState(null)

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      const imageUrl = URL.createObjectURL(file)
      setAvatar(imageUrl)
    }
  }

  return (
    <Stack spacing={2} alignItems="center">
      <Avatar
        src={avatar || "https://via.placeholder.com/150"}
        sx={{ width: 100, height: 100 }}
      />

      <Button
        variant="contained"
        component="label"
        startIcon={<PhotoCameraIcon />}
      >
        Change Avatar
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleAvatarChange}
        />
      </Button>

      {/* Optional: Icon Button for Quick Change */}
      <IconButton color="primary" component="label">
        <PhotoCameraIcon />
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleAvatarChange}
        />
      </IconButton>
    </Stack>
  )
}

export default ChangeAvatar
