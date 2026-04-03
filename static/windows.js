const window_elements = document.querySelectorAll('.window');
let min_window_zIndex = 101;

window_elements.forEach(window_element => {
  window_element.addEventListener('click', () => {
    for (let i = 0; i < window_elements.length; i++) {
      window_elements[i].style.zIndex = String(min_window_zIndex);
    }

    window_element.style.zIndex = String(min_window_zIndex + 1);
  });
});

let createdWindows = 0;
function createNotificationWindow (notificationText) { 
  createdWindows++;
  const notificationWindow = document.createElement("div");

  notificationWindow.classList.add("window");
  notificationWindow.classList.add("notification-window");
  notificationWindow.classList.add("draggable");

  notificationWindow.innerHTML = `<div class='twenty button btn-class close-notification-window' onclick='document.getElementById("container").removeChild(document.getElementById("notification-window` + String(createdWindows) + `"));'>CLOSE WINDOW</div><br/><div class='text-center'>` + notificationText + `</div>`;
  notificationWindow.id = "notification-window" + createdWindows;

  notificationWindow.style.position = "fixed";
  
  document.getElementById("container").appendChild(notificationWindow);
  $(notificationWindow).draggable();
}