import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { DeviceWithStatus } from '../services/api'
import './Devices.css'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'

// デバイスタイプの日本語マッピング
const deviceTypeMap: Record<string, string> = {
  'Hub': 'ハブ',
  'Hub Mini': 'ハブミニ',
  'Hub Plus': 'ハブプラス',
  'Hub 2': 'ハブ2',
  'Bot': 'ボット',
  'Curtain': 'カーテン',
  'Plug': 'プラグ',
  'Plug Mini (US)': 'プラグミニ (US)',
  'Plug Mini (JP)': 'プラグミニ (JP)',
  'Meter': '温湿度計',
  'MeterPlus': '温湿度計プラス',
  'MeterPro': '温湿度計プロ',
  'WoIOSensor': '温湿度センサー',
  'Motion Sensor': '人感センサー',
  'Contact Sensor': '開閉センサー',
  'Color Bulb': 'カラー電球',
  'Strip Light': 'LEDテープライト',
  'Humidifier': '加湿器',
  'Smart Fan': 'スマート扇風機',
  'Air Conditioner': 'エアコン',
  'TV': 'テレビ',
  'Light': '照明',
  'IPTV / Streamer': 'ストリーマー',
  'Set Top Box': 'セットトップボックス',
  'DVD': 'DVD',
  'Fan': '扇風機',
  'Projector': 'プロジェクター',
  'Camera': 'カメラ',
  'Air Purifier': '空気清浄機',
  'Speaker': 'スピーカー',
  'Water Heater': '給湯器',
  'Vacuum Cleaner': '掃除機',
  'Others': 'その他',
}

const getDeviceTypeLabel = (type: string): string => {
  return deviceTypeMap[type] || type
}

function Devices() {
  const [devices, setDevices] = useState<DeviceWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null)
  const [editName, setEditName] = useState<string>('')

  useEffect(() => {
    fetchDevices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isMeterDevice = (type: string) =>
    ['Meter', 'MeterPlus', 'MeterPro', 'WoIOSensor'].includes(type)

  const getDisplayName = (device: DeviceWithStatus): string => {
    return device.custom_name || device.name
  }

  const getRelativeTime = (timestamp: string): string => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}時間前`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}日前`
  }

  const fetchDevices = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getDevicesWithStatus()
      setDevices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleEditName = (device: DeviceWithStatus) => {
    setEditingDeviceId(device.device_id)
    setEditName(device.custom_name || device.name)
  }

  const handleSaveName = async (deviceId: string) => {
    try {
      await api.updateDeviceName(deviceId, editName.trim())
      setDevices(prev =>
        prev.map(d =>
          d.device_id === deviceId
            ? { ...d, custom_name: editName.trim() }
            : d
        )
      )
      setEditingDeviceId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '名前の更新に失敗しました')
    }
  }

  const handleCancelEdit = () => {
    setEditingDeviceId(null)
    setEditName('')
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="devices-page">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
        className="devices-header"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              opacity: 0.7,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            ← ダッシュボード
          </Link>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            デバイス一覧
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={fetchDevices}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{
            px: 3,
            py: 1,
          }}
        >
          {loading ? '更新中...' : '再読み込み'}
        </Button>
      </Box>

      {error && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid rgba(255, 68, 68, 0.3)',
          }}
          className="error"
        >
          <Typography color="error" sx={{ fontWeight: 500 }}>
            エラー: {error}
          </Typography>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="section" className="device-section">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              登録デバイス
            </Typography>
            <Chip
              label={`${devices.length}台`}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>
          {devices.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 3,
                borderRadius: 3,
                border: '2px dashed',
                borderColor: 'divider',
              }}
            >
              <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                デバイスが見つかりません
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
              className="device-grid"
            >
              {devices.map((device) => (
                <Card
                  key={device.device_id}
                  className={`device-card ${isMeterDevice(device.type) ? 'meter' : ''}`}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    border: isMeterDevice(device.type)
                      ? '2px solid rgba(255, 170, 0, 0.3)'
                      : undefined,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {editingDeviceId === device.device_id ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }} className="edit-name-form">
                          <TextField
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            inputProps={{ maxLength: 100 }}
                            size="small"
                            fullWidth
                            autoFocus
                          />
                          <Box sx={{ display: 'flex', gap: 1 }} className="edit-name-buttons">
                            <Button variant="contained" size="small" onClick={() => handleSaveName(device.device_id)} sx={{ flex: 1 }}>
                              保存
                            </Button>
                            <Button variant="outlined" size="small" onClick={handleCancelEdit} sx={{ flex: 1 }}>
                              キャンセル
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            mb: 2,
                          }}
                          className="device-name-display"
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, mr: 1 }}>
                            {getDisplayName(device)}
                          </Typography>
                          <Tooltip title="名前を編集">
                            <IconButton
                              size="small"
                              onClick={() => handleEditName(device)}
                              sx={{
                                opacity: 0.6,
                                '&:hover': { opacity: 1 },
                              }}
                            >
                              ✏️
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}

                      <Chip
                        label={getDeviceTypeLabel(device.type)}
                        size="small"
                        sx={{
                          width: 'fit-content',
                          mb: 2,
                          fontWeight: 500,
                        }}
                        className="device-type"
                      />

                      {isMeterDevice(device.type) && device.latest_status && (
                        <>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }} className="status-readings">
                            {device.latest_status.temperature && (
                              <Box className="status-item" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span className="status-icon">🌡️</span>
                                <span className="status-value">{device.latest_status.temperature}°C</span>
                              </Box>
                            )}
                            {device.latest_status.humidity && (
                              <Box className="status-item" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span className="status-icon">💧</span>
                                <span className="status-value">{device.latest_status.humidity}%</span>
                              </Box>
                            )}
                            {device.latest_status.battery !== null && (
                              <Box className="status-item" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span className="status-icon">🔋</span>
                                <span className="status-value">{device.latest_status.battery}%</span>
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ mt: 2 }} className="last-updated">
                            <Typography variant="caption">最終更新: {getRelativeTime(device.latest_status.recorded_at)}</Typography>
                          </Box>
                        </>
                      )}

                      {isMeterDevice(device.type) && !device.latest_status && (
                        <Box sx={{ mt: 2 }} className="no-status">
                          <Typography variant="body2" color="text.secondary">
                            データがありません（Schedulerが自動的に取得します）
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      {/* reserved for actions if needed */}
                    </CardActions>
                  </Card>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Container>
  )
}

export default Devices
