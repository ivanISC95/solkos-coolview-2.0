import { DatasResponse } from "../DatasResponse";

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

export{getTelemetryNamesTranslated}