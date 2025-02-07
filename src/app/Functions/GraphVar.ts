const graph_config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'autoScale2d'], displaylogo: false
};
const graph_layout = (safe_zone?:any) => {
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
            type: 'date'
            // range: rangos.length > 0 ? [rangos[0], rangos[1]] : undefined
        },
        yaxis: {
            autorange: true,
            tickformat: '~s',
            // ticksuffix: LayoutInforTelemetry(value)[1],
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
        shapes : safe_zone
    };
}
const SAFE_ZONE = [
    {
      "type": "rect",
      "x0": 0,
      "x1": 1,
      "y0": 4.377916188394388,
      "y1": 6.0788009558777505,
      "xref": "paper",
      "yref": "y",
      "fillcolor": "rgba(134, 239, 172, 0.15)",
      "line": {
        "width": 0
      },
      "layer": "below"
    },
    {
      "type": "line",
      "x0": 0,
      "x1": 1,
      "y0": 6.0788009558777505,
      "y1": 6.0788009558777505,
      "xref": "paper",
      "yref": "y",
      "line": {
        "color": "#22C55E",
        "width": 0.5,
        "dash": "dot"
      }
    },
    {
      "type": "line",
      "x0": 0,
      "x1": 1,
      "y0": 4.377916188394388,
      "y1": 4.377916188394388,
      "xref": "paper",
      "yref": "y",
      "line": {
        "color": "#22C55E",
        "width": 0.5,
        "dash": "dot"
      }
    }
  ]
export { graph_config, graph_layout ,SAFE_ZONE}