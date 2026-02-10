import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import { useTheme } from '@mui/material/styles'
import { api } from '../services/api'
import type { OutdoorSensorData } from '../services/api'

const HomeStateWidget: React.FC = () => {
  const theme = useTheme()
  const temp = 21
  const hum = 45
  const [outdoorData, setOutdoorData] = useState<OutdoorSensorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOutdoorData = async () => {
      try {
        const data = await api.getOutdoorSensor()
        setOutdoorData(data)
      } catch (error) {
        console.error('Failed to fetch outdoor sensor data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOutdoorData()
    // 5分ごとに更新
    const interval = setInterval(fetchOutdoorData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Box sx={{ py: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: { xs: 3, sm: 5 },
          flexWrap: 'wrap',
        }}
      >
        {/* 室内温度 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ThermostatIcon
              sx={{
                fontSize: '1.25rem',
                color: theme.palette.primary.main,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.palette.text.secondary,
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            >
              室内
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '1.75rem',
              fontWeight: 700,
              lineHeight: 1,
              color: theme.palette.primary.main,
            }}
          >
            {temp}°
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.8rem',
            }}
          >
            {hum}%
          </Typography>
        </Box>

        {/* 室外温度 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ThermostatIcon
              sx={{
                fontSize: '1.25rem',
                color: theme.palette.text.secondary,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.palette.text.secondary,
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            >
              室外
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '1.75rem',
              fontWeight: 700,
              lineHeight: 1,
              color: theme.palette.text.primary,
            }}
          >
            {loading
              ? '---'
              : outdoorData?.temperature !== null && outdoorData?.temperature !== undefined
              ? `${Math.round(outdoorData.temperature)}°`
              : '---'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.8rem',
            }}
          >
            {loading
              ? '...'
              : outdoorData
              ? `${outdoorData.humidity !== null ? Math.round(outdoorData.humidity) : '--'}%`
              : '--'}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default HomeStateWidget
