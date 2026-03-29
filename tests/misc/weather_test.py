# as of 3/9/2026, the weather module doesn't seem to work.

import python_weather
import asyncio

async def get_weather():
  async with python_weather.Client(unit=python_weather.IMPERIAL) as client:
    weather = await client.get('New York')
    print(f"Current Condition: {weather.description}")
    print(f"Weather Kind: {weather.kind}")

asyncio.run(get_weather())
