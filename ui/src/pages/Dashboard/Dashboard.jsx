// import CarouselHome from "../../components/CarouselHome";

import WelcomeBanner from "../../components/Home/WelcomeBanner/WelcomeBanner"
import Feature from "../../components/Home/Feature/Features"
import TemplateBanner from "../../components/Home/TemlateBanner"
import bgImage from "../../assets/homebg_3.png"
import firstBanner from "../../assets/firstBanner.png"
import secondBanner from "../../assets/transportation.png"
import thirdBanner from "../../assets/northern_lights.png"

import firstfeatures from "../../assets/map_icon.png"
import secondFeatures from "../../assets/presentation_icon.png"
import thirdFeatures from "../../assets/smartphone_icon.png"
import fourthFeatures from "../../assets/ice_road_icon.png"

import firstpartners from "../../assets/Transport_Canada.png"
import secondPartners from "../../assets/UTSC.png"
import thirdPartners from "../../assets/UBC.png"
import fourthPartners from "../../assets/UofA.png"
import fifthPartners from "../../assets/GNWT.gif"
import sixthPartners from "../../assets/NRC.png"
import seventhPartners from "../../assets/CIRNAC.png"

import Partner from "../../components/Home/Partner"
import Footer from "../../components/Global/Footer"
import FDDChart from "../../components/Chart/FDDChart"
import * as React from "react"
import { LineChart } from "@mui/x-charts/LineChart"
import { Box, Grid2 } from "@mui/material"
import Avatar from "@mui/material/Avatar"
import { Typography } from "@mui/material"
import Divider from "@mui/material/Divider"

import ChangeAvatar from "./ChangeAvatar"
import UserInformation from "./UserInformation"

function Dashboard() {
  return (
    <div>
      <Grid2 container spacing={2}>
        <Grid2
          size={3}
          sx={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "80%", // Slightly larger than Avatar for spacing
                margin: "0 auto",
                borderRadius: "50%", // Ensures circular shape
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)", // Drop shadow effect
                overflow: "hidden", // Prevents overflow of shadow
              }}
            >
              <Avatar
                alt="User Name"
                src="https://i.pravatar.cc/300"
                sx={{ width: "100%", height: "100%", align: "center" }} // Large size
              />
            </Box>
            <Typography align="center" variant="h4" gutterBottom>
              Username
            </Typography>
            <Typography align="center" variant="h5" gutterBottom>
              Role
            </Typography>
          </Box>
        </Grid2>
        <Grid2 size={0.1}>
          <Divider orientation="vertical" />
        </Grid2>
        <Grid2 size={8}>
          <Typography variant="h2">Dashboard</Typography>
          <Divider />
          <Box display="flex" flexDirection="column" alignItems="left">
            <Typography variant="h4">Information</Typography>
            <UserInformation />
          </Box>
          <Divider />
          <Box display="flex" flexDirection="column" alignItems="left">
            <Typography variant="h4">Change Profile Image</Typography>
            <ChangeAvatar />
          </Box>
        </Grid2>
      </Grid2>
    </div>
  )
}

export default Dashboard
