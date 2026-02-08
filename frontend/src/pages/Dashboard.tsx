import './Dashboard.css'
import WeatherWidget from '../components/WeatherWidget'
import HomeStateWidget from '../components/HomeStateWidget'
import CalendarWidget from '../components/CalendarWidget'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'

function Dashboard() {
  return (
    <Container maxWidth="xl" sx={{ py: 2, px: { xs: 1, sm: 2, md: 3 } }} className="dashboard">
      <Fade in timeout={800}>
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <HomeStateWidget />
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Box
          sx={{
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <WeatherWidget />
        </Box>
      </Fade>

      <Fade in timeout={1200}>
        <Box
          sx={{
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <CalendarWidget />
        </Box>
      </Fade>
    </Container>
  )
}

export default Dashboard
