export interface DeviceStatus {
  temperature: string | null
  humidity: string | null
  battery: number | null
  recorded_at: string
}

export interface DeviceWithStatus {
  device_id: string
  name: string
  custom_name: string | null
  type: string
  hub_device_id?: string
  latest_status: DeviceStatus | null
}

export interface ForecastPoint {
  dt: string
  temp_c: number | null
  label: string
  weather: string
  precipitation_mm: number | null
}

export interface WeatherForecast {
  source: string
  units: string
  forecasts: ForecastPoint[]
}

export interface OutdoorSensorData {
  device_id: string
  device_name: string
  device_type: string
  temperature: number | null
  humidity: number | null
  battery: number | null
  recorded_at: string
}

export interface CalendarEvent {
  id: string
  summary: string
  start: string
  end: string
  start_time: string
  end_time: string
  location?: string | null
  description?: string | null
  is_all_day: boolean
  calendar_id?: string
  calendar_name?: string
  calendar_color?: string
}

export interface TodayCalendar {
  events: CalendarEvent[]
  count: number
  date: string
}

export interface CommandResult {
  success: boolean
  device_id: string
  command: string
  result: {
    statusCode: number
    message: string
  }
}

export interface SwitchBotDevice {
  deviceId: string
  deviceName: string
  deviceType: string
  hubDeviceId?: string
  remoteType?: string
  // Curtain specific
  group?: boolean
  master?: boolean
  curtainDevicesIds?: string[]
}

export interface SwitchBotDevicesResponse {
  statusCode: number
  message: string
  body: {
    deviceList: SwitchBotDevice[]
    infraredRemoteList: SwitchBotDevice[]
  }
}

export const api = {
  async getDevicesWithStatus(): Promise<DeviceWithStatus[]> {
    const response = await fetch('/api/devices/status')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async getAllDevices(): Promise<SwitchBotDevicesResponse> {
    const response = await fetch('/api/devices')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async updateDeviceName(deviceId: string, customName: string): Promise<void> {
    const response = await fetch(`/api/devices/${deviceId}/name`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_name: customName })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  },

  async getWeatherForecast(hours = 48, fromMidnight = true): Promise<WeatherForecast> {
    const response = await fetch(`/api/weather/forecast?hours=${hours}&from_midnight=${fromMidnight}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async getOutdoorSensor(sensorName = '室外'): Promise<OutdoorSensorData> {
    const response = await fetch(`/api/weather/outdoor?sensor_name=${encodeURIComponent(sensorName)}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async getTodayCalendar(): Promise<TodayCalendar> {
    const response = await fetch('/api/calendar/today')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async sendDeviceCommand(
    deviceId: string,
    command: string,
    parameter = 'default',
    commandType = 'command'
  ): Promise<CommandResult> {
    const response = await fetch(`/api/devices/${deviceId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command,
        parameter,
        command_type: commandType
      })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }
}
