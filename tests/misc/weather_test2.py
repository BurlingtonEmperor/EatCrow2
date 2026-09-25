import requests


def get_weather(city: str):
  url = f"https://wttr.in/{city}?format=3"
  response = requests.get(url)
  return response.text.strip()


# Example usage for the nearest city
city_name = "Lubbock"
print(get_weather(city_name))