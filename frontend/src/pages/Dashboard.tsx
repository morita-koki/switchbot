import './Dashboard.css'
import WeatherWidget from '../components/WeatherWidget'
import HomeStateWidget from '../components/HomeStateWidget'
import CalendarWidget from '../components/CalendarWidget'
import DeviceControlWidget from '../components/DeviceControlWidget'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'

function Dashboard() {
  return (
    <Container maxWidth="xl" sx={{ py: 1.5, px: { xs: 1, sm: 2, md: 3 } }} className="dashboard">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 240px' },
          gap: { xs: 0, md: 3 },
        }}
      >
        {/* 左カラム: メインコンテンツ */}
        <Box>
          <Fade in timeout={800}>
            <Box sx={{ px: { xs: 1.5, sm: 2, md: 0 } }}>
              <HomeStateWidget />
            </Box>
          </Fade>

          <Fade in timeout={1000}>
            <Box
              sx={{
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                px: { xs: 1.5, sm: 2, md: 0 },
              }}
            >
              <WeatherWidget />
            </Box>
          </Fade>

          <Fade in timeout={1200}>
            <Box
              sx={{
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                px: { xs: 1.5, sm: 2, md: 0 },
              }}
            >
              <CalendarWidget />
            </Box>
          </Fade>
        </Box>

        {/* 右カラム: デバイス制御 */}
        <Fade in timeout={1000}>
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
              pl: 2,
            }}
          >
            <DeviceControlWidget />
          </Box>
        </Fade>
      </Box>

      {/* モバイル用: デバイス制御を下部に表示 */}
      <Fade in timeout={1400}>
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            px: { xs: 1.5, sm: 2 },
            mt: 1,
          }}
        >
          <DeviceControlWidget />
        </Box>
      </Fade>
    </Container>
  )
}

export default Dashboard
