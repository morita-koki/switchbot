import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import CloudIcon from '@mui/icons-material/Cloud'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import NightsStayIcon from '@mui/icons-material/NightsStay'
import UmbrellaIcon from '@mui/icons-material/Umbrella'
import CloudQueueIcon from '@mui/icons-material/CloudQueue'
import { useTheme } from '@mui/material/styles'
import { api } from '../services/api'
import type { ForecastPoint, WeatherForecast } from '../services/api'

interface EnhancedForecastPoint extends ForecastPoint {
  isPast: boolean
  isToday: boolean
  isTomorrow: boolean
  isCurrent: boolean
  hourIndex: number
}

const getWeatherIcon = (
  f: ForecastPoint,
  iconSize: string,
  isPast: boolean
) => {
  const precipitation = f.precipitation_mm ?? 0
  const dt = new Date(f.dt)
  const hour = dt.getHours()
  const isDay = hour >= 6 && hour < 18

  const iconStyle = {
    fontSize: iconSize,
    filter: isPast ? 'grayscale(70%)' : 'none',
    transition: 'filter 0.3s ease',
  }

  // 降水量が1mm以上の場合は雨
  if (precipitation >= 1) {
    return <UmbrellaIcon sx={{ ...iconStyle, color: isPast ? 'inherit' : '#2196F3' }} />
  }

  // 降水量が0.5mm〜1mmの場合は曇りと雨
  if (precipitation >= 0.5) {
    return <CloudQueueIcon sx={{ ...iconStyle, color: isPast ? 'inherit' : '#90A4AE' }} />
  }

  // 降水量が少ない場合は温度と時刻で判定
  const temp = f.temp_c ?? 0

  // 氷点下または5度以下の場合は雪
  if (temp < 5) {
    return <AcUnitIcon sx={{ ...iconStyle, color: isPast ? 'inherit' : '#00BCD4' }} />
  }

  // 天気テキストに基づいて判定
  const weatherText = (f.weather || '').toLowerCase()
  if (weatherText.includes('雨')) {
    return <UmbrellaIcon sx={{ ...iconStyle, color: isPast ? 'inherit' : '#2196F3' }} />
  }
  if (weatherText.includes('曇')) {
    return <CloudIcon sx={{ ...iconStyle, color: isPast ? 'inherit' : '#78909C' }} />
  }

  // 晴れの場合、昼夜で判定
  if (isDay) {
    return <WbSunnyIcon sx={{ ...iconStyle, color: isPast ? 'inherit' : '#FF9500' }} />
  } else {
    return <NightsStayIcon sx={{ ...iconStyle, color: isPast ? 'inherit' : '#FFD700' }} />
  }
}

interface ForecastCellProps {
  forecast: EnhancedForecastPoint
  iconSize: string
  isCompact?: boolean
}

const ForecastCell: React.FC<ForecastCellProps> = ({
  forecast,
  iconSize,
  isCompact = false,
}) => {
  const theme = useTheme()

  const cellWidth = isCompact ? '40px' : '52px'
  const tempFontSize = isCompact ? '0.7rem' : '0.8rem'
  const timeFontSize = isCompact ? '0.6rem' : '0.7rem'

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: cellWidth,
        py: 0.5,
        px: 0.25,
        opacity: forecast.isPast ? 0.4 : 1,
        borderBottom: forecast.isCurrent
          ? `2px solid ${theme.palette.primary.main}`
          : '2px solid transparent',
        transition: 'opacity 0.3s ease',
      }}
    >
      <Typography
        sx={{
          fontSize: timeFontSize,
          color: 'text.secondary',
          fontWeight: forecast.isCurrent ? 700 : 400,
        }}
      >
        {forecast.hourIndex}
      </Typography>
      <Box sx={{ my: 0.25 }}>
        {getWeatherIcon(forecast, iconSize, forecast.isPast)}
      </Box>
      <Typography
        sx={{
          fontSize: tempFontSize,
          fontWeight: 600,
          color: forecast.isPast ? 'text.secondary' : 'text.primary',
        }}
      >
        {forecast.temp_c !== null ? `${Math.round(forecast.temp_c)}°` : '-'}
      </Typography>
    </Box>
  )
}

interface ForecastRowProps {
  forecasts: EnhancedForecastPoint[]
  iconSize: string
  isCompact?: boolean
}

const ForecastRow: React.FC<ForecastRowProps> = ({
  forecasts,
  iconSize,
  isCompact = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        overflowX: 'auto',
        gap: 0.25,
        pb: 0.5,
        '&::-webkit-scrollbar': { height: 4 },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(100, 108, 255, 0.3)',
          borderRadius: 2,
          '&:hover': {
            background: 'rgba(100, 108, 255, 0.5)',
          },
        },
      }}
    >
      {forecasts.map((f, i) => (
        <ForecastCell
          key={i}
          forecast={f}
          iconSize={iconSize}
          isCompact={isCompact}
        />
      ))}
    </Box>
  )
}

const WeatherWidget: React.FC = () => {
  const [forecasts, setForecasts] = useState<EnhancedForecastPoint[]>([])
  const mounted = React.useRef(true)
  const theme = useTheme()

  useEffect(() => {
    mounted.current = true
    const load = async () => {
      try {
        // 48時間分のデータを0時から取得
        const wf: WeatherForecast = await api.getWeatherForecast(48, true)
        if (!mounted.current) return

        const now = new Date()
        const todayStr = now.toDateString()
        const tomorrowDate = new Date(now.getTime() + 86400000)
        const tomorrowStr = tomorrowDate.toDateString()
        const currentHour = now.getHours()

        const enhanced: EnhancedForecastPoint[] = wf.forecasts.map((f) => {
          const dt = new Date(f.dt)
          const forecastDateStr = dt.toDateString()
          const isToday = forecastDateStr === todayStr
          const isTomorrow = forecastDateStr === tomorrowStr
          const forecastHour = dt.getHours()

          return {
            ...f,
            isPast: isToday && forecastHour < currentHour,
            isToday,
            isTomorrow,
            isCurrent: isToday && forecastHour === currentHour,
            hourIndex: forecastHour,
          }
        })

        setForecasts(enhanced)
      } catch (e) {
        console.error('WeatherWidget load error', e)
      }
    }

    load()

    const wTimer = setInterval(() => {
      load()
    }, 1000 * 60 * 15) // 15min

    return () => {
      mounted.current = false
      clearInterval(wTimer)
    }
  }, [])

  const todayForecasts = forecasts.filter((f) => f.isToday)
  const tomorrowForecasts = forecasts.filter((f) => f.isTomorrow)

  if (forecasts.length === 0) {
    return (
      <Box sx={{ py: 1.5 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: theme.palette.text.primary,
          }}
        >
          天気予報
        </Typography>
        <Typography variant="body2" color="text.secondary">
          データを取得中...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ py: 1.5 }}>
      {/* 今日の天気 */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          mb: 1,
          color: theme.palette.text.primary,
        }}
      >
        今日
      </Typography>
      <ForecastRow forecasts={todayForecasts} iconSize="1.75rem" />

      {/* 明日の天気 - より小さく */}
      {tomorrowForecasts.length > 0 && (
        <Box sx={{ mt: 1.5, opacity: 0.85 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              mb: 0.75,
              color: theme.palette.text.secondary,
            }}
          >
            明日
          </Typography>
          <ForecastRow
            forecasts={tomorrowForecasts}
            iconSize="1.25rem"
            isCompact
          />
        </Box>
      )}
    </Box>
  )
}

export default WeatherWidget
