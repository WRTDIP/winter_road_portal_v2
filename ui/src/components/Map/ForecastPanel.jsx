import { useEffect, useState } from "react"
import { Typography, Skeleton, Alert } from "@mui/material"

/**
 * Maps an Open-Meteo WMO weather code to a label, emoji, and accent color.
 * Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
 */
function describeWeather(code) {
  const map = {
    0: { label: "Clear sky", icon: "☀️", color: "#fbbf24" },
    1: { label: "Mainly clear", icon: "🌤️", color: "#fbbf24" },
    2: { label: "Partly cloudy", icon: "⛅", color: "#94a3b8" },
    3: { label: "Overcast", icon: "☁️", color: "#64748b" },
    45: { label: "Fog", icon: "🌫️", color: "#94a3b8" },
    48: { label: "Rime fog", icon: "🌫️", color: "#94a3b8" },
    51: { label: "Light drizzle", icon: "🌦️", color: "#60a5fa" },
    53: { label: "Drizzle", icon: "🌦️", color: "#60a5fa" },
    55: { label: "Heavy drizzle", icon: "🌧️", color: "#3b82f6" },
    56: { label: "Freezing drizzle", icon: "🌨️", color: "#7dd3fc" },
    57: { label: "Freezing drizzle", icon: "🌨️", color: "#7dd3fc" },
    61: { label: "Light rain", icon: "🌦️", color: "#60a5fa" },
    63: { label: "Rain", icon: "🌧️", color: "#3b82f6" },
    65: { label: "Heavy rain", icon: "🌧️", color: "#1d4ed8" },
    66: { label: "Freezing rain", icon: "🌨️", color: "#7dd3fc" },
    67: { label: "Freezing rain", icon: "🌨️", color: "#7dd3fc" },
    71: { label: "Light snow", icon: "🌨️", color: "#cbd5e1" },
    73: { label: "Snow", icon: "❄️", color: "#94a3b8" },
    75: { label: "Heavy snow", icon: "❄️", color: "#475569" },
    77: { label: "Snow grains", icon: "❄️", color: "#94a3b8" },
    80: { label: "Rain showers", icon: "🌦️", color: "#60a5fa" },
    81: { label: "Rain showers", icon: "🌧️", color: "#3b82f6" },
    82: { label: "Heavy showers", icon: "⛈️", color: "#1d4ed8" },
    85: { label: "Snow showers", icon: "🌨️", color: "#cbd5e1" },
    86: { label: "Heavy snow showers", icon: "❄️", color: "#475569" },
    95: { label: "Thunderstorm", icon: "⛈️", color: "#6366f1" },
    96: { label: "Thunderstorm + hail", icon: "⛈️", color: "#6366f1" },
    99: { label: "Thunderstorm + hail", icon: "⛈️", color: "#6366f1" },
  }
  return map[code] || { label: "—", icon: "🌡️", color: "#94a3b8" }
}

function formatDayLabel(isoDate, index) {
  if (index === 0) return "Today"
  if (index === 1) return "Tomorrow"
  try {
    const d = new Date(isoDate + "T00:00:00")
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
  } catch {
    return isoDate
  }
}

export default function ForecastPanel({ lat, lon }) {
  const [state, setState] = useState({ loading: true, error: null, data: null })

  useEffect(() => {
    if (lat == null || lon == null) {
      setState({ loading: false, error: "Forecast unavailable for this location.", data: null })
      return
    }
    let cancelled = false
    setState({ loading: true, error: null, data: null })

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
      `&timezone=auto&forecast_days=3&temperature_unit=celsius&wind_speed_unit=kmh`

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Network response was not OK")
        return r.json()
      })
      .then((json) => {
        if (cancelled) return
        setState({ loading: false, error: null, data: json })
      })
      .catch((err) => {
        if (cancelled) return
        setState({ loading: false, error: err.message || "Failed to load forecast.", data: null })
      })

    return () => {
      cancelled = true
    }
  }, [lat, lon])

  if (state.loading) {
    return (
      <div className="wrtdip-forecast">
        <div className="wrtdip-forecast__current wrtdip-forecast__current--skeleton">
          <Skeleton variant="circular" width={48} height={48} />
          <div style={{ flex: 1 }}>
            <Skeleton width="40%" height={28} />
            <Skeleton width="60%" height={18} />
          </div>
        </div>
        <div className="wrtdip-forecast__grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="wrtdip-forecast__day">
              <Skeleton width="60%" />
              <Skeleton variant="circular" width={42} height={42} sx={{ my: 1 }} />
              <Skeleton width="80%" />
              <Skeleton width="50%" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (state.error || !state.data) {
    return (
      <Alert severity="info" variant="outlined">
        {state.error || "No forecast data available."}
      </Alert>
    )
  }

  const { current, daily } = state.data
  const currentDesc = current ? describeWeather(current.weather_code) : null

  return (
    <div className="wrtdip-forecast">
      {current && currentDesc && (
        <div
          className="wrtdip-forecast__current"
          style={{ background: `linear-gradient(135deg, ${currentDesc.color}22, #ffffff)` }}
        >
          <div className="wrtdip-forecast__current-icon" aria-hidden="true">
            {currentDesc.icon}
          </div>
          <div className="wrtdip-forecast__current-meta">
            <Typography variant="overline" sx={{ lineHeight: 1, color: "text.secondary" }}>
              Now
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1, color: "#0f172a" }}>
              {Math.round(current.temperature_2m)}°C
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {currentDesc.label} · Wind {Math.round(current.wind_speed_10m)} km/h
            </Typography>
          </div>
        </div>
      )}

      <div className="wrtdip-forecast__grid">
        {daily?.time?.map((iso, i) => {
          const desc = describeWeather(daily.weather_code[i])
          const hi = Math.round(daily.temperature_2m_max[i])
          const lo = Math.round(daily.temperature_2m_min[i])
          const precip = daily.precipitation_sum?.[i]
          const wind = Math.round(daily.wind_speed_10m_max?.[i] ?? 0)
          return (
            <div key={iso} className="wrtdip-forecast__day">
              <div className="wrtdip-forecast__day-name">{formatDayLabel(iso, i)}</div>
              <div
                className="wrtdip-forecast__day-icon"
                style={{ background: `${desc.color}22` }}
                aria-hidden="true"
              >
                <span>{desc.icon}</span>
              </div>
              <div className="wrtdip-forecast__day-label">{desc.label}</div>
              <div className="wrtdip-forecast__temps">
                <span className="wrtdip-forecast__hi">{hi}°</span>
                <span className="wrtdip-forecast__lo">{lo}°</span>
              </div>
              <div className="wrtdip-forecast__meta">
                <span title="Precipitation">💧 {precip != null ? `${precip.toFixed(1)} mm` : "—"}</span>
                <span title="Max wind">🌬️ {wind} km/h</span>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
