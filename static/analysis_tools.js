function generateAnalysisWindow (desired_temp, desired_psi, real_flag = false) {
  let ideal_temp_change_rate = Math.abs((temp_max_rate + temp_min_rate) / 2);
  let ideal_psi_change_rate = Math.abs((psi_max_rate + psi_min_rate) / 2);
  let final_ideal_rate;

  let display_text_option = "TEMP (*F)";
  let total_cure_flag = false;

  let time_to_cure_text = "TIME TO CURE: ";
  let time_to_cure_divider = 2;
  if (desired_temp == 0) {
    time_to_cure_text = "TIME UNTIL DESIRED PSI: ";
    time_to_cure_divider = 1;
    display_text_option = "PSI";
    final_ideal_rate = ideal_psi_change_rate;
  } else if (desired_psi == 0) {
    time_to_cure_text = "TIME UNTIL DESIRED TEMP: ";
    time_to_cure_divider = 1;
    final_ideal_rate = ideal_temp_change_rate;
  } else {
    total_cure_flag = true;
  }
  
  let current_temp;
  switch (true) {
    case (isNaN(parseFloat(temp_values[temp_values.length - 1]))):
    case (temp_values[temp_values.length - 1] == null):
    case (temp_values.length < 1):
      current_temp = 0;
      break;
    default:
      current_temp = temp_values[temp_values.length - 1];
      break;
  }
  let temp_needed = Math.abs(desired_temp - current_temp);

  let current_psi;
  switch (true) {
    case (isNaN(parseFloat(pressure_values[pressure_values.length - 1]))):
    case (pressure_values[pressure_values.length - 1] == null):
    case (pressure_values.length < 1):
      current_psi = 0;
      break;
    default:
      current_psi = parseFloat(pressure_values[pressure_values.length - 1]);
      break;
  }
  let psi_needed = Math.abs(desired_psi - current_psi);

  let time_to_cure_temp = temp_needed / ideal_temp_change_rate;
  let time_to_cure_psi = psi_needed / ideal_psi_change_rate;
  let total_cure_time = (time_to_cure_temp + time_to_cure_psi) / time_to_cure_divider;

  document.getElementById("fancy-predictor-content").innerHTML = "<div class='text-center'>" + time_to_cure_text + String(total_cure_time) + " MINUTES</div>";

  const graph_ctx = document.createElement("canvas");
  document.getElementById("fancy-predictor-content").appendChild(graph_ctx);

  let graph_time_val = [];
  let temp_or_psi_val = [];

  for (let i = 0; i < total_cure_time; i++) {
    graph_time_val.push(i);
    temp_or_psi_val.push(final_ideal_rate * i);
  }

  if (document.getElementById("fancy-graph-realsies")) {
    document.getElementById("fancy-graph-realsies").remove();
  }
  graph_ctx.id = "fancy-graph-realsies";

  new Chart(graph_ctx, {
    type : "line",
    options : {
      animation : false
    },
    data : {
      labels : graph_time_val,
      datasets : [{
         fill : false,
         lineTension : 0,
         backgroundColor: "rgba(136,238,136,1.000)",
         borderColor: "rgba(136,238,136,1.000)",
         data : temp_or_psi_val
      }]
    },
    options: {
    plugins: {
      legend: {display:false},
      title: {
        display: true,
          text: "PREDICTION",
          font : {
              family : "Hornet"
          },
          color : "rgba(136,238,136,1.000)"
        }
      },
      scales : {
        y : {
          grid: {
            color : "rgba(136,238,136,1.000)"
          },
          border : {
            color : "rgba(136,238,136,1.000)"
          },
          ticks : {
            color : "rgba(136,238,136,1.000)",
            font : {
              family : "Hornet"
            },
          },
          title : {
            display: true,
            text : display_text_option,
            font : {
              family : "Hornet"
            },
            color: "rgba(136,238,136,1.000)"
          }
        },
        x : {
          grid : {
            color : "rgba(136,238,136,1.000)"
          },
          border : {
            color : "rgba(136,238,136,1.000)"
          },
          ticks : {
           color : "rgba(136,238,136,1.000)",
            font : {
              family : "Hornet"
            }
          },
          title : {
            display: true,
            text : "TIME (MIN)",
            font : {
              family : "Hornet"
            },
            color: "rgba(136,238,136,1.000)"
          }
        }
      }
    }
  });

  if (total_cure_flag) {
    document.getElementById("fancy-graph-realsies").remove();
  }

  document.getElementById("fancy-predictor-graph").style.display = "block";
  setTimeout(function () {
    document.getElementById("fancy-predictor-graph").click();
  }, 100);
}