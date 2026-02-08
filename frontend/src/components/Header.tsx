import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CardMenu from './CardMenu'
import { IconStats, IconSettings, IconSun, IconMoon, IconHamburger, IconDevices } from './icons'

interface HeaderProps {
  theme: 'light' | 'dark'
  onThemeToggle: (isDark: boolean) => void
}

function Header({ theme, onThemeToggle }: HeaderProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: 'blur(12px)',
        backgroundColor: (theme) => theme.palette.mode === 'dark'
          ? 'rgba(26, 26, 26, 0.8)'
          : 'rgba(245, 245, 245, 0.8)',
        boxShadow: (theme) => theme.palette.mode === 'dark'
          ? '0 1px 3px rgba(0, 0, 0, 0.2)'
          : '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          SwitchBot Dashboard
        </Typography>

        <Box>
          <CardMenu
            items={[
              { label: 'デバイス', to: '/devices', icon: <IconDevices /> },
              { label: '統計', to: '/statistics', icon: <IconStats /> },
              { label: '設定', to: '/settings', icon: <IconSettings /> },
              {
                label: 'ダーク',
                isToggle: true,
                checked: theme === 'dark',
                onToggle: onThemeToggle,
                icon: theme === 'dark' ? <IconMoon /> : <IconSun />,
              },
            ]}
          >
            <IconHamburger />
          </CardMenu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
