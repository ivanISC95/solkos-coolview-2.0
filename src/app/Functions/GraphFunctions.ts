import { DatasResponse, Fail, PlotlyShape, SafeZone, Telemetry } from "../DatasResponse";

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
      "voltage_consumption": "Voltaje"
    };
  
    return getTelemetryNames(data).map(name => nameMap[name] || name);
}
// Funcion traduce los nombres desde el API a español
const nameMap: { [key: string]: string } = {
  "internal_temperature": "Temperatura",
  "door_state": "Aperturas",
  "compressor_state": "Compresor",
  "voltage_consumption": "Voltaje"
};

const colorMap: Record<string, string> = {
  "door_state": "#909296",
  "compressor_state": "#9C36B5",
  "internal_temperature": "#028CFF",
  "voltage_consumption": "#E67700"
};

const typeMap: Record<string, string> = {
  "column": "bar",
  "line": "line"
};
const LayoutInforTelemetry = (value:string[]) =>{  
  if(value.length > 1){
    return ['','']
  }      
  if(value.includes('Temperatura')){
    return ['Temperatura','℃']
  }  
  if(value.includes('Temperatura Condensador')){
    return ['Temperatura Condensador','℃']
  }
  if(value.includes('Temperatura Evaporador')){
    return ['Temperatura Evaporador','℃']
  }
  if(value.includes('Voltaje')){
    return ['Voltaje','V']
  }
  if(value.includes('Aperturas')){
    return ['Aperturas','']
  }
  if(value.includes('Compresor')){
    return ['Compresor','%']
  }
  if(value.includes('Consumo de Energía')){
    return ['Consumo de Energía','KW/h']
  }
  return ['','']
}
const transformTelemetry2 = (data: Telemetry[] | null, selectedNames: string[],value:string[]): any[] => {
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
const transformTelemetryZoneEvents = (data: Fail[] | null,rangosTelemetry:number[]) => {
  if (!data) return [];
  const minValue = Math.min(...rangosTelemetry)
  const typeMapping: Record<string, string> = {
    "DISCONNECTION_ALERT": "Desconexión",
    "RECONNECTION_ALERT": "Conexión",
    "COMPRESSOR_RUN_TIME_EXCEDED_ALERT": "Alerta Compresor",
    "TEMPERATURE_ALERT" : "Alerta Temperatura",
    "VOLTAGE_ALERT":"Alerta Voltaje",
    "TEMPERATURE_FAIL": "Falla Temperatura",
    "FROZEN_ALERT" : "Falla Congelamiento",
    "COMPRESSOR_FAIL" : "Falla Compresor",
    "VOLTAGE_FAIL" : "Falla Voltaje"
  };

  const events = data.flatMap((fail: Fail) => {
    const baseEvent = {
      name: typeMapping[fail.type_fail] || "Desconocido",
      type: "scatter",
      mode: "markers",
      x: [fail.start ?? fail.timestamp],
      y: [minValue < 0 ? minValue+-0.5 : minValue-1],
      customdata: ["Estatus : undefined,Folio : undefined, Comentarios : undefined"],
      hovertemplate: typeMapping[fail.type_fail] || "Desconocido",
      showlegend: false,
      marker: {
        size: 15,
        symbol: "square",
        color: "red"
      }
    };

    // Si es una desconexión y tiene "end", agregamos el evento de conexión
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

  return events;
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
// function to create images inthe graph
function transformFailsToAnnotations2(data: DatasResponse | null,valueInputFechas:any,rangosTelemetry:number[]) {  
  const windowWidth = window.innerWidth;
  const xRange: [number, number] = valueInputFechas 
  const yRange: [number, number] = [0, Math.max(...rangosTelemetry) > 250 ? 500 : 250];
  const minValue = Math.min(...rangosTelemetry)
  if (!data || !data.fails) return [];
  const iconMapping: Record<string, string> = {
    // Info
    "DISCONNECTION_ALERT": "/assets/Informativos/Desconexion.svg",
    "RECONNECTION_ALERT": "/assets/Informativos/Reconexion.svg",
    // Alerts
    "COMPRESSOR_RUN_TIME_EXCEDED_ALERT": "/assets/Alerts/AltaDemandaCompresor.svg",
    "TEMPERATURE_ALERT" : "/assets/Alerts/AltaTemperatura.svg",
    "VOLTAGE_ALERT" : "/assets/Alerts/AltoVoltaje.svg",
    // Fails
    "TEMPERATURE_FAIL": "/assets/Fails/AltaTemperatura.svg",
    "FROZEN_ALERT" : "/assets/Fails/EvaporadorBloqueado.svg",
    "COMPRESSOR_FAIL" : "/assets/Fails/FallaCompresor.svg",
    "VOLTAGE_FAIL" : "/assets/Fails/FallaElectrica.svg"
  };

  const annotations = data.fails.flatMap(fail => {
    const baseAnnotation = {
      source: iconMapping[fail.type_fail] || "",
      x: fail.timestamp ?? fail.start, // Tomamos `timestamp` o `start`
      y: minValue < 0 ? minValue+0.5 : minValue+2.6,
      xref: "x",
      yref: "y",
      sizex: pixelsToSizeX(18, windowWidth, xRange),
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

  return annotations;
}
const transformDesconectionsZone = (data: Fail[],datas_min_max:number[]) => {  
  
  return data.map((item:Fail) => item.end ? ({
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
export{getTelemetryNamesTranslated,transformTelemetry2,transformSafeZone,transformTelemetryZoneEvents,transformFailsToAnnotations2,transformDesconectionsZone}