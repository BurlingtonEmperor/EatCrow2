from Arduino import Arduino;

try:
  board = Arduino();
  print("yay");
except:
  print("no");
