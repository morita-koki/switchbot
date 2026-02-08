import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { useTheme } from '@mui/material/styles'
import { api } from '../services/api'
import type { CalendarEvent } from '../services/api'

const CalendarWidget: React.FC = () => {
  const theme = useTheme()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mounted = React.useRef(true)

  useEffect(() => {
    mounted.current = true

    const loadCalendar = async () => {
      try {
        setLoading(true)
        setError(null)
        const calendar = await api.getTodayCalendar()
        if (!mounted.current) return
        setEvents(calendar.events)
      } catch (e) {
        console.error('Calendar load error', e)
        if (mounted.current) {
          setError('カレンダーを読み込めませんでした')
        }
      } finally {
        if (mounted.current) {
          setLoading(false)
        }
      }
    }

    loadCalendar()

    // 15分ごとにポーリング（天気予報と同じパターン）
    const timer = setInterval(() => {
      api.getTodayCalendar()
        .then(calendar => {
          if (mounted.current) setEvents(calendar.events)
        })
        .catch(() => {})
    }, 1000 * 60 * 15) // 15分

    return () => {
      mounted.current = false
      clearInterval(timer)
    }
  }, [])

  // Loading状態
  if (loading) {
    return (
      <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  // エラー状態
  if (error) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}
        >
          今日の予定
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  // 予定なし
  if (events.length === 0) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          今日の予定
        </Typography>
        <Typography color="text.secondary">
          今日の予定はありません
        </Typography>
      </Box>
    )
  }

  // 予定表示
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
        今日の予定
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {events.map((event) => (
          <Box
            key={event.id}
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 3,
              borderLeft: `4px solid ${event.calendar_color || '#039BE5'}`,
              paddingLeft: 2,
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '1.5rem',
                color: theme.palette.text.secondary,
                minWidth: '80px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {event.is_all_day ? '終日' : event.start_time}
            </Typography>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: '1.125rem',
                    color: theme.palette.text.primary,
                  }}
                >
                  {event.summary}
                </Typography>
                {event.calendar_name && (
                  <Typography
                    variant="caption"
                    sx={{
                      backgroundColor: event.calendar_color || '#039BE5',
                      color: '#fff',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    {event.calendar_name}
                  </Typography>
                )}
              </Box>
              {event.location && (
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {event.location}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default CalendarWidget
