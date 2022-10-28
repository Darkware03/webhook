import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const instance = axios.create({
  baseURL: process.env.EXTERNAL_API,
  timeout: 8000,
});

const httpClient = async (url, data = {}, method = 'get', headers = {}) => instance({
  method,
  url,
  data,
  headers,
});

export default httpClient;
