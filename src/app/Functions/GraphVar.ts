const LayoutInforTelemetry = (value: string[]) => {
  if (value.length > 1) {
    return ['', '']
  }
  if (value.includes('Temperatura')) {
    return ['Temperatura', '℃']
  }
  if (value.includes('Temperatura Condensador')) {
    return ['Temperatura Condensador', '℃']
  }
  if (value.includes('Temperatura Evaporador')) {
    return ['Temperatura Evaporador', '℃']
  }
  if (value.includes('Voltaje')) {
    return ['Voltaje', 'V']
  }
  if (value.includes('Voltaje Mínimo')) {
    return ['Voltaje Mínimo', 'V']
  }
  if (value.includes('Voltaje Máximo')) {
    return ['Voltaje Máximo', 'V']
  }
  if (value.includes('Aperturas')) {
    return ['Aperturas', '']
  }
  if (value.includes('Compresor')) {
    return ['Compresor', '%']
  }
  if (value.includes('Consumo de Energía')) {
    return ['Consumo de Energía', 'KW/h']
  }
  return ['', '']
}
const graph_config = {
  showTips: false,
  responsive: true,
  displayModeBar: true,
  modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'autoScale2d'], displaylogo: false
};
const graph_layout = (safe_zone?: any, value?: string[], images?: any[], date_range?: any[]) => {
  const dateInit = new Date(date_range![0])
  const dateEnd = new Date(date_range![1])
  dateEnd.setUTCHours(23, 59, 59, 999)
  dateInit.setUTCHours(0, 0, 0, 0)
  return {
    autosize: true,
    showlegend: true,
    plot_bgcolor: '#FFF',
    paper_bgcolor: '#FFF',
    hovermode: 'x unified',
    font: {
      family: 'DM Mono',
      size: 12,
      color: '#868E96',
    },
    legend: {
      x: 0.95, // Mueve la leyenda más hacia la izquierda
      xanchor: 'right',
      yanchor: 'bottom',
      y: 0.95,
      orientation: 'h',
      font: {
        family: 'DM Sans, monospace',
        color: '#495057',
      },
      traceorder: 'normal',
    },
    xaxis: {
      // spikedash: 'solid',
      spikethickness: 0.5,
      spikecolor: 'gray',
      tickformat: '%d-%b-%y',
      showgrid: true,
      gridcolor: 'light gray',
      gridwidth: 2,
      griddash: 'dot',
      // type: 'date',y      
      range: date_range!.length > 0 ? [dateInit, dateEnd] : undefined,
      ticklabelstandoff: 18
    },
    yaxis: {
      autorange: true,
      gridcolor: 'light gray',
      gridwidth: 2,
      griddash: 'dot',
      tickformat: '',
      // ticksuffix: LayoutInforTelemetry(value)[1],
      ticksuffix: LayoutInforTelemetry(value ?? [])[1],
      zeroline: false,
      showgrid: true,
      tickfont: {
        family: 'DM Mono',
        size: 12,
        color: '#868E96'
      },
    },
    margin: {
      t: 10,
      b: 35,
      l: 30,
      r: 30
    },
    annotations: images ?? [],
    shapes: safe_zone
  };
}
// Variables para color, background y nombres
const iconMapping: Record<string, string> = {
  // Connections
  "DISCONNECTION_ALERT": "/assets/Connections/Desconexion.svg",
  "RECONNECTION_ALERT": "/assets/Connections/Reconexion.svg",
  // Alerts
  "COMPRESSOR_RUN_TIME_EXCEDED_ALERT": "/assets/Alerts/AltaDemandaCompresor.svg",
  "TEMPERATURE_ALERT": "/assets/Alerts/AltaTemperatura.svg",
  "VOLTAGE_ALERT": "/assets/Alerts/AltoVoltaje.svg",
  // Fails
  "TEMPERATURE_FAIL": "/assets/Fails/AltaTemperatura.svg",
  "FROZEN_ALERT": "/assets/Fails/EvaporadorBloqueado.svg",
  "COMPRESSOR_FAIL": "/assets/Fails/FallaCompresor.svg",
  "VOLTAGE_FAIL": "/assets/Fails/FallaElectrica.svg",
};
const iconMapping2: Record<string, string> = {
  // Connections
  "DISCONNECTION_ALERT": "\u{e905}",
  "RECONNECTION_ALERT": "\u{e906}",
  // Alerts
  "COMPRESSOR_RUN_TIME_EXCEDED_ALERT": "\u{e90a}",
  "TEMPERATURE_ALERT": "\u{e90b}",
  "VOLTAGE_ALERT": "\u{e908}",
  // Fails
  "TEMPERATURE_FAIL": "\u{e901}",
  "FROZEN_ALERT": "\u{e902}",
  "COMPRESSOR_FAIL": "\u{e903}",
  "VOLTAGE_FAIL": "\u{e904}",
};
const colors: any = {
  DISCONNECTION_ALERT: "#2393F4",
  RECONNECTION_ALERT: "#2393F4",
  // Alerts
  COMPRESSOR_RUN_TIME_EXCEDED_ALERT: "#E67700",
  TEMPERATURE_ALERT: "#E67700",
  VOLTAGE_ALERT: "#E67700",
  // Fails
  TEMPERATURE_FAIL: "#FA5252",
  FROZEN_ALERT: "#FA5252",
  COMPRESSOR_FAIL: "#FA5252",
  VOLTAGE_FAIL: "#FA5252",
}
const colorsBack: any = {
  DISCONNECTION_ALERT: "#E7F5FF",
  RECONNECTION_ALERT: "#E7F5FF",
  // Alerts
  COMPRESSOR_RUN_TIME_EXCEDED_ALERT: "#FFF9DB",
  TEMPERATURE_ALERT: "#FFF9DB",
  VOLTAGE_ALERT: "#FFF9DB",
  // Fails
  TEMPERATURE_FAIL: "#FFF5F5",
  FROZEN_ALERT: "#FFF5F5",
  COMPRESSOR_FAIL: "#FFF5F5",
  VOLTAGE_FAIL: "#FFF5F5",
}
export { graph_config, graph_layout, iconMapping, iconMapping2, colors, colorsBack }