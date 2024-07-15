import { loadModules } from "esri-loader";
import { useEffect, useRef } from "react";
import {
  citiesOfNunavut,
  citiesOfNorthwestTerritories,
  citiesOfYukon,
  mapLinks,
  northWestCoordinates,
  nunavutCoordinates,
  yukonCoordinates
} from "./Data";

export default async function loadData(weatherData,MapElement, territoryCode, keyCode, modalIsOpen) {
  
  loadModules(
    [
      "esri/views/MapView",
      "esri/layers/FeatureLayer",
      "esri/layers/GraphicsLayer",
      "esri/Map",
      "esri/config",
      "esri/Graphic",
      "esri/widgets/Popup",
      "esri/PopupTemplate",
    ],
    {
      css: true,
    }
  ).then(([MapView, FeatureLayer, GraphicsLayer, Map, esriConfig, Graphic, Popup, PopupTemplate]) => {
    esriConfig.apiKey =
      "AAPK523b3670e87d4504aa86c87ef22885f8B2U9Y_GAGwSmQV3HOq8d7NqRWn09tIR1BIMKvA6lf3581mq2wW2RuKOxPy75ccle";
    const map = new Map({ basemap: "arcgis-topographic" });
    const view = new MapView({
      container: MapElement.current,
      map: map,
      center: [-110, 68.027],
      zoom: 4.5,
    });
    
    async function createCityGraphic(coordinates, color, layer) {
      const pinCoordinates = {
        type: "point",
        longitude: coordinates[1],
        latitude: coordinates[0],
      };

      let newPointGraphic = new Graphic({
        symbol: {
          type: "simple-marker",
          color: color,
          size: "5px",
        },
        geometry: pinCoordinates,
        attributes: {
          cityName: "City Name",
          weatherDetails: "Weather Details",
        },
      });
      liveWeatherDataLayer.add(newPointGraphic);

      view.on("click", (event) => {
        const clickedPoint = event.mapPoint;
        const latitude = clickedPoint.latitude,
        longitude = clickedPoint.longitude;
        Object.keys(yukonCoordinates).forEach((key) => {
        if (
            isWithinRange(
            yukonCoordinates[key][1],
            longitude - 2,
            longitude + 2
            ) &&
            isWithinRange(
            yukonCoordinates[key][0],
            latitude - 2,
            latitude + 2
            )
        ) {
          territoryCode = "yt";
          keyCode = 45;
          modalIsOpen = true;
        }

        });

        Object.keys(northWestCoordinates).forEach((key) => {
          if (
            isWithinRange(
              northWestCoordinates[key][1],
              longitude - 2,
              longitude + 2
            ) &&
            isWithinRange(northWestCoordinates[key][0], latitude - 2, latitude + 2)
          ) {
            territoryCode = "nw";
            keyCode = 45;
          modalIsOpen = true;

          }
        });

        Object.keys(nunavutCoordinates).forEach((key) => {
          if (
            isWithinRange(
              nunavutCoordinates[key][1],
              longitude - 2,
              longitude + 2
            ) &&
            isWithinRange(nunavutCoordinates[key][0], latitude - 2, latitude + 2)
          ) {
            territoryCode = "nu";
            keyCode = 45;
            modalIsOpen = true;
            
          }
        });
      });

    }

    

    // mapLinks.map((link) => {
    //   const featureLayer = new FeatureLayer(
    //     {url: link} , // Specify the URL of the feature layer
    //   );
    //   map.add(featureLayer);
    //   }
    // );
    
    //SWOB Realtime data

    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);
    let url = `https://api.weather.gc.ca/collections/swob-realtime/items?&f=json`;
     fetch(url)
      .then((response) => response.json())
      .then((data) => {
        let snowDepth, airTemp, relativeHumidity, avgWindSpeed, retrievedTime, lastUpdatedTime;
        let newPointGraphic;
        weatherData.current = data.features;
         const popupTemplate = new PopupTemplate({
           title: "Station X",
           content: "<b>Air Temperature:</b> {airTemperature}",
         });
        weatherData.current.forEach((item) => {
          let coordinates = {
            type: "point",
            longitude: item.geometry.coordinates[0],
            latitude: item.geometry.coordinates[1],
          };
        if(coordinates.latitude > 60){
            newPointGraphic = new Graphic({
              symbol: {
                type: "simple-marker",
                color: "red",
                size: "5px",
              },
              geometry: coordinates,
              attributes: {
                name: "New Point",
                type: "Sample",
              },
              popupTemplate: popupTemplate,
            });

            graphicsLayer.add(newPointGraphic);
        }
        
    });
    // view.popup = new Popup({ view: view });
    // view.on("click", (event) => {
    //     const clickedPoint = event.mapPoint;
    //     const latitude = clickedPoint.latitude,
    //     longitude = clickedPoint.longitude;
    //     weatherData.current.forEach((item) => {
    //     if (
    //         isWithinRange(
    //         item.geometry.coordinates[0],
    //         longitude - 2,
    //         longitude + 2
    //         ) &&
    //         isWithinRange(
    //         item.geometry.coordinates[1],
    //         latitude - 2,
    //         latitude + 2
    //         )
    //     ) {
    //         snowDepth = item.properties.snw_dpth;
    //         airTemp = item.properties.air_temp;
    //         relativeHumidity = item.properties.rel_hum;
    //         avgWindSpeed = item.properties.avg_wnd_spd_10m_pst1hr;
    //         retrievedTime = new Date(item.properties["date_tm-value"]);
    //         lastUpdatedTime = retrievedTime.toLocaleString();
    //         newPointGraphic.popupTemplate.title = `Weather Details at ${
    //         item.properties["stn_nam-value"]}`;
    //         newPointGraphic.popupTemplate.content = `<b>Snow Depth:</b> ${snowDepth}cm <br> <br>
    //                                                 <b>Air Temperature:</b> ${airTemp} °C <br><br>
    //                                                 <b>Relative Humidity:</b> ${relativeHumidity}% <br><br>
    //                                                 <b>Average Wind Speed:</b> ${avgWindSpeed} km/h <br><br>
    //                                                 <b>Last Updated:</b> ${lastUpdatedTime}<br><br> `;
    //     }
    //     });
    // });
    });

    const liveWeatherDataLayer = new GraphicsLayer();
    map.add(liveWeatherDataLayer);

    Object.keys(yukonCoordinates).forEach((key)=>{
      createCityGraphic(yukonCoordinates[key], "blue", liveWeatherDataLayer);
    });

    Object.keys(northWestCoordinates).forEach((key) => {
      createCityGraphic(northWestCoordinates[key], "blue", liveWeatherDataLayer);
    });
    Object.keys(nunavutCoordinates).forEach((key) => {
      createCityGraphic(nunavutCoordinates[key], "blue", liveWeatherDataLayer);
    });

    

      

});
}

function isWithinRange(number, min, max) {
return number >= min && number <= max;
}

