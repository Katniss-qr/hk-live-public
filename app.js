import { formatTemp, formatAqhi, nextTrain } from "./format.js";

const WEATHER_URL =
  "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en";
const FETCH_TIMEOUT_MS = 10000;
const ERROR_MESSAGE =
  "Unable to fetch weather data. Please check your connection and reload.";

const weatherStatus = document.getElementById("weather-status");
const weatherTemp = document.getElementById("weather-temp");
const weatherUpdated = document.getElementById("weather-updated");
const weatherError = document.getElementById("weather-error");

function showWeatherError() {
  weatherStatus.textContent = "Unavailable";
  weatherStatus.classList.add("is-error");
  weatherTemp.innerHTML = "—";
  weatherUpdated.textContent = "";
  weatherError.hidden = false;
  weatherError.textContent = ERROR_MESSAGE;
}

function splitDisplay(text) {
  const index = text.indexOf("\n");
  if (index === -1) {
    return { main: text, detail: "" };
  }

  return {
    main: text.slice(0, index),
    detail: text.slice(index + 1)
  };
}

function unitHtml(main) {
  const match = /^(-?\d+(?:\.\d+)?)°([A-Za-z]+)$/.exec(main);
  if (!match) {
    return main;
  }

  return `${match[1]}<span>°${match[2]}</span>`;
}

async function loadWeather() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(WEATHER_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    const data = await response.json();
    const { main, detail } = splitDisplay(formatTemp(data));

    weatherStatus.textContent = "Live";
    weatherStatus.classList.remove("is-error");
    weatherTemp.innerHTML = unitHtml(main);
    weatherUpdated.textContent = detail;
    weatherError.hidden = true;
    weatherError.textContent = "";
  } catch (error) {
    showWeatherError();
  } finally {
    clearTimeout(timeoutId);
  }
}

const AQ_URL = "https://dashboard.data.gov.hk/api/aqhi-individual?format=json";
const AQ_STATION_NAME = "Central/Western";
const AQ_ERROR_MESSAGE = "Unable to fetch air quality data.";

const aqStatus = document.getElementById("aq-status");
const aqStation = document.getElementById("aq-station");
const aqValue = document.getElementById("aq-value");
const aqRisk = document.getElementById("aq-risk");
const aqError = document.getElementById("aq-error");

function showAirQualityError() {
  aqStatus.textContent = "Unavailable";
  aqStatus.classList.add("is-error");
  aqStation.textContent = AQ_STATION_NAME;
  aqValue.textContent = "—";
  aqRisk.textContent = "";
  aqError.hidden = false;
  aqError.textContent = AQ_ERROR_MESSAGE;
}

async function loadAirQuality() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(AQ_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error("Air quality request failed");
    }

    const data = await response.json();
    const { main, detail } = splitDisplay(formatAqhi(data));

    aqStatus.textContent = "Live";
    aqStatus.classList.remove("is-error");
    aqStation.textContent = AQ_STATION_NAME;
    aqValue.textContent = main;
    aqRisk.textContent = detail;
    aqError.hidden = true;
    aqError.textContent = "";
  } catch (error) {
    showAirQualityError();
  } finally {
    clearTimeout(timeoutId);
  }
}

const MTR_URL =
  "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=ISL&sta=HKU";
const MTR_ERROR_MESSAGE = "Unable to fetch MTR data";

const mtrStatus = document.getElementById("mtr-status");
const mtrMins = document.getElementById("mtr-mins");
const mtrDest = document.getElementById("mtr-dest");
const mtrError = document.getElementById("mtr-error");

function showMtrFetchError() {
  mtrStatus.textContent = "Unavailable";
  mtrStatus.classList.add("is-error");
  mtrMins.textContent = "—";
  mtrDest.textContent = "";
  mtrError.hidden = false;
  mtrError.textContent = MTR_ERROR_MESSAGE;
}

function showMtrSpecial(message) {
  mtrStatus.textContent = "Unavailable";
  mtrStatus.classList.add("is-error");
  mtrMins.textContent = "—";
  mtrDest.textContent = message;
  mtrError.hidden = true;
  mtrError.textContent = "";
}

async function loadMtr() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(MTR_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error("MTR request failed");
    }

    const payload = await response.json();
    const text = nextTrain(payload);

    if (!text.includes("\n")) {
      showMtrSpecial(text);
      return;
    }

    const { main, detail } = splitDisplay(text);

    mtrStatus.textContent = "Live";
    mtrStatus.classList.remove("is-error");
    mtrMins.innerHTML = `${main}<span>min</span>`;
    mtrDest.textContent = detail;
    mtrError.hidden = true;
    mtrError.textContent = "";
  } catch (error) {
    showMtrFetchError();
  } finally {
    clearTimeout(timeoutId);
  }
}

loadWeather();
loadAirQuality();
loadMtr();
