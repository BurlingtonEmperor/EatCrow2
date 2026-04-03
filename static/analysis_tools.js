function generateAnalysisWindow (desired_temp, desired_psi) {
  let time_to_cure_text = "TIME TO CURE: ";
  if (desired_temp == 0) {
    time_to_cure_text = "TIME UNTIL DESIRED PSI: ";
  } else if (desired_psi == 0) {
    time_to_cure_text = "TIME UNTIL DESIRED TEMP: ";
  }

  let ideal_temp_change_rate = Math.abs((temp_max_rate + temp_min_rate) / 2);
  let ideal_psi_change_rate = Math.abs((psi_max_rate + psi_min_rate) / 2);
  
  let current_temp;
  switch (true) {
    case (isNaN(parseFloat(temp_values[temp_values.length - 1]))):
    case (temp_values[temp_values.length - 1] == null):
    case (temp_values.length < 1):
      current_temp = 0;
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
  }
  let psi_needed = Math.abs(desired_psi - current_psi);

  let time_to_cure_temp = temp_needed / ideal_temp_change_rate;
  let time_to_cure_psi = psi_needed / ideal_psi_change_rate;
  let total_cure_time = (time_to_cure_temp + time_to_cure_psi) / 2;

  document.getElementById("fancy-predictor-content").innerHTML = "<div class='text-center'>" + time_to_cure_text + String(total_cure_time) + " MINUTES</div>";
  document.getElementById("fancy-predictor-graph").style.display = "block";
  setTimeout(function () {
    document.getElementById("fancy-predictor-graph").click();
  }, 100);
}