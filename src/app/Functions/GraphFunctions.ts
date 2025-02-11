import { DatasResponse, Datum, Fail, PlotlyShape, SafeZone, Telemetry } from "../DatasResponse";

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
const transformTelemetryZoneEvents = (data:DatasResponse | null) => {
  const typeMapping = {
    "DISCONNECTION_ALERT": "Desconexión",
    "RECONNECTION_ALERT": "Conexión"
  };
  
  return data!.fails.map((fail:Fail) => ({
    name: typeMapping[fail.type_fail] || "Desconocido",
    type: "scatter",
    mode: "markers",
    x: [fail.timestamp],
    y: [1.3666667143503823],
    customdata: ["Estatus : undefined,Folio : undefined, Comentarios : undefined"],
    hovertemplate: typeMapping[fail.type_fail] || "Desconocido",
    showlegend: false,
    marker: {
      size: 15,
      symbol: "square",
      color: "red"
      // color: "rgba(0, 0, 0, 0)"
    }
  }));
}
// IMG into Events zone
function transformFailsToAnnotations(data:DatasResponse | null) {
  const iconMapping = {
    "DISCONNECTION_ALERT": "/src/icons/Informativos/Desconexion.svg",
    "RECONNECTION_ALERT": "/src/icons/Informativos/Reconexion.svg"
  };

  return data!.fails.map(fail => ({
    source: iconMapping[fail.type_fail] || "",
    x: fail.timestamp,
    y: 4.966666714350382,
    xref: "x",
    yref: "y",
    sizex: 23350818.571875,
    sizey: 7.5,
    opacity: 1,
    layer: ""
  }));
}
export{getTelemetryNamesTranslated,transformTelemetry2,transformSafeZone,transformTelemetryZoneEvents}