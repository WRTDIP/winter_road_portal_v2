/**
 * Gets climate information for a city
 * @param {String} cityKey
 * @return {Object} Containing observations, forecasts, and more
 */
 export const getClimateCity = async (cityKey) => {
   return await fetch(
     `https://weather.gc.ca/api/app/en/Location/${cityKey}?type=city`
   ).then((r) => r.json())
}
