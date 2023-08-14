import { BASE_URL } from "../Constants";
import axios from "axios";

export const ApiCall = async ({ params, route, verb, token, baseurl }) => {
  try {
    let url = null;
    if (baseurl === false) {
      url = route;
    } else {
      url = `${BASE_URL}/${route}`;
    }

    let headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let response = null;

    switch (verb) {
      case "get":
        const queryString = Object.keys(params)
          .map(
            (key) =>
              encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
          )
          .join("&");
        response = await axios.get(`${url}?${queryString}`, { headers });
        break;
      case "post":
        response = await axios.post(url, params, { headers });
        break;
      case "put":
        response = await axios.put(url, params, { headers });
        break;
      case "patch":
        response = await axios.patch(url, params, { headers });
        break;
      case "delete":
        const queryStr = Object.keys(params)
          .map(
            (key) =>
              encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
          )
          .join("&");
        response = await axios.delete(`${url}?${queryStr}`, {
          headers,
          params,
        });
        break;
      default:
        return { status: 400, response: "Method not found" };
    }

    if (response) {
      return { status: response.status, response: response.data };
    } else {
      return response;
    }
  } catch (error) {
    return {
      status: error.response ? error.response.status : 400,
      response: error.response
        ? error.response.data
        : { message: error.toString() },
    };
  }
};
