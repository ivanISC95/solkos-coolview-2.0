import { DatasResponse, DrawerOptions, Fail, PlotlyShape, SafeZone, ServiceOrder, Telemetry } from "../Interfaces/DatasResponse";

const getTelemetryNames = (data: DatasResponse | null) => {
  if (!data || !Array.isArray(data.telemetry) || data == null) {
    return [];
  }
  return data.telemetry.map(item => item.name);
}
const getTelemetryNamesTranslated = (data: any): string[] => {
  const nameMap: { [key: string]: string } = {
    "door_state": "Aperturas",
    "compressor_state": "Compresor",
    "internal_temperature": "Temperatura",
    "evaporator_temperature": "Evaporador",
    "temperature_1": "Evaporador",
    "temperature_2": "Ambiente",
    "condenser_temperature": "Condensador",
    "voltage_consumption": "Voltaje",
    "voltage_min": "Voltaje Mínimo",
    "voltage_max": "Voltaje Máximo",
    "energy_consumption": "Consumo de Energia",
  };

  return getTelemetryNames(data).map(name => nameMap[name] || name);
}
// Funcion traduce los nombres desde el API a español
const nameMap: { [key: string]: string } = {
  "internal_temperature": "Temperatura",
  "door_state": "Aperturas",
  "compressor_state": "Compresor",
  "voltage_consumption": "Voltaje",
  "voltage_min": "Voltaje Mínimo",
  "voltage_max": "Voltaje Máximo",
  "condenser_temperature": "Condensador",
  "energy_consumption": "Consumo de Energia",
  "evaporator_temperature": "Evaporador",
  "temperature_1": "Evaporador",
  "temperature_2": "Ambiente",
};

const colorMap: Record<string, string> = {
  "door_state": "#909296",
  "compressor_state": "#9C36B5",
  "internal_temperature": "#028CFF",
  "condenser_temperature": "#0B7285",
  "evaporator_temperature": "#728CAF",
  "temperature_1": "#728CAF",
  "temperature_2": "#40C057",
  "voltage_consumption": "#E67700",
  "voltage_min": "#FCC419",
  "voltage_max": "#E67700",
  "energy_consumption": "#40C057",
};

