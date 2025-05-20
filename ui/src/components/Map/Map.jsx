import { useEffect, useRef, useState } from "react"

import { Modal } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import { loadModules } from "esri-loader"
import "./styles.css"
import {
  citiesOfNorthwestTerritories,
  citiesOfNunavut,
  citiesOfYukon,
  layerData,
  northWestCoordinates,
  nunavutCoordinates,
  yukonCoordinates,
} from "./Data.js"
import { width } from "@fortawesome/free-regular-svg-icons/faAddressBook"
import { getClimateCity } from "../../services/meteo.service.js"
import { cities } from "../../utils/constants.js"
import { LineChart } from "@mui/x-charts/LineChart"
import { Icon, Typography } from "@mui/material"
import OpenInFullIcon from "@mui/icons-material/OpenInFull"
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen"
import IconButton from "@mui/material/IconButton"
var ChartDataFDD = {
  Yellowknife: {
    x: [
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991,
      1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003,
      2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
      2016, 2017, 2018, 2019,
    ],
    y: [
      3020.1, 3698.9, 3813.2, 3020.9, 3876.9, 3519.6, 2878.3, 2986.0, 3634.2,
      3676.8, 3800.3, 3595.2, 2818.7, 3604.5, 3073.3, 3634.5, 3467.6, 2745.5,
      2553.0, 2823.2, 3101.2, 3513.6, 3164.4, 3299.7, 3354.8, 2274.1, 3081.9,
      3547.2, 3391.7, 2582.8, 3356.4, 2839.3, 3671.3, 3738.0, 3274.7, 2830.6,
      2937.2, 3249.5, 2970.5, 3474.1,
    ],
  },
  Whitehorse: {
    x: [
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991,
      1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003,
      2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
      2016, 2017, 2018, 2019,
    ],
    y: [
      1625.7,
      2529.7,
      2068.4,
      1719.0,
      1917.3,
      1928.6,
      1446.8,
      1462.1,
      2230.9,
      null,
      2284.3,
      1589.5,
      1909.4,
      1779.2,
      2092.6,
      2548.5,
      2407.8,
      1568.3,
      2197.0,
      1523.2,
      1439.2,
      null,
      null,
      1860.8,
      null,
      null,
      2205.8,
      1962.3,
      2351.9,
      1346.3,
      2023.2,
      1541.5,
      2187.7,
      1834.4,
      null,
      1076.9,
      null,
      2054.4,
      1496.5,
      1784.2,
    ],
  },
  Iqaluit: {
    x: [
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991,
      1992, 1993, 1994, 1995, 1996, 1997, 1999, 2000, 2001, 2002, 2003, 2004,
      2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
      2017, 2018, 2019,
    ],
    y: [
      3130.5,
      3621.0,
      4563.7,
      4537.1,
      3762.1,
      3259.5,
      4544.7,
      3805.7,
      4302.5,
      4201.5,
      4382.5,
      4237.9,
      4736.4,
      4177.4,
      3745.6,
      3358.2,
      3701.3,
      null,
      3689.1,
      3344.9,
      3877.3,
      3552.0,
      3498.5,
      3462.6,
      3158.2,
      3267.6,
      3957.2,
      3787.4,
      2942.2,
      2862.6,
      3551.8,
      3131.4,
      3724.4,
      4122.0,
      3703.7,
      null,
      3373.4,
      3553.6,
      null,
    ],
  },
  Dawson: {
    x: [
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991,
      1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003,
      2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
      2016, 2017, 2018, 2019,
    ],
    y: [
      2864.3,
      3681.2,
      3529.4,
      3280.7,
      3355.9,
      3316.8,
      3253.5,
      2895.6,
      3727.9,
      3581.6,
      3651.4,
      3214.8,
      3346.7,
      3239.3,
      3326.8,
      3845.5,
      4067.5,
      2886.1,
      3435.3,
      2914.4,
      2642.4,
      3335.8,
      2314.0,
      3478.7,
      3115.8,
      3068.6,
      3852.3,
      3235.0,
      null,
      2705.4,
      3466.1,
      3161.6,
      4026.2,
      3327.8,
      2734.4,
      2114.5,
      3493.2,
      3285.4,
      2748.4,
      3473.8,
    ],
  },
  Mayo: {
    x: [
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1989, 1990, 1991, 1992,
      1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004,
      2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
      2017, 2018, 2019,
    ],
    y: [
      2411.2,
      3462.2,
      2868.3,
      2836.6,
      2837.2,
      2690.4,
      2508.3,
      2139.2,
      3014.4,
      3233.5,
      2491.4,
      2704.6,
      2790.6,
      null,
      null,
      3221.7,
      2165.0,
      2797.4,
      2268.5,
      2183.9,
      2830.6,
      1972.3,
      2801.7,
      2594.7,
      2322.3,
      3191.1,
      2666.9,
      3252.2,
      2060.8,
      2900.0,
      2424.0,
      3330.8,
      2904.6,
      2352.5,
      1685.6,
      2866.0,
      3013.8,
      null,
      3073.6,
    ],
  },
  Carmacks: {
    x: [
      1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992,
      1994, 1995, 1996, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006,
      2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018,
      2019,
    ],
    y: [
      null,
      3004.8,
      2639.0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      1894.5,
      null,
      2288.2,
      null,
      3236.4,
      2841.4,
      3178.4,
      2220.2,
      2863.6,
      2576.0,
      3260.5,
      2677.8,
      2232.3,
      1836.7,
      2781.6,
      2814.4,
      2276.2,
      2858.0,
    ],
  },
  Faro: {
    x: [
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991,
      1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2002, 2003, 2004,
      2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
      2017, 2018, 2019,
    ],
    y: [
      2319.9,
      3360.6,
      2769.9,
      2491.1,
      2613.3,
      2510.0,
      2198.9,
      1969.4,
      2904.9,
      null,
      2721.2,
      2190.4,
      null,
      2448.0,
      2589.9,
      3220.4,
      3039.4,
      2210.5,
      2691.6,
      2041.1,
      null,
      null,
      null,
      null,
      2165.0,
      2841.3,
      null,
      2952.7,
      null,
      2691.9,
      null,
      null,
      2623.9,
      null,
      1675.5,
      2539.8,
      2834.7,
      2252.0,
      2742.3,
    ],
  },
  Teslin: {
    x: [
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991,
      1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003,
      2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
      2016, 2017, 2018, 2019,
    ],
    y: [
      null,
      null,
      null,
      null,
      2076.2,
      2051.1,
      1713.7,
      1591.0,
      2334.0,
      2029.5,
      2420.6,
      1764.0,
      2263.5,
      1802.9,
      null,
      2647.9,
      null,
      1664.1,
      2270.6,
      1654.5,
      1759.5,
      2220.3,
      1671.5,
      1897.9,
      1767.1,
      1846.0,
      2321.2,
      2227.6,
      2399.0,
      1710.6,
      2318.3,
      1759.1,
      2359.8,
      2163.9,
      1533.5,
      1297.9,
      1998.0,
      2225.5,
      1699.9,
      1864.8,
    ],
  },
  "Watson Lake": {
    x: [
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991,
      1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003,
      2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
      2016, 2017, 2018, 2019,
    ],
    y: [
      2409.6,
      3259.4,
      2890.7,
      2470.6,
      2844.4,
      2670.7,
      2479.2,
      2180.6,
      2913.1,
      2587.2,
      2900.8,
      2535.8,
      2925.6,
      null,
      2424.5,
      3127.7,
      3167.2,
      2521.4,
      2816.7,
      2355.1,
      2369.3,
      2938.5,
      2305.5,
      2395.0,
      2266.9,
      2325.8,
      2707.4,
      2670.6,
      2948.2,
      2538.6,
      2627.0,
      2265.6,
      2811.6,
      2639.6,
      2139.9,
      2082.8,
      2563.0,
      null,
      2346.6,
      2451.1,
    ],
  },
  "Fort Mcpherson": {
    x: [
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991,
      1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003,
      2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013,
    ],
    y: [
      null,
      null,
      null,
      null,
      null,
      null,
      4195.6,
      null,
      3924.2,
      null,
      null,
      4385.3,
      3659.1,
      4024.4,
      4074.5,
      4191.7,
      null,
      3689.9,
      null,
      4223.5,
      null,
      3897.0,
      3569.2,
      4242.1,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
  },
  "Fort Good Hope": {
    x: [
      1980, 1981, 1982, 1983, 1984, 1986, 1987, 1988, 1989, 1990, 1991, 1992,
      1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004,
      2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
      2017, 2018, 2019,
    ],
    y: [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      3912.2,
      3977.4,
      4202.1,
      4279.5,
      3643.1,
      3913.4,
      3912.3,
      3690.4,
      3868.2,
      3381.7,
      3940.7,
      null,
      3718.8,
      3930.8,
      3995.6,
      4062.7,
      3348.8,
      null,
      null,
      4160.2,
      3515.6,
      3412.7,
      null,
      3364.8,
      3079.7,
      null,
      3955.1,
    ],
  },
  "Fort Simpson": {
    x: [
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991,
      1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003,
      2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
      2016, 2017, 2018, 2019,
    ],
    y: [
      2686.6,
      3572.7,
      3573.3,
      3060.2,
      3261.9,
      3196.2,
      2712.8,
      2712.8,
      3253.9,
      3263.2,
      3256.4,
      3163.5,
      2585.5,
      3141.9,
      2995.8,
      3349.2,
      3146.2,
      2644.0,
      2577.6,
      2774.2,
      2790.6,
      3228.4,
      2703.2,
      3009.1,
      2952.9,
      2520.4,
      2926.3,
      3182.2,
      3198.1,
      2554.5,
      2971.2,
      2695.4,
      null,
      3157.3,
      2881.6,
      2445.3,
      2696.0,
      null,
      2482.1,
      3214.2,
    ],
  },
  "Fort Liard": {
    x: [
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991,
      1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003,
      2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
      2016, 2017, 2018, 2019,
    ],
    y: [
      2253.3,
      null,
      null,
      2653.2,
      null,
      2679.3,
      2144.0,
      2278.3,
      null,
      2793.0,
      2806.6,
      2621.4,
      2261.4,
      2497.6,
      2730.8,
      2949.2,
      2735.3,
      2490.7,
      2533.2,
      2202.8,
      2253.8,
      2831.8,
      null,
      null,
      null,
      null,
      2592.7,
      2832.3,
      2288.0,
      2580.7,
      2182.4,
      2932.6,
      2468.9,
      2279.4,
      1812.1,
      2352.5,
      null,
      2214.4,
      null,
    ],
  },
  "Hay River": {
    x: [
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991,
      1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003,
      2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
      2016, 2017, 2018, 2019,
    ],
    y: [
      2450.0,
      3201.7,
      3354.7,
      2635.2,
      3169.0,
      2932.8,
      2351.4,
      2423.2,
      2996.4,
      3044.1,
      3156.9,
      2910.2,
      2280.6,
      3130.4,
      2663.9,
      3157.9,
      3012.5,
      2259.6,
      2251.5,
      2276.6,
      2467.7,
      2925.5,
      2521.0,
      2719.6,
      2716.9,
      1931.1,
      2696.0,
      2967.3,
      2891.9,
      2196.5,
      2827.6,
      2396.8,
      3192.5,
      3129.6,
      2680.8,
      2220.2,
      2414.3,
      null,
      2346.5,
      2921.7,
    ],
  },
  "Fort Smith": {
    x: [
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991,
      1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003,
      2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
      2016, 2017, 2018, 2019,
    ],
    y: [
      2392.6,
      3264.8,
      3016.7,
      2526.4,
      3210.7,
      2848.2,
      2305.8,
      2382.0,
      3010.8,
      3034.7,
      3103.6,
      2800.1,
      2245.6,
      2913.3,
      2480.0,
      3098.9,
      2888.6,
      2057.8,
      2044.0,
      2231.4,
      2389.7,
      2802.2,
      2662.7,
      2568.6,
      2629.8,
      1672.9,
      2597.0,
      2877.0,
      2797.8,
      2069.5,
      2731.5,
      2238.2,
      3007.1,
      3254.2,
      2668.7,
      null,
      2261.6,
      2717.9,
      2486.7,
      2714.6,
    ],
  },
}

function WeatherMap() {
  // References for DOM elements and data
  const weatherData = useRef(null)
  const MapElement = useRef(null)
  const [territory, setTerritory] = useState(null)
  const [key, setKey] = useState(null)
  const [mouse, setMouse] = useState({})
  
  // These two states are created for province and stationCode
  const [climateData, setClimateData] = useState(null)
  const [climateLoading, setClimateLoading] = useState(false)

  // State to control modal visibility
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [modalEnlarge, setModalEnlarge] = useState(false)

  /**
   * Effect hook to load data when component mounts.
   */
  useEffect(() => {
    loadData(weatherData, MapElement)
  }, [])

  useEffect(() => {
    console.log("Print Mouse", mouse)
  }, [mouse])

  /**
   * Function to close the modal.
   */
  function closeModal() {
    setModalEnlarge(false)
    setModalIsOpen(false)
    setClimateData(null) // Clear climate forecast data when closing
  }

  /**
   * Function to open enlarged modal
   */
  function enlargeModal() {
    setModalEnlarge(true)
  }

  function getCityName() {
    let cityName = null
    if (territory == "yt") {
      cityName = citiesOfYukon[key]
    }
    if (territory == "nt") {
      cityName = citiesOfNorthwestTerritories[key]
    }
    if (territory == "nu") {
      cityName = citiesOfNunavut[key]
    }
    return cityName
  }

  function generateChart() {
    let cityName = getCityName()
    let fddData = ChartDataFDD[cityName] || null
    console.log("fddData", fddData, cityName)
    if (fddData) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            marginRight: 5,
            fontWeight: "normal",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          Freezing Degree Days (FDDs)
        </div>
        <LineChart
          xAxis={[
            {
              data: fddData.x,
              valueFormatter: (year) => year.toString(), // remove thousand separator
              label: "Year", // <-- X axis label
              // data: [1],
            },
          ]}
           yAxis={[
          {
            
          },
          ]}
          series={[
            {
              data: fddData.y,
              // data: [2],
            },
          ]}
          height={300}
          margin={{ left: 40, right: 20, top: 20, bottom: 40 }} //
        />
        </div>
      )
    } else {
      return <Typography>No FDDs data available for this location.</Typography>
    }
  }

  // Get coordinates for the selected city by lat and lon
  let lat = null, lon = null;
  if (territory === "yt" && yukonCoordinates[key]) {
    lat = yukonCoordinates[key][0];
    lon = yukonCoordinates[key][1];
  } else if (territory === "nt" && northWestCoordinates[key]) {
    lat = northWestCoordinates[key][0];
    lon = northWestCoordinates[key][1];
  } else if (territory === "nu" && nunavutCoordinates[key]) {
    lat = nunavutCoordinates[key][0];
    lon = nunavutCoordinates[key][1];
  }

  return (
    <div style={{ height: "84vh", border: "none" }} ref={MapElement}>
      <div id="legend-container"></div>
      <div id="layer-list-container"></div>
      <Modal
        show={modalIsOpen}
        onHide={closeModal}
        // dialogClassName="right-half-modal"
        style={
          modalEnlarge
            ? {
                width: "50vw",
                height: "100vh",
                overflow: "hidden",
                position: "absolute",
                left: "calc(100% - 500px)",
              }
            : {
                width: "600px",
                height: "500px",
                overflow: "hidden",
                position: "absolute",
                top: mouse.y,
                left: mouse.x,
              }
        }
      >
        <Modal.Header
          closeButton
          style={{
            width: "500px",
            overflow: "hidden",
          }}
        >
          <Modal.Title> Climate</Modal.Title>
          <IconButton onClick={() => setModalEnlarge(!modalEnlarge)}>
            {modalEnlarge ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
          </IconButton>
        </Modal.Header>
        <Modal.Body
          sx={{ width: "500px", height: "350px", overflow: "hidden" }}
        >
          <Typography variant="h4" component="h5">
            {territory == "yt" ? citiesOfYukon[key] : null}
            {territory == "nt" ? citiesOfNorthwestTerritories[key] : null}
            {territory == "nu" ? citiesOfNunavut[key] : null}
          </Typography>
          <Typography variant="h5" component="h5">
            Freezing Degree Days (FDDs)
          </Typography>
          <div style={{ paddingLeft: 40, paddingRight: 10 }}>
          {generateChart()}
          </div>
          <Typography variant="h5" style={{ marginTop: 16 }}>
          Weather Forecast 
          </Typography>
          <iframe
            title="Environment Canada Weather"
            width="400x"
            height="400px"
            // src={`https://weather.gc.ca/wxlink/wxlink.html?cityCode=${territory}-${key}&amp;lang=e`}
            src={`https://weather.gc.ca/wxlink/wxlink.html?coords=${lat},${lon}&lang=e`} // new link
            allowtransparency="true"
            style={{ border: 0 }}
          ></iframe>

        {/* REMOVE THIS BLOCK:
        <Typography variant="h5" style={{ marginTop: 16 }}>
          Weather Forecast 2
        </Typography>
        
        <iframe // try to use iframe to appear the weather forecast wedgit
        title="Environment Canada Weather"
        width="400"
        height="400"
        src={`https://weather.gc.ca/wxlink/wxlink.html?cityCode=${territory}-${key}&lang=e`}
        allowtransparency="true"
        />
        */}

        {/* REMOVE THIS BLOCK:
        {climateLoading ? (
          <Typography>Loading weather forecast data...</Typography>
        ) : climateData && climateData.error ? (
            <Typography color="error">{climateData.error}</Typography>
        ) : climateData ? (
          <pre style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 8 }}>
            {JSON.stringify(climateData, null, 2)}
          </pre>
        ) : (
          <Typography>No weather forecast data loaded.</Typography>
        )}
        */}

        </Modal.Body>
      </Modal>
    </div>
  )
  /**
   * Function to load map data using ArcGIS API.
   * @param {object} weatherData - Reference to weather data.
   * @param {object} MapElement - Reference to map container element.
   * @param {string} mapType - Type of map (e.g., "arcgis-topographic").
   */

  async function loadData(
    weatherData,
    MapElement,
    mapType = "arcgis-topographic"
  ) {
    loadModules(
      [
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/layers/ImageryLayer",
        "esri/layers/ImageryTileLayer",
        "esri/layers/GraphicsLayer",
        "esri/Map",
        "esri/config",
        "esri/identity/IdentityManager",
        "esri/Graphic",
        "esri/widgets/Popup",
        "esri/PopupTemplate",
        "esri/widgets/LayerList",
        "esri/widgets/Legend",
        "esri/widgets/Expand",
        "esri/widgets/Zoom",
        "esri/widgets/Zoom/ZoomViewModel",
        "esri/portal/Portal",
        "esri/identity/OAuthInfo",
        "esri/layers/MapImageLayer",
      ],
      {
        css: true,
      }
    ).then(
      async ([
        MapView,
        FeatureLayer,
        ImageryLayer,
        ImageryTileLayer,
        GraphicsLayer,
        Map,
        esriConfig,
        esriId,
        Graphic,
        Popup,
        PopupTemplate,
        LayerList,
        Legend,
        Expand,
        Zoom,
        ZoomViewModel,
        Portal,
        OAuthInfo,
        MapImageLayer,
      ]) => {
        // esriConfig.apiKey =
        //   "AAPKd7da5e4a967540cfb66765bf918280a4t9Et4goGp4RqyeGZkQfG9yVBkkmOC1j35X1YLmsZ1nqucmvVp0j2nXbwF5wP3XRw"

         console.log("Get Climate City", getClimateCity("ON-1"))

        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.register("service-worker.js")
        }

        const map = new Map({ basemap: "streets-vector" })
        const view = new MapView({
          container: MapElement.current,
          map: map,
          center: [-110, 65.5], // Adjust longitude and latitude as needed
          zoom: 4.5,
          popupEnabled: true,
        })

        // //Map Image Layer
        // let mapImageLayer = new MapImageLayer({
        //   url: "https://www.apps.geomatics.gov.nt.ca/arcgis/rest/services/GNWT/Transportation_LCC/MapServer",
        //   popupTemplate: {
        //     title: "{L_STNAME_C}",
        //   },
        // })
        // mapImageLayer.title = "Transportation"
        // map.add(mapImageLayer)

        // Modis
        const imageryLayer = new ImageryLayer({
          url: "https://modis.arcgis.com/arcgis/rest/services/MODIS/ImageServer",
          useViewTime: false,
          timeExtent: {
            start: new Date("2024/05/16 09:00:00 UTC"),
            end: new Date("2024/05/17 09:00:00 UTC"),
          },
          format: "jpgpng",
        })
        imageryLayer.title = "MODIS"
        imageryLayer.visible = false
        map.add(imageryLayer)

        //Create Popup Template

  // Create layer list and legend widgets
  // Reorder layers in the desired order
  const orderedLayerTitles = [
    "Major Roads",
    "Minor Roads",
    "Airports - Northwest Territories",
    "Airports - Yukon",
    "Airports - Nunavut",
    "Winter Roads - Northwest Territories",
    "Winter Roads - Nunavut",
    "Ice Crossings - Northwest Territories",
    "Ice Crossings - Yukon",
    "Ferries - Northwest Territories",
    "Ferries - Yukon",
    "Proposed Roads - Northwest Territories",
    ];

  // Sort layerData based on the desired order
  // Use slice() to create a shallow copy of layerData
  const orderedLayerData = layerData.slice().sort((a, b) => {
    return (
      orderedLayerTitles.indexOf(a.title) - orderedLayerTitles.indexOf(b.title)
    );
  });

  // Debugging: Log the sorted layer data
  console.log("Ordered Layer Data:", orderedLayerData.map((layer) => layer.title));

  // Add feature layers in reverse order so the first is on top in the Layer List
  [...orderedLayerData].reverse().forEach((layer) => {
   console.log(`Adding layer: ${layer.title}`); // Debugging
    const featureLayer = new FeatureLayer({
      url: layer.link,
      popupTemplate: layer.popupTemplate,
      visible: layer.visible, // Apply the visible property from layerData
    });

  // Set renderer if it exists
  if (layer.renderer) {
    featureLayer.renderer = layer.renderer;
  }

  featureLayer.title = layer.title;
  map.add(featureLayer);
  });

  // Create Layer List widget
  const layerList = new LayerList({
    view,
    container: "layer-list-container",
    listItemCreatedFunction: (event) => {
    const item = event.item;
    console.log(`Layer in Layer List: ${item.layer.title}`); // Debugging

    // Customize layer titles if needed
      if (item.layer.title.includes("Airports")) {
        item.title = item.layer.title; // Keep the original title or customize it
      } else if (item.layer.title.includes("Winter Roads")) {
        item.title = item.layer.title; // Keep the original title or customize it
      } else if (item.layer.title.includes("Ferries") || item.layer.title.includes("Ice Crossings")) {
        item.title = item.layer.title; // Keep the original title or customize it
      }
    },
  });


 
        const legend = new Legend({ 
          view, 
          container: "legend-container" })

        // Add expand widgets for layer list and legend
        const layerListExpand = new Expand({
          content: layerList.domNode,
          view,
          expanded: false,
          expandIconClass: "custom-layerlist-icon",
        })
        const legendExpand = new Expand({
          content: legend.domNode,
          view,
          expanded: true,
          expandIconClass: "custom-legend-icon",
        })

        // Add custom zoom button
        const customZoomButton = document.createElement("div")
        customZoomButton.innerHTML = "🏠"
        customZoomButton.title = "Default"
        customZoomButton.classList.add(
          "esri-widget",
          "esri-widget--button",
          "esri-widget--icon",
          "esri-zoom__custom-button"
        )

        customZoomButton.addEventListener("click", () => {
          view.goTo({ center: [-110, 65.5], zoom: 4.5 })
        })

        view.ui.add(customZoomButton, "top-left")

        /**
         * Creates a graphic representing a city on the map. Also contains a click event that triggers a modal when that city is clicked
         * @param {number[]} coordinates - Array containing latitude and longitude of the city.
         * @param {string} color - Color of the marker representing the city.
         * @param {GraphicsLayer} layer - Graphics layer where the city graphic will be added.
         */
        async function createCityGraphic(coordinates, color, layer) {
          const pinCoordinates = {
            type: "point",
            longitude: coordinates[1],
            latitude: coordinates[0],
          }

          // Set marker style based on the layer (default marker style by ArcGIS API)
          let markerStyle = {
            type: "simple-marker",
            color: color,
            size: "5px",
          };

          // For the Climate Data, use the style below
          if (layer.title === "Weather and Climate Data") {
            markerStyle = {
              type: "simple-marker",
              color: "blue", // Change to your desired color
              size: "10px", // Change to your desired size
              outline: {
                color: "white",
                width: 1,
              },
            };
          }

          // For the Weather Forecast, use the style below
          if (layer.title === "Weather Forecast") {
            markerStyle = {
              type: "simple-marker",
              color: "orange", // Change to your desired color
              size: "10px",    // Change to your desired size
              outline: {
                color: "white",
                width: 1,
              },
            };
          }



          let newPointGraphic = new Graphic({
            symbol: markerStyle,
            geometry: pinCoordinates,
            attributes: {
              cityName: "City Name",
              weatherDetails: "Weather Details",
            },
          });
          layer.add(newPointGraphic);             
           
          //click event that triggers when a point on the map is clicked and checks to see if the point clicked contains any point located in the three territories
          view.on("click", (event) => {
            let uniqueKey = -1,
              territory = null
            const clickedPoint = event.mapPoint
            const latitude = clickedPoint.latitude,
              longitude = clickedPoint.longitude

            setMouse({ x: event.x, y: event.y })
            // Checks if area clicked is a point located at a lat/long point in yukonCoordinates
            Object.keys(yukonCoordinates).every((yukonKey) => {
              if (
                isWithinRange(
                  yukonCoordinates[yukonKey][1],
                  longitude - 0.07,
                  longitude + 0.07
                ) &&
                isWithinRange(
                  yukonCoordinates[yukonKey][0],
                  latitude - 0.07,
                  latitude + 0.07
                )
              ) {
                uniqueKey = yukonKey
                territory = "yt"
                let city = cities.find(
                  (c) => c.name_e == citiesOfYukon[uniqueKey]
                )
                console.log("Selected city:", city); //added for the province and stationCode
                if (city) {
                  // console.log(getClimateCity(city.key))
                  console.log(getClimateCity(city.province, city.stationCode))
                }
                //added for the province and stationCode
                if (city && city.province && city.stationCode) {
                  setClimateLoading(true)
                  setClimateData(null)
                  getClimateCity(city.province, city.stationCode) //added the province and station code to constants.js (only for Yukon as a test)
                    .then((data) => setClimateData(data))
                    .finally(() => setClimateLoading(false))
                } else if (city) {
                  setClimateData({ error: "No weather data available for this location." })
                  setClimateLoading(false)
                }               
                return false
              }
              return true
            })

            // Checks if area clicked is a point located at a lat/long point in northWestCoordinates
            Object.keys(northWestCoordinates).every((northKey) => {
              if (northKey === 1 || northKey === 24) {
                if (
                  isWithinRange(
                    northWestCoordinates[northKey][1],
                    longitude - 0.01,
                    longitude + 0.01
                  ) &&
                  isWithinRange(
                    northWestCoordinates[northKey][0],
                    latitude - 0.01,
                    latitude + 0.01
                  )
                ) {
                  uniqueKey = northKey
                  territory = "nt"
                  return false
                }
              } else if (
                isWithinRange(
                  northWestCoordinates[northKey][1],
                  longitude - 0.07,
                  longitude + 0.07
                ) &&
                isWithinRange(
                  northWestCoordinates[northKey][0],
                  latitude - 0.07,
                  latitude + 0.07
                )
              ) {
                uniqueKey = northKey
                territory = "nt"
                return false
              }
              return true
            })

            // Checks if area clicked is a point located at a lat/long point in nunavutCoordinates
            Object.keys(nunavutCoordinates).every((nunavutKey) => {
              if (
                isWithinRange(
                  nunavutCoordinates[nunavutKey][1],
                  longitude - 0.07,
                  longitude + 0.07
                ) &&
                isWithinRange(
                  nunavutCoordinates[nunavutKey][0],
                  latitude - 0.07,
                  latitude + 0.07
                )
              ) {
                uniqueKey = nunavutKey
                territory = "nu"
                return false
              }
              return true
            })
            setKey((prevKey) => uniqueKey)
            setTerritory((prevTerritory) => territory)
            setModalIsOpen(true)
            if (territory == null) {
              setModalIsOpen(false)
            }
          })
        }

        //Adds the feature layers from the ArcGIS web map. Certain layers are hidden via the featureLayer.visible parameter
      //  layerData.forEach((layer, index) => {
      //    const featureLayer = new FeatureLayer({
      //      url: layer.link,
      //      popupTemplate: layer.popupTemplate,
      //      visible: layer.visible, // Apply the visible property from layerData
      //    })

          //Set renderer
      //    if (layer.renderer) {
     //       featureLayer.renderer = layer.renderer
      //    }

          // Set visibility for specific indices
      //    if (index === 0 || index === 4 || index === 7) {
      //      featureLayer.visible = false
      //    }

      //    featureLayer.title = layer.title

          // featureLayer.featureReduction = {
          //   type: "cluster",
          // };

      //    map.add(featureLayer)
      //  })

        view.ui.add(layerListExpand, "top-left")
        view.ui.add(legendExpand, "top-right")

        //adds the live weather data from the GeoMet API for towns in the three territories
        const liveWeatherDataLayer = new GraphicsLayer({
          title: "Weather and Climate Data",
          featureReduction: {
            type: "cluster",
          },
        })

        Object.keys(yukonCoordinates).forEach((key) => {
          createCityGraphic(yukonCoordinates[key], "blue", liveWeatherDataLayer)
        })
        Object.keys(northWestCoordinates).forEach((key) => {
          createCityGraphic(northWestCoordinates[key], "blue", liveWeatherDataLayer)
        })
        Object.keys(nunavutCoordinates).forEach((key) => {
          createCityGraphic(nunavutCoordinates[key], "blue", liveWeatherDataLayer)
        })
        map.add(liveWeatherDataLayer)

        // Create a new GraphicsLayer for the weather forecast
        const weatherForecastLayer = new GraphicsLayer({
          title: "Weather Forecast",
          featureReduction: {
            type: "cluster",
          },
          visible: false,
        })
                
        // Add Weather Forecast markers to the Weather Forecast layer
        Object.keys(yukonCoordinates).forEach((key) => {
          createCityGraphic(yukonCoordinates[key], "green", weatherForecastLayer)
        })
        Object.keys(northWestCoordinates).forEach((key) => {
          createCityGraphic(northWestCoordinates[key], "green", weatherForecastLayer)
        })
        Object.keys(nunavutCoordinates).forEach((key) => {
          createCityGraphic(nunavutCoordinates[key], "green", weatherForecastLayer)
        })
        
        map.add(weatherForecastLayer);      
        
      }
    )
  }

  function isWithinRange(number, min, max) {
    return number >= min && number <= max
  }
}

export default WeatherMap
