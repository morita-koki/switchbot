import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import VerticalShadesIcon from '@mui/icons-material/VerticalShades'
import VerticalShadesClosedIcon from '@mui/icons-material/VerticalShadesClosed'
import { useTheme } from '@mui/material/styles'
import { api } from '../services/api'

interface ControllableDevice {
  device_id: string
  name: string
  type: string
  isOn: boolean
  isLoading: boolean
  isInfrared: boolean
}

// 物理デバイスの照明タイプ
const PHYSICAL_LIGHT_TYPES = ['Color Bulb', 'Strip Light', 'Ceiling Light']
// 赤外線リモコンの照明タイプ
const IR_LIGHT_TYPES = ['Light', 'DIY Light']
// エアコンタイプ
const AC_TYPES = ['Air Conditioner', 'DIY Air Conditioner']
// カーテンタイプ
const CURTAIN_TYPES = ['Curtain', 'Curtain3', 'Blind Tilt']

const isLightDevice = (type: string) =>
  PHYSICAL_LIGHT_TYPES.includes(type) || IR_LIGHT_TYPES.includes(type)
const isACDevice = (type: string) => AC_TYPES.includes(type)
const isCurtainDevice = (type: string) => CURTAIN_TYPES.includes(type)
const isControllable = (type: string) =>
  isLightDevice(type) || isACDevice(type) || isCurtainDevice(type)

const DeviceControlWidget: React.FC = () => {
  const theme = useTheme()
  const [devices, setDevices] = useState<ControllableDevice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // SwitchBot APIから全デバイスを取得（赤外線リモコン含む）
        const response = await api.getAllDevices()
        const controllable: ControllableDevice[] = []

        // 物理デバイス
        if (response.body?.deviceList) {
          for (const d of response.body.deviceList) {
            if (isControllable(d.deviceType)) {
              // カーテンがグループ化されている場合、マスターのみ表示
              if (isCurtainDevice(d.deviceType) && d.group && !d.master) {
                continue
              }
              controllable.push({
                device_id: d.deviceId,
                name: d.deviceName,
                type: d.deviceType,
                isOn: false,
                isLoading: false,
                isInfrared: false,
              })
            }
          }
        }

        // 赤外線リモコンデバイス
        if (response.body?.infraredRemoteList) {
          for (const d of response.body.infraredRemoteList) {
            if (isControllable(d.remoteType || d.deviceType)) {
              controllable.push({
                device_id: d.deviceId,
                name: d.deviceName,
                type: d.remoteType || d.deviceType,
                isOn: false,
                isLoading: false,
                isInfrared: true,
              })
            }
          }
        }

        // 重複排除 (device_idが同じものを除去)
        const uniqueDevices = controllable.filter(
          (device, index, self) =>
            index === self.findIndex((d) => d.device_id === device.device_id)
        )

        setDevices(uniqueDevices)
      } catch (error) {
        console.error('Failed to fetch devices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
  }, [])

  const handleToggle = async (deviceId: string, currentState: boolean) => {
    // Set loading state
    setDevices((prev) =>
      prev.map((d) =>
        d.device_id === deviceId ? { ...d, isLoading: true } : d
      )
    )

    try {
      const command = currentState ? 'turnOff' : 'turnOn'
      await api.sendDeviceCommand(deviceId, command)
      // Update state on success
      setDevices((prev) =>
        prev.map((d) =>
          d.device_id === deviceId
            ? { ...d, isOn: !currentState, isLoading: false }
            : d
        )
      )
    } catch (error) {
      console.error('Failed to send command:', error)
      // Reset loading state on error
      setDevices((prev) =>
        prev.map((d) =>
          d.device_id === deviceId ? { ...d, isLoading: false } : d
        )
      )
    }
  }

  const lights = devices.filter((d) => isLightDevice(d.type))
  const acs = devices.filter((d) => isACDevice(d.type))
  const curtains = devices.filter((d) => isCurtainDevice(d.type))

  if (loading) {
    return (
      <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (devices.length === 0) {
    return (
      <Box sx={{ py: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.secondary }}
        >
          デバイス
        </Typography>
        <Typography variant="body2" color="text.secondary">
          制御可能なデバイスがありません
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ py: 1.5 }}>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, mb: 1.5, color: theme.palette.text.primary }}
      >
        デバイス
      </Typography>

      {/* 照明 */}
      {lights.length > 0 && (
        <Box sx={{ mb: acs.length > 0 || curtains.length > 0 ? 2 : 0 }}>
          {lights.map((device) => (
            <Box
              key={device.device_id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.75,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {device.isOn ? (
                  <LightbulbIcon
                    sx={{ fontSize: '1.25rem', color: '#FFD700' }}
                  />
                ) : (
                  <LightbulbOutlinedIcon
                    sx={{ fontSize: '1.25rem', color: 'text.secondary' }}
                  />
                )}
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  {device.name}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => handleToggle(device.device_id, device.isOn)}
                disabled={device.isLoading}
                sx={{
                  backgroundColor: device.isOn
                    ? 'rgba(255, 215, 0, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    backgroundColor: device.isOn
                      ? 'rgba(255, 215, 0, 0.25)'
                      : 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {device.isLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <PowerSettingsNewIcon
                    sx={{
                      fontSize: '1rem',
                      color: device.isOn ? '#FFD700' : 'text.secondary',
                    }}
                  />
                )}
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {/* エアコン */}
      {acs.length > 0 && (
        <Box sx={{ mb: curtains.length > 0 ? 2 : 0 }}>
          {acs.map((device) => (
            <Box
              key={device.device_id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.75,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AcUnitIcon
                  sx={{
                    fontSize: '1.25rem',
                    color: device.isOn ? '#00BCD4' : 'text.secondary',
                  }}
                />
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  {device.name}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => handleToggle(device.device_id, device.isOn)}
                disabled={device.isLoading}
                sx={{
                  backgroundColor: device.isOn
                    ? 'rgba(0, 188, 212, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    backgroundColor: device.isOn
                      ? 'rgba(0, 188, 212, 0.25)'
                      : 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {device.isLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <PowerSettingsNewIcon
                    sx={{
                      fontSize: '1rem',
                      color: device.isOn ? '#00BCD4' : 'text.secondary',
                    }}
                  />
                )}
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {/* カーテン */}
      {curtains.length > 0 && (
        <Box>
          {curtains.map((device) => (
            <Box
              key={device.device_id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.75,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {device.isOn ? (
                  <VerticalShadesIcon
                    sx={{ fontSize: '1.25rem', color: '#8D6E63' }}
                  />
                ) : (
                  <VerticalShadesClosedIcon
                    sx={{ fontSize: '1.25rem', color: 'text.secondary' }}
                  />
                )}
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  {device.name}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => handleToggle(device.device_id, device.isOn)}
                disabled={device.isLoading}
                sx={{
                  backgroundColor: device.isOn
                    ? 'rgba(141, 110, 99, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    backgroundColor: device.isOn
                      ? 'rgba(141, 110, 99, 0.25)'
                      : 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {device.isLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <PowerSettingsNewIcon
                    sx={{
                      fontSize: '1rem',
                      color: device.isOn ? '#8D6E63' : 'text.secondary',
                    }}
                  />
                )}
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default DeviceControlWidget
