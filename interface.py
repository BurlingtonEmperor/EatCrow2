from flask import Flask, render_template, request, jsonify;
from threading import Timer;
from Arduino import Arduino;

from eatcrow import *;

import webbrowser;
import time;
import os;
import tempfile;
import requests;

import serial.tools.list_ports;
import serial;

from meteostat import Point, Daily;
from datetime import datetime;
from geo_city_locator import get_nearest_city

import pandas as pd;
import asyncio

URL = "http://127.0.0.1:5000";
app = Flask(__name__);
board = "";

temp_file_path = os.path.join(tempfile.gettempdir(), 'os_output.txt');
def clean_exit_file():
  try:
    os.remove(temp_file_path);
  except OSError:
    pass;

def alternate_board_find(vendor_id):
  arduino_port = None;
  ports = serial.tools.list_ports.comports();

  for port in ports:
    if port.vid == vendor_id:
      arduino_port = port.device;
      break;
    elif 'Arduino' in port.description:
      arduino_port = port.device;
      break;
    
  if not arduino_port:
    return None;
    
  return arduino_port;

def get_coord_from_ip():
  try:
    response_coord_ip = requests.get("https://ipinfo.io");
    coord_data = response_coord_ip.json();
    coord_loc = coord_data.get("loc").split(",");
    coord_lat = float(coord_loc[0]);
    coord_long = float(coord_loc[1]);

    return coord_lat, coord_long;
  except Exception as e:
    print("Error: " + str(e));
    return e;

def get_temp():
  current_temp_time = datetime.now();
  current_offset_temp_time = current_temp_time - pd.DateOffset(days = 1);

  get_lat_long = get_coord_from_ip();
  if ("Error" in str(get_lat_long) or "error" in str(get_lat_long)):
    return "endpoint_error";

  current_location = Point(get_lat_long[0], get_lat_long[1]);

  loc_temp_data = Daily(current_location, current_offset_temp_time, current_temp_time);
  loc_temp_data = loc_temp_data.fetch();

  if (not loc_temp_data.empty):
    get_avg_temp = loc_temp_data["tavg"].iloc[-1];
    return str(get_avg_temp);
  else:
    return "loc_error";

def get_city():
  get_lat_long = get_coord_from_ip()
  nearest_city = get_nearest_city(get_lat_long[0], get_lat_long[1])

  return nearest_city

# async def get_weather() -> None:
#   async with python_weather.Client(unit=python_weather.IMPERIAL) as client

@app.route('/')
def index():
  return render_template("index.html");

@app.route('/boards')
def boards():
  """
  command = "arduino-cli board list";
  result = subprocess.check_output(command, shell=True, text=True);
  """; # for some reason permissions with this command are wonky

  command = f"arduino-cli board list > {temp_file_path} 2>&1";
  exit_status = os.system(command);

  if exit_status == 1:
    try:
      with open(temp_file_path, 'r') as f:
        output = f.read();
        clean_exit_file();
        return output;
    except FileNotFoundError:
      clean_exit_file();
      return "file_not_found";
  else:
    clean_exit_file();
    return str(exit_status);

@app.route('/find_board')
def find_board():
  global board;

  # checkWhichPlatform();
  
  try:
    board = Arduino("115200", port=COM_PORT);
  except ValueError as e:
    # print(e);
    if ("Could not find port" in str(e)):
      return "port_not_found";
    else:
      return "not_found";

@app.route('/afind_board', methods=['POST'])
def afind_board():
  afind_board_data = request.get_json();
  custom_vendor_id = afind_board_data.get("vendor_id");
  
  return str(alternate_board_find(custom_vendor_id));

@app.route('/get_tempat')
def get_tempat():
  return get_temp();

@app.route('/get_coord')
def get_coord():
  return str(get_coord_from_ip());

def open_browser():
  checkWhichPlatform();
  webbrowser.open_new(URL);

if __name__ == '__main__':
  Timer(1, open_browser).start();
    
  app.run(port=5000, debug=True, use_reloader=False);
  
