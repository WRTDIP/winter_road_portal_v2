//Contains all the data required for the map

//Array which stores the index associated with the town in Nunavut when calling the GeoMet API
export const citiesOfNunavut = {
  22: "Alert",
  10: "Arctic Bay",
  20: "Arviat",
  14: "Baker Lake",
  15: "Cambridge Bay",
  17: "Chesterfield",
  18: "Clyde River",
  9: "Coral Harbour",
  19: "Ennadai",
  24: "Gjoa Haven",
  12: "Grise Fiord",
  23: "Igloolik",
  21: "Iqaluit",
  26: "Kimmirut",
  2: "Kinngait",
  13: "Kugaaruk",
  16: "Kugluktuk",
  1: "Nanisivik",
  3: "Naujaat",
  7: "Pangnirtung",
  25: "Pond Inlet",
  5: "Qikiqtarjuaq",
  28: "Rankin Inlet",
  27: "Resolute",
  29: "Sanikiluaq",
  4: "Sanirajak",
  8: "Taloyoak",
  6: "Whale Cove",
}

//Array which stores the index associated with the town in the Northwest Territories when calling the GeoMet API
export const citiesOfNorthwestTerritories = {
  26: "Colville Lake",
  22: "Deline",
  // 1: "Dettah",
  14: "Ekati",
  2: "Enterprise",
  5: "Fort Good Hope",
  29: "Fort Liard",
  10: "Fort McPherson",
  27: "Fort Providence",
  3: "Fort Resolution",
  4: "Fort Simpson",
  17: "Fort Smith",
  18: "Gameti",
  8: "Hay River",
  28: "Indin River",
  30: "Inuvik",
  31: "Lutselke",
  12: "Nahanni Butte",
  21: "Norman Wells",
  16: "Paulatuk",
  19: "Sachs Harbour",
  15: "Sambaa K'e",
  20: "Tuktoyaktuk",
  11: "Tulita",
  7: "Ulukhaktok",
  9: "Wekweeti",
  6: "Whati",
  23: "Wrigley",
  24: "Yellowknife",
}

//Array which stores the index associated with the town in Yukon when calling the GeoMet API
export const citiesOfYukon = {
  15: "Beaver Creek",
  7: "Burwash Landing",
  2: "Carcross",
  17: "Carmacks",
  6: "Dawson",
  4: "Dempster (Highway)",
  12: "Faro",
  5: "Haines Junction",
  1: "Kluane Lake",
  10: "Mayo",
  11: "Old Crow",
  3: "Rancheria",
  9: "Rock River",
  8: "Ross River",
  14: "Teslin",
  13: "Watson Lake",
  16: "Whitehorse",
}

