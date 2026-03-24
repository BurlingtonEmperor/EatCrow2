import serial;
import time;
import os;

def send_file_to_arduino (file_dir, baud_rate, serial_port):
  try:
    with open(str(os.path.dirname(os.path.realpath(__file__))) + str(file_dir), "r") as f:
      content = f.read()
    
    content = "^" + content
    bytecode_content = content.encode('utf-8')

    ser = serial.Serial(serial_port, baud_rate, timeout=1)
    time.sleep(2)

    ser.write(bytearray(bytecode_content))
    ser.close()

  except Exception as err:
    return "File error: " + str(err)