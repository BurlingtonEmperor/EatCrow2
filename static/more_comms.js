function createAutoclaveLog (t_data, p_data, u_mode, ex_temp, d_batt, date_n_time, warning_list, ti_data) {
  let data_to_send_to_Logger = [];
  data_to_send_to_Logger.push("Temperature Data (°F): " + JSON.stringify(t_data));
  data_to_send_to_Logger.push("Pressure Data (PSI): " + JSON.stringify(p_data));
  data_to_send_to_Logger.push("Minutes: " + JSON.stringify(ti_data));
  data_to_send_to_Logger.push("Usage Mode: " + u_mode);
  data_to_send_to_Logger.push("External Temperature: " + ex_temp);
  data_to_send_to_Logger.push("Device Battery: " + d_batt);
  data_to_send_to_Logger.push("Date and Time: " + date_n_time);
  data_to_send_to_Logger.push("Warnings: " + JSON.stringify(warning_list));

  fetch ("/create_log_auto", {
    method : "POST",
    headers : {
      "Content-Type" : "application/json"
    },
    body : JSON.stringify({
      log_data : data_to_send_to_Logger
    })
  })
  .then(response => response.text())
  .then(data => {
    if (String(data).includes("File Error")) {
      console.error(data);
    }

    else {
      console.log(data);
    }
  })
  .catch(error => {
    console.error(error);
  });
}