// export interface DatasResponse { }
export interface DatasResponse {
    telemetry: Telemetry[];
    safeZone: SafeZone[];
    fails: Fail[];
}

export interface Fail {
    type_fail: string;
    timestamp?: Date | string;
    start : Date | string;
    end : Date | string;
}

export enum TypeFail {
    DisconnectionAlert = "DISCONNECTION_ALERT",
    ReconnectionAlert = "RECONNECTION_ALERT",
}

export interface SafeZone {
    temperature?: Temperature;
    voltage?: Temperature;
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

export interface PlotlyShape {
    type: "rect" | "line";
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    xref: "paper";
    yref: "y";
    fillcolor?: string;
    line: {
        width: number;
        color?: string;
        dash?: "dot";
    };
    layer?: "below";
};

export interface DrawerOptions {
    checked_safe_disc : boolean;    
    checked_safe_zone : boolean;
    checked_disconection : boolean;    
    checked_Alerts : boolean;
    checked_events_zone : boolean;
    checked_Fails : boolean;
    checked_Info : boolean;
    checked_Desconections :  boolean;
    [key: string]: any; // ← Agrega esto
}