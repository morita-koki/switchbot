import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Switch from '@mui/material/Switch'
import MenuIcon from '@mui/icons-material/Menu'
import Tooltip from '@mui/material/Tooltip'

type MenuItem = {
  label: string
  to?: string
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  isToggle?: boolean
  checked?: boolean
  onToggle?: (checked: boolean) => void
}

interface Props {
  items?: MenuItem[]
  children?: React.ReactNode
}

const CardMenu: React.FC<Props> = ({ items, children }) => {
  const defaultItems: MenuItem[] = [
    { label: '詳細を見る', to: '/statistics' },
    { label: '設定', to: '/settings' },
    { label: '非表示', onClick: () => {} },
  ]

  const menuItems = items ?? defaultItems
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }
  const handleClose = () => setAnchorEl(null)

  return (
    <div>
      <Tooltip title="メニュー">
        <IconButton
          aria-label="メニュー"
          aria-controls={open ? 'card-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleOpen}
        >
          {children ? children : <MenuIcon />}
        </IconButton>
      </Tooltip>

      <Menu
        id="card-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'card-menu-button' }}
      >
        {menuItems.map((it, i) => (
          <MenuItem
            key={i}
            disabled={it.disabled}
            onClick={() => {
              if (it.to) {
                // let Link handle navigation
              } else if (it.onClick && !it.disabled) {
                it.onClick()
              }
              // toggles handled by the Switch onChange
              handleClose()
            }}
            component={it.to ? Link : 'div'}
            to={it.to}
          >
            {it.icon && <ListItemIcon>{it.icon}</ListItemIcon>}
            <ListItemText>{it.label}</ListItemText>
            {it.isToggle && (
              <Switch
                edge="end"
                checked={!!it.checked}
                onChange={(e) => it.onToggle && it.onToggle(e.target.checked)}
                inputProps={{ 'aria-label': it.label }}
              />
            )}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}

export default CardMenu
