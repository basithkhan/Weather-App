const http = require("http");
const fs = require("fs");
const axios = require("axios");
const homeFile = fs.readFileSync("home.html", "utf-8");

const replaceValues = (template, data) => {
  return template.replace(/{%(\w+)%}/g, (_, key) => data[key]);
};


const getWeatherData = async () => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather?q=Hyderabad&appid=ed7345d8ce6c6eee3cca4b5a648260bb"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    throw error;
  }
};

const server = http.createServer(async (req, res) => {
    if (req.url === "/") {
        try {
            const weatherData = await getWeatherData();

            // Convert temperature values from Kelvin to Celsius
            const kelvinToCelsius = (kelvin) => kelvin - 273.15;
            const celsiusTemp = kelvinToCelsius(weatherData.main.temp);
            const celsiusTempMin = kelvinToCelsius(weatherData.main.temp_min);
            const celsiusTempMax = kelvinToCelsius(weatherData.main.temp_max);

            const replacedHtml = replaceValues(homeFile, {
                tempval: `${celsiusTemp.toFixed(1)}&deg;C`,
                tempmin: `${celsiusTempMin.toFixed(1)}&deg;C`,
                tempmax: `${celsiusTempMax.toFixed(1)}&deg;C`,
                location: weatherData.name,
                country: weatherData.sys.country,
            });

            res.writeHead(200, { "Content-type": "text/html" });
            res.write(replacedHtml);
            console.log(replacedHtml);
        } catch (error) {
            res.writeHead(500, { "Content-type": "text/html" });
            res.end("<h1>500 Internal Server Error</h1>");
        }
    } else {
        res.writeHead(404, { "Content-type": "text/html" });
        res.end("<h1>404 Not Found</h1>");
    }
    res.end();
});


const PORT = 8000;
const HOST = "127.0.0.1";

server.listen(PORT, HOST, () => {
  console.log(`Server is running on local host ${PORT}`);
});
