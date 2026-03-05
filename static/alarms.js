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
    case 3:
      alarmPath = "/static/alarms/vacuuum.wav";
      break;
    case 4:
      alarmPath = "/static/alarms/voiceinput4.wav";
      break;
  }

  // setTimeout(function () {
  const audio = new Audio(alarmPath);
  audio.play();
  // }, 100);
}