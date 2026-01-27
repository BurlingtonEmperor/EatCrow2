function console_help () {
  console.log('console_help(); - returns a list of commands');
  console.log('console_clear(); - clears the console');
  console.log('send_signal_to_board([YOUR SIGNAL NUMBER]); - sends signal to board')
}

function console_clear () {
  manualCommandConsole.innerHTML = "";
}

function escapeHtml (unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// setInterval(function () {
//   if (manualCommandConsole.scrollHeight > 1000000) {
//     manAutoArray = String(manualCommandConsole.innerHTML).split("</p>");
//   }
// }, 10000);