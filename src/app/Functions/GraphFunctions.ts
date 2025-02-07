import { DatasResponse, PlotlyShape, SafeZone, Telemetry } from "../DatasResponse";

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

const transformTelemetry2 = (data: Telemetry[] | null, selectedNames: string[]): any[] => {
  if (!data) return [];
  const customData = data.map((point:any) => point.x).map((dateStr: string) => {
    const date = new Date(dateStr); // Convertir la cadena a Date
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }); // Formato de hora (12h)
  });
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
      hovertemplate: "%{y:.1f}℃ %{customdata}"
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

export{getTelemetryNamesTranslated,transformTelemetry2,transformSafeZone}