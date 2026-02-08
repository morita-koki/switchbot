import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import CloudIcon from '@mui/icons-material/Cloud'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import NightsStayIcon from '@mui/icons-material/NightsStay'
import UmbrellaIcon from '@mui/icons-material/Umbrella'
import CloudQueueIcon from '@mui/icons-material/CloudQueue'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import { api } from '../services/api'
import type { ForecastPoint, WeatherForecast } from '../services/api'

const ColorlibConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: 'transparent',
    borderRadius: 1,
  },
}))

interface ColorlibStepIconProps {
  icon: React.ReactNode
  active?: boolean
  completed?: boolean
}

const ColorlibStepIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(
  ({ ownerState }) => ({
    backgroundColor: 'transparent',
    zIndex: 1,
    width: 50,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    ...(ownerState.active && {
      transform: 'scale(1.15)',
    }),
  }),
)

function ColorlibStepIcon(props: ColorlibStepIconProps) {
  const { active, icon } = props

  return (
    <ColorlibStepIconRoot ownerState={{ active }}>
      {icon}
    </ColorlibStepIconRoot>
  )
}

const WeatherWidget: React.FC = () => {
  const [forecast, setForecast] = useState<ForecastPoint[]>([])
  const mounted = React.useRef(true)
  const theme = useTheme()

  useEffect(() => {
    mounted.current = true
    const load = async () => {
      try {
        const wf: WeatherForecast = await api.getWeatherForecast(24)
        if (!mounted.current) return
        setForecast(wf.forecasts)
      } catch (e) {
        // ignore errors for now
        console.error('WeatherWidget load error', e)
      }
    }

    load()

    const wTimer = setInterval(() => {
      api.getWeatherForecast(24).then(wf => setForecast(wf.forecasts)).catch(() => {})
    }, 1000 * 60 * 15) // 15min

    return () => {
      mounted.current = false
      clearInterval(wTimer)
    }
  }, [])

  // render a horizontal, scrollable stepper for the bottom half
  const renderTimeline = () => {
    if (!forecast || forecast.length === 0) {
      return <div className="muted">天気データを取得中…</div>
    }

    const getWeatherIcon = (f: ForecastPoint) => {
      const precipitation = f.precipitation_mm ?? 0
      const dt = new Date(f.dt)
      const hour = dt.getHours()
      const isDay = hour >= 6 && hour < 18

      // 降水量が1mm以上の場合は雨
      if (precipitation >= 1) {
        return <UmbrellaIcon sx={{ fontSize: '3rem', color: '#2196F3' }} />
      }

      // 降水量が0.5mm〜1mmの場合は曇りと雨
      if (precipitation >= 0.5) {
        return (
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloudQueueIcon sx={{ fontSize: '3rem', color: '#90A4AE' }} />
          </Box>
        )
      }

      // 降水量が少ない場合は温度と時刻で判定
      const temp = f.temp_c ?? 0

      // 氷点下または5度以下の場合は雪
      if (temp < 5) {
        return <AcUnitIcon sx={{ fontSize: '3rem', color: '#00BCD4' }} />
      }

      // 天気テキストに基づいて判定
      const weatherText = (f.weather || '').toLowerCase()
      if (weatherText.includes('雨')) {
        return <UmbrellaIcon sx={{ fontSize: '3rem', color: '#2196F3' }} />
      }
      if (weatherText.includes('曇')) {
        return <CloudIcon sx={{ fontSize: '3rem', color: '#78909C' }} />
      }

      // 晴れの場合、昼夜で判定
      if (isDay) {
        return <WbSunnyIcon sx={{ fontSize: '3rem', color: '#FF9500' }} />
      } else {
        return <NightsStayIcon sx={{ fontSize: '3rem', color: '#FFD700' }} />
      }
    }

    // Find the current time index for active step
    const now = new Date().getTime()
    let activeStep = 0
    for (let i = 0; i < forecast.length; i++) {
      const forecastTime = new Date(forecast[i].dt).getTime()
      if (now >= forecastTime) {
        activeStep = i
      } else {
        break
      }
    }

    return (
      <Box
        sx={{
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: 6,
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.1)',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(100, 108, 255, 0.3)',
            borderRadius: 3,
            '&:hover': {
              background: 'rgba(100, 108, 255, 0.5)',
            },
          },
        }}
      >
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<ColorlibConnector />}
          sx={{
            minWidth: 'max-content',
            justifyContent: 'center',
            py: 2,
          }}
        >
          {/* 実際の天気予報データ */}
          {forecast.map((f, i) => {
            const t = f.temp_c
            const label = f.label && f.label.trim() ? f.label : new Date(f.dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

            return (
              <Step key={i}>
                <StepLabel
                  StepIconComponent={(props) => (
                    <ColorlibStepIcon {...props} icon={getWeatherIcon(f)} />
                  )}
                  sx={{
                    '& .MuiStepLabel-label': {
                      mt: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                    },
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    {t === null ? '—' : `${t.toFixed(1)}°C`}
                  </Typography>
                </StepLabel>
              </Step>
            )
          })}
        </Stepper>
      </Box>
    )
  }

  return (
    <Box sx={{ py: 3 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 3,
          color: theme.palette.text.primary,
        }}
      >
        今日の天気
      </Typography>

      {renderTimeline()}
    </Box>
  )
}

export default WeatherWidget