const typeMap: Record<string, string> = {
  "column": "bar",
  "line": "line"
};
const LayoutInforTelemetry = (value: string[]) => {
  if (value.length > 1) {
    return ['', '']
  }
  if (value.includes('Temperatura')) {
    return ['Temperatura', '℃']
  }
  if (value.includes('Condensador')) {
    return ['Condensador', '℃']
  }
  if (value.includes('Evaporador')) {
    return ['Evaporador', '℃']
  }
  if (value.includes('Ambiente')) {
    return ['Ambiente', '℃']
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
  if (value.includes('Voltaje')) {
    return ['Voltaje', 'V']
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
const transformTelemetry2 = (data: Telemetry[] | null, selectedNames: string[], value: string[]): any[] => {
  if (!data) return [];
  const customData = data.flatMap(serie =>
    serie.data.map(point => {
      const date = new Date(point.x);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
    })
  );

  return data
    .filter(({ name }) => selectedNames.includes(nameMap[name])) // Filtra solo los que están en selectedNames
    .map(({ name, type, data }) => ({
      name: `${nameMap[name]}.`,
      type: typeMap[type] || "bar",
      mode: type === "line" ? "lines" : "",
      line: {
        color: colorMap[name] || "#000000",
        width: 1
      },
      marker: {
        color: colorMap[name] || "#000000"
      },
      x: data.map(point => point.x),
      y: data.map(point => point.y),
      customdata: customData,
      // hovertemplate: "%{y:.1f}℃ %{customdata}"
      hovertemplate: `%{y:.1f}${LayoutInforTelemetry(value)[1]} %{customdata}`
    }));
}
const transformSafeZone = (safeZone: SafeZone[]): PlotlyShape[] => {
  const temperature = safeZone.find((item) => item.temperature)?.temperature;
  if (!temperature) return [];

  const { x: y0, y: y1 } = temperature;

  return [
    {
      type: "rect",
      x0: 0,
      x1: 1,
      y0,
      y1,
      xref: "paper",
      yref: "y",
      fillcolor: "rgba(134, 239, 172, 0.15)",
      line: { width: 0 },
      layer: "below",
    },
    {
      type: "line",
      x0: 0,
      x1: 1,
      y0: y1,
      y1: y1,
      xref: "paper",
      yref: "y",
      line: { color: "#22C55E", width: 0.5, dash: "dot" },
    },
    {
      type: "line",
      x0: 0,
      x1: 1,
      y0: y0,
      y1: y0,
      xref: "paper",
      yref: "y",
      line: { color: "#22C55E", width: 0.5, dash: "dot" },
    },
  ];
};
const transformTelemetryZoneEvents = (data: Fail[] | null, rangosTelemetry: number[], drawer_checked_opt?: DrawerOptions,data_OS?:ServiceOrder[]) => {
  if (!data) return [];
  // const minValue =  events_filter?.includes('Aperturas') == true || events_filter?.includes('Compresor') ? -2 :  Math.min(...rangosTelemetry)
  const minValue = Math.min(...rangosTelemetry)
  const typeMapping: Record<string, string> = {
    "DISCONNECTION_ALERT": "Desconexión",
    "RECONNECTION_ALERT": "Conexión",
    "COMPRESSOR_RUN_TIME_EXCEDED_ALERT": "Alerta Compresor",
    "TEMPERATURE_ALERT": "Alerta Temperatura",
    "VOLTAGE_ALERT": "Alerta Bajo/Alto Voltaje",
    "TEMPERATURE_FAIL": "Falla Temperatura",
    "FROZEN_ALERT": "Falla Congelamiento",
    "COMPRESSOR_FAIL": "Falla Compresor",
    "VOLTAGE_FAIL": "Falla Voltaje"
  };

  const events = data.flatMap((fail: Fail) => {
    const baseEvent = {
      name: typeMapping[fail.type_fail] || "Desconocido",
      type: "scatter",
      mode: "markers",
      x: [fail.start ?? fail.timestamp],
      y: [minValue < 0 ? minValue + -0.5 : minValue - 1],
      customdata: ["Estatus : undefined,Folio : undefined, Comentarios : undefined"],
      hovertemplate: typeMapping[fail.type_fail] || "Desconocido",
      showlegend: false,
      marker: {
        size: 15,
        symbol: "square",
        color: "transparent"
      }
    };
    if (fail.type_fail === "DISCONNECTION_ALERT" && fail.end) {
      const reconnectionEvent = {
        ...baseEvent,
        name: typeMapping["RECONNECTION_ALERT"], // "Conexión"
        x: [fail.end], // Usamos "end" como timestamp de conexión
        hovertemplate: typeMapping["RECONNECTION_ALERT"]
      };

      return [baseEvent, reconnectionEvent]; // Retornamos ambos eventos
    }
    return [baseEvent]; // Retornamos solo el evento normal
  });
  if(data_OS){
    const datos_ordenes = data_OS.flatMap(item =>{
      return {
        name: "Servicio",
      type: "scatter",
      mode: "markers",
      x: [item.close_date ?? item.open_date],
      y: [minValue < 0 ? minValue + -0.5 : minValue - 1],
      customdata: ["Estatus : undefined,Folio : undefined, Comentarios : undefined"],
      hovertemplate: "Servicio",
      showlegend: false,
      marker: {
        size: 15,
        symbol: "square",
        color: "transparent"
      }
      }
    })
    events.push(...datos_ordenes)
  }
  const prueba = events.filter(item => {
    if (!drawer_checked_opt?.checked_Fails && item.name.includes('Falla')) return false;
    if (!drawer_checked_opt?.checked_Alerts && item.name.includes('Alerta')) return false;
    if (!drawer_checked_opt?.checked_Info && item.name.includes('Servicio')) return false;
    if (!drawer_checked_opt?.checked_Desconections && item.name.includes('Desconexión')) return false;
    if (!drawer_checked_opt?.checked_Desconections && item.name.includes('Conexión')) return false;
    return true;
  })

  return prueba.filter(a => a.name !== "Desconocido");
};

// IMG into Events zone
// Image size X
const pixelsToSizeX = (px: number, windowWidth: number, rangeX: [number, number]) => {
  const [xMin, xMax] = rangeX;
  const graphWidth = xMax - xMin;
  return (px / windowWidth) * graphWidth;
};
// Image size Y
const pixelsToSizeY = (px: number, rangeY: [number, number]) => {
  const [yMin, yMax] = rangeY;
  const graphHeight = yMax - yMin;
  return (px / 600) * graphHeight; // 600 es un ejemplo de altura en px del gráfico
};
// function to create images in the graph
function transformFailsToAnnotations2(data: DatasResponse | null, valueInputFechas: any, rangosTelemetry: number[], data_OS?: ServiceOrder[],graph_view_opt?:number) {
  const windowWidth = window.innerWidth;
  const xRange: [number, number] = valueInputFechas
  const yRange: [number, number] = [0, Math.max(...rangosTelemetry) > 250 ? 500 : 250];
  const minValue = Math.min(...rangosTelemetry)
  if (!data || !data.fails) return [];
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
    "VOLTAGE_FAIL": "/assets/Fails/FallaElectrica.svg"
  };

  const annotations = data.fails.flatMap(fail => {
    const baseAnnotation = {
      source: iconMapping[fail.type_fail] || "",
      x: fail.timestamp ?? fail.start, // Tomamos `timestamp` o `start`
      y: minValue < 0 ? minValue + 2.6 : minValue + 2.7,
      xref: "x",
      yref: "y",
      // sizex: pixelsToSizeX(18, windowWidth, xRange),
      sizex: graph_view_opt === 4 ? pixelsToSizeX(60, windowWidth, xRange) : pixelsToSizeX(18, windowWidth, xRange),
      sizey: pixelsToSizeY(18, yRange),
      opacity: 1,
      layer: ""
    };

    // Si es una desconexión y tiene "end", agregamos la anotación de reconexión
    if (fail.type_fail === "DISCONNECTION_ALERT" && fail.end) {
      const reconnectionAnnotation = {
        ...baseAnnotation,
        source: iconMapping["RECONNECTION_ALERT"], // Imagen de reconexión
        x: fail.end // Usamos `end` como la fecha de reconexión
      };

      return [baseAnnotation, reconnectionAnnotation]; // Retornamos ambos eventos
    }

    return [baseAnnotation]; // Retornamos solo el evento normal
  });
  if (data_OS) {
    const datos_ordenes = data_OS.flatMap(item => {
      return {
        source: "/assets/Informativos/Servicios.svg",
        x: item.close_date ?? item.open_date,
        y: minValue < 0 ? minValue + 2.6 : minValue + 2.7,
        xref: "x",
        yref: "y",
        // sizex: pixelsToSizeX(18, windowWidth, xRange),
        sizex: graph_view_opt === 4 ? pixelsToSizeX(60, windowWidth, xRange) : pixelsToSizeX(18, windowWidth, xRange),
        sizey: pixelsToSizeY(18, yRange),
        opacity: 1,
        layer: ""
      }
    })
    annotations.push(...datos_ordenes)
  }
  return annotations.filter(a => a.source !== "");
}
const transformDesconectionsZone = (data: Fail[], datas_min_max: number[]) => {

  return data.map((item: Fail) => item.end ? ({
    type: 'rect',
    x0: item.end,
    x1: item.start,
    y0: Math.min(...datas_min_max),
    y1: Math.max(...datas_min_max),
    xref: 'x',
    yref: 'y',
    fillcolor: "rgba(161, 161, 170, 0.15)",
    line: {
      color: '#57534E',
      width: 0.5,
      dash: 'dot'
    },
    text: 'Desconexion',
    font: {
      family: 'Arial, sans-serif',
      size: 14,
      color: 'black'
    },
    align: 'center',
    valign: 'middle',
    layer: 'above'
  }) : '');
};
// Ocultar primer elemento leyenda del eje Y
const hideFirstYTick = (element: any) => {
  // Busca todos los ticks del eje Y
  const yTicks = element.querySelectorAll('.yaxislayer-above .ytick text');
  if (yTicks.length > 0) {
    const firstTick = yTicks[0] as SVGTextElement;
    if (firstTick) {
      firstTick.style.visibility = 'hidden';
    }
  }
};

export { getTelemetryNamesTranslated, transformTelemetry2, transformSafeZone, transformTelemetryZoneEvents, transformFailsToAnnotations2, transformDesconectionsZone, hideFirstYTick }