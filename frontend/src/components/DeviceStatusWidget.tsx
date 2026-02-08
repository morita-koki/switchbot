import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import DevicesIcon from '@mui/icons-material/Devices'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { useTheme } from '@mui/material/styles'

const DeviceStatusWidget: React.FC = () => {
  const theme = useTheme()
  const online = 3
  const last = '2 分前'

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(97, 218, 251, 0.2)' : 'rgba(97, 218, 251, 0.15)',
            }}
          >
            <DevicesIcon sx={{ fontSize: '1.5rem', color: theme.palette.secondary.main }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            デバイス状態
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircleIcon sx={{ fontSize: '1.25rem', color: '#4caf50' }} />
            <Typography variant="body2" color="text.secondary">
              オンライン:
            </Typography>
            <Chip
              label={`${online}台`}
              size="small"
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.15)',
                color: '#4caf50',
                fontWeight: 600,
              }}
            />
          </Box>

          <Box
            sx={{
              mt: 1,
              pt: 1.5,
              borderTop: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <AccessTimeIcon sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
            <Typography variant="caption" color="text.secondary">
              最後の更新: {last}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default DeviceStatusWidget
