import axios from "axios";
import { ISearchData } from "../reducers/searchReducer";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/",
  headers: {
    "Content-Type": "application/json",
    "cache-control": true,
  },
  withCredentials: true,
});

export const getSearchData = async (search: string) => {
  const result = await axiosInstance.get<ISearchData[]>("/sick", {
    params: {
      q: search,
    },
  });
  console.info("calling api");
  return result;
};
