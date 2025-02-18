import { Fail } from "../DatasResponse"

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
const graph_config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'autoScale2d'], displaylogo: false
};
const graph_layout = (safe_zone?:any,value?:string[],images?: any[],date_range?:any[]) => {    
  const dateInit = new Date(date_range![0])
  const dateEnd = new Date(date_range![1])
  dateEnd.setUTCHours(23,59,59,999)  
  dateInit.setUTCHours(0,0,0,0)
    return {
        autosize: true,
        showlegend: true,
        plot_bgcolor: '#f8f9fa',
        paper_bgcolor: '#f8f9fa',
        hovermode: 'x',
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
            tickformat: '%d-%b',
            showgrid: false,
            // type: 'date'
            range: date_range!.length > 0 ? [dateInit, dateEnd] : undefined
        },
        yaxis: {
            autorange: true,
            tickformat: '~s',
            // ticksuffix: LayoutInforTelemetry(value)[1],
            ticksuffix: LayoutInforTelemetry(value ?? [])[1] ,
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
            b: 30,
            l: 30,
            r: 30
        },
        shapes : safe_zone,
        images : images ?? []
    };
}

export { graph_config, graph_layout }