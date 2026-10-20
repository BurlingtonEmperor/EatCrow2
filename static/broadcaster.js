let isBroadcasting = 0;

document.getElementById("close-broadcasting-window").onclick = function () {
  document.getElementById("broadcaster-window").style.display = "none";
}

if (localStorage.getItem("broadcast-status") == "on") {
  document.getElementById("broadcast-status").innerText = "BROADCASTING!";
}

document.getElementById("start-broadcast").onclick = function () {
  if (document.getElementById("broadcast-id").value == null || document.getElementById("broadcast-id").value == undefined || document.getElementById("broadcast-id").value.replace(/\s+/g, ' ').trim() == "") {
    return false;
  }
  localStorage.setItem("broadcast-id", document.getElementById("broadcast-id").value);
  isBroadcasting = 1;
  localStorage.setItem("broadcast-status", "on");
  document.getElementById("broadcast-status").innerText = "BROADCASTING!";
}

document.getElementById("stop-broadcast").onclick = function () {
  isBroadcasting = 0;
  localStorage.setItem("broadcast-status", "off");
  document.getElementById("broadcast-status").innerText = "NOT BROADCASTING";
}

function broadcastData () {
  
}