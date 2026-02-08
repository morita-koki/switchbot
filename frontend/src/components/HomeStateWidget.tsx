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
    <Box sx={{ py: 3 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 3,
          color: theme.palette.text.primary,
        }}
      >
        現在の室温
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
          },
          gap: 4,
        }}
      >
        {/* 室内温度 */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
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
              }}
            >
              室内
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '3rem',
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
              mt: 1,
              color: theme.palette.text.secondary,
            }}
          >
            湿度 {hum}%
          </Typography>
        </Box>

        {/* 室外温度 */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
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
              }}
            >
              室外
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '3rem',
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
              mt: 1,
              color: theme.palette.text.secondary,
            }}
          >
            {loading
              ? '読み込み中...'
              : outdoorData
              ? `湿度 ${outdoorData.humidity !== null ? Math.round(outdoorData.humidity) : '--'}%`
              : 'センサー未設定'}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default HomeStateWidget
