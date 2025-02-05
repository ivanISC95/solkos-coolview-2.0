// export interface DatasResponse { }
export interface DatasResponse {
    telemetry: Telemetry[];
    safeZone:  SafeZone[];
    fails:     Fail[];
}

export interface Fail {
    type_fail: TypeFail;
    timestamp: Date;
}

export enum TypeFail {
    DisconnectionAlert = "DISCONNECTION_ALERT",
    ReconnectionAlert = "RECONNECTION_ALERT",
}

export interface SafeZone {
    temperature?: Temperature;
    voltage?:     Temperature;
}

export interface Temperature {
    x: number;
    y: number;
}

export interface Telemetry {
    name: string;
    type: string;
    data: Datum[];
}

export interface Datum {
    x: Date;
    y: number;
}
