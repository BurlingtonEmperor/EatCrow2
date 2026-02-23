function playAlarm (alarmNum) {
  let alarmPath;
  switch (alarmNum) {
    case 0:
    default:
      alarmPath = "/static/alarms/temp.wav";
      break;
  }

  // setTimeout(function () {
  const audio = new Audio(alarmPath);
  audio.play();
  // }, 100);
}