//ArcGIS map layers
export const layerData = [
  // {
  //   title: "Winter Roards NU",
  //   link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Winter_Roads_NU/FeatureServer/0",
  //   popupTemplate: {
  //     title: "{STREET}",
  //   },
  // },
  // {
  //   title: "Winter Roards NWT",
  //   link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Winter_Roads_NWT/FeatureServer/4",
  //   popupTemplate: {
  //     title: "{STREET}",
  //   },
  // },
  // {
  //   title: "Airports YU",
  //   link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/0",
  // },
  {
    title: "Minor Roads",
    link: "https://www.apps.geomatics.gov.nt.ca/arcgis/rest/services/GNWT/Transportation_LCC/MapServer/15",
    popupTemplate: {
      title: "{R_STNAME_C}",
      content: "",
    },
    renderer: {
      type: "simple", // autocasts as new SimpleRenderer()
      symbol: {
        type: "simple-line", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: [0, 255, 255],
        outline: null,
      },
    },
  },
  {
    title: "Major Roads",
    link: "https://www.apps.geomatics.gov.nt.ca/arcgis/rest/services/GNWT/Transportation_LCC/MapServer/14",
    popupTemplate: {
      title: "{R_STNAME_C}",
    },
  },
  {
    title: "Airports - Northwest Territories",
    link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Airports/FeatureServer/0",
    popupTemplate: {
      title: "{Airport_Name}", // Replace with the field name from the layer's attributes
      content: `
      <b>Airport Code:</b> {Airport_Code}<br>
      <b>Elevation (m):</b> {Elevation}<br>
      <b>Runway 1 Type:</b> {Runway_1_Type}<br>
      <b>Runway 1 Length (m):</b> {Length_1}<br>
      <b>Runway 2 Type:</b> {Runway_2_Type}<br>
      <b>Runway 2 Length (m):</b> {Length_2}
    `
    },
    visible: false // Set to false if you want the layer to be hidden initially
  },
  {
    title: "Airports - Yukon",
    link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Airports/FeatureServer/1",
    popupTemplate: {
      title: "{Airport_Name}",
      content: `
        <b>Airport Code:</b> {Airport_Code}<br>
        <b>Elevation (m):</b> {Elevation}<br>
        <b>Runway 1 Type:</b> {Runway_1_Type}<br>
        <b>Runway 1 Length (m):</b> {Length_1}<br>
        <b>Runway 2 Type:</b> {Runway_2_Type}<br>
        <b>Runway 2 Length (m):</b> {Length_2}
      `
    },
    visible: false
  },
  {
    title: "Airports - Nunavut",
    link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Airports/FeatureServer/2",
    popupTemplate: {
      title: "{Airport_Name}",
      content: `
        <b>Airport Code:</b> {Airport_Code}<br>
        <b>Elevation (m):</b> {Elevation}<br>
        <b>Runway 1 Type:</b> {Runway_1_Type}<br>
        <b>Runway 1 Length (m):</b> {Length_1}<br>
        <b>Runway 2 Type:</b> {Runway_2_Type}<br>
        <b>Runway 2 Length (m):</b> {Length_2}
      `
    },
    visible: false
  },
  {
    title: "Ferries - Northwest Territories",
    link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Ferries_and_Ice_Crossings_v1/FeatureServer/0",
    popupTemplate: {
      title: "{Name}",
    },
    visible: false
  },
  {
    title: "Ferries - Yukon",
    link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Ferries_and_Ice_Crossings_v1/FeatureServer/7",
    popupTemplate: {
      title: "{Name}",
    },
    visible: false
  },
  {
    title: "Ice Crossings - Northwest Territories",
    link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Ferries_and_Ice_Crossings_v1/FeatureServer/5",
    popupTemplate: {
      title: "{Street}",
      content: `
        <b>Community:</b> {Community}<br>
        <b>Length (m):</b> {Length}<br>
      `
    },
    visible: false
  },
  {
    title: "Ice Crossings - Yukon",
    link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Ferries_and_Ice_Crossings_v1/FeatureServer/1",
    popupTemplate: {
      title: "{Street_Name}",
      content: `
        <b>Community:</b> {Community}<br>
        <b>Length (m):</b> {Length}<br>
      `
    },
    visible: false
  },
  {
    title: "Winter Roads - Northwest Territories",
    link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Winter_Roads_v1/FeatureServer/4",
    popupTemplate: {
      title: "{STREET}",
      content: `
        <b>Category:</b> {Category}<br>
        <b>Length (km):</b> {Length}<br>
      `
    },
    visible: true
  },
  {
    title: "Winter Roads - Nunavut",
    link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Winter_Roads_v1/FeatureServer/1",
    popupTemplate: {
      title: "{STREET}",
      content: `
        <b>Category:</b> {Category}<br>
        <b>Length (km):</b> {Length}<br>
      `
    },
    visible: true
  },
  {
    title: "Proposed Roads - Northwest Territories",
    link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Proposed_Roads_v1/FeatureServer/5",
    popupTemplate: {
      title: "{Street_Name}",
      content: `
        <b>Category:</b> {Category}<br>
      `
    },
    visible: false
  },
    // {
    // title: "Communities YU",
    // link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/7",
  // },
  // {
    // title: "Health Care NU",
    // link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/13",
  // },  
  // {
    // title: "Communities NU",
    // link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/15",
  // },
  // {
    // title: "Communities NWT",
    // link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/19",
  // },
  // {
    // title: "Airports",
    // link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Airports/FeatureServer",
  // },
  // {
    // title: "Ice Roads NWT",
    // link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/22",
  // },
  // {
    // title: "Ports Communitites NWT",
    // link: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/28",
  // },
  
  //"https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/2",
  // "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/3",
  // "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/4",
  //"https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/5",
  //"https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/6",
  // "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/8",
  // "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/9",
  // "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/10",
  // "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/11",
  // "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/12",
  //"https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/16",
  // "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/17",
  // "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/18",
  //"https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/23",
  // "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/24",
  // "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/25",
  // "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/26",
  // "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/VLi_Web_Map_WFL1/FeatureServer/27",
]

