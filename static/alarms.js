function playAlarm (alarmNum) {
  let alarmPath;
  switch (alarmNum) {
    case 0:
    default:
      alarmPath = "/static/alarms/temp.wav";
      break;
    case 1:
      alarmPath = "/static/alarms/psi.wav";
      break;
    case 2:
      alarmPath = "/static/alarms/caution.wav";
      break;
  }

  // setTimeout(function () {
  const audio = new Audio(alarmPath);
  audio.play();
  // }, 100);
}