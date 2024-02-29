import axios from "axios";

export const api = axios.create({
  baseURL: "https://app.flexconsulta.com.br/_api",
});

export const geoMaps = axios.create({
  baseURL: "https://maps.googleapis.com/maps/api/geocode",
});