//Coordinates of all the towns in NW. The indices are refer to the indices in the above NW array.
export const northWestCoordinates = {
  // 1: [62.4112, -114.3084],
  2: [60.5547, -116.1472],
  3: [61.170988, -113.672053],
  4: [61.8609, -121.3527],
  5: [66.257, -128.6377],
  7: [70.7366, -117.772],
  8: [60.8097, -115.7898],
  9: [64.1892, -114.1861],
  10: [67.4354, -134.8824],
  11: [64.9006, -125.5763],
  12: [61.0356, -123.3832],
  15: [60.4426, -121.2424],
  16: [69.350251, -124.069001],
  17: [60.0053, -111.8829],
  18: [64.1129, -117.3525],
  19: [71.9867, -125.2505],
  20: [69.4509, -133.0358],
  21: [65.2811, -126.8316],
  22: [65.1888889, -123.4225],
  23: [63.2268, -123.4667],
  24: [62.47536, -114.37],
  26: [67.0399, -126.0912],
  27: [61.3552, -117.6542],
  28: [64.2835797, -115.0680437],
  29: [60.2392, -123.4752],
  30: [68.3609, -133.7297],
}

//Coordinates of all the towns in Nunavut. The indices are refer to the indices in the above Nunavut array.
export const nunavutCoordinates = {
  1: [73.033333, -84.55],
  2: [64.2333, -76.5417],
  3: [66.533333, -86.25],
  4: [68.7903, -81.2375],
  5: [67.554722, -64.028056],
  6: [62.170833, -92.577778],
  7: [66.144444, -65.715278],
  8: [69.536111, -93.520833],
  9: [64.133333, -83.166667],
  10: [73.033333, -85.166667],
  12: [76.416667, -82.895833],
  13: [68.534722, -89.825],
  14: [64.319444, -96.020833],
  15: [69.113889, -105.05278],
  16: [67.826667, -115.09333],
  17: [63.338889, -90.701389],
  18: [70.4680556, -68.5944444],
  19: [60.966667, -101.33333],
  20: [61.108333, -94.058333],
  21: [63.75, -68.516667],
  22: [82.5, -62.366667],
  23: [69.383333, -81.8],
  24: [68.625, -95.877778],
  25: [72.7, -77.9611],
  26: [62.8466666, -69.8719444],
  27: [74.695833, -94.829167],
  28: [62.816667, -92.083333],
  29: [56.533333, -79.233333],
}

//Coordinates of all the towns in Yukon. The indices are refer to the indices in the above Yukon array.
export const yukonCoordinates = {
  1: [61.2639299, -138.7444599],
  2: [60.1658333, -134.7058333],
  3: [60, -129.8],
  5: [60.7536111, -137.5108333],
  6: [64.06, -139.431944],
  7: [61.3561111, -138.99],
  8: [61.9802778, -132.4505556],
  9: [60.1123089, -127.1167729],
  10: [63.5925, -135.8977778],
  11: [67.5686111, -139.8352778],
  12: [62.2263889, -133.3558333],
  13: [60.0624374, -128.7068575],
  14: [60.1672222, -132.7216666],
  15: [62.3827778, -140.8797222],
  16: [60.7242144, -135.0560981],
  17: [62.0911111, -136.2969444],
}

export const layerNames = [
  "Ports in Northwest Territories",
  "NRN Road Segments",
  "Ice Roads in Northwest Territories",
  "Airports in Northwest Territories",
  "Communities in Northwest Territories",
  "Roadways in Nunavut",
  "Airports in Nunavut",
  "Healthcare in Nunavut",
  "Communities in Yukon",
  "Wilderness Tourism Trails",
  "Nation Heritage Routes",
  "Water 2M",
  "Ice Crossing YT",
  "Airports YT",
]
