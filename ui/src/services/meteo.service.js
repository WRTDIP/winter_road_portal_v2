/**
 * Gets climate information for a city
 * @param {String} cityKey
 * @return {Object} Containing observations, forecasts, and more
 */
  // export const getClimateCity = async (cityKey) => {
    // return await fetch(
      // `https://weather.gc.ca/api/app/en/Location/${cityKey}?type=city`
    // ).then((r) => r.json())
 // }

 /**
 * Gets climate information for a city
 * @param {String} province Two-letter province code, e.g. 'NT'
 * @param {String} stationCode City station code, e.g. 's0000654'
 * @return {Object} Containing observations, forecasts, and more
 */
export const getClimateCity = async (province, stationCode) => {
  console.log("Fetching with province:", province, "stationCode:", stationCode);
  return await fetch(
    `https://dd.weather.gc.ca/citypage_weather/json/${province}/${stationCode}_e.json`
  ).then((r) => r.json())
}