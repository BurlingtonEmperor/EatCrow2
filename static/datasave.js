// time_values
// temp_values
// psi_values
// sram

if (localStorage.getItem("time_values") !== null) {
  time_values = JSON.parse(localStorage.getItem("time_values"));
}

if (localStorage.getItem("temp_values") !== null) {
  temp_values = JSON.parse(localStorage.getItem("temp_values"));
}

if (localStorage.getItem("temp2_values") !== null) {
  temp2_values = JSON.parse(localStorage.getItem("temp2_values"));
}

if (localStorage.getItem("psi_values") !== null) {
  pressure_values = JSON.parse(localStorage.getItem("psi_values"));
}