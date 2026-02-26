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