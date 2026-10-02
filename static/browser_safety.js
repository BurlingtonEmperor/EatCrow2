window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = '';
});

let enableBrowserSafety = true;
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (isConnectedToBoard == true && enableBrowserSafety == true) {
      navigator.sendBeacon('/send_signal_to_board', 's');
    }
  }
});