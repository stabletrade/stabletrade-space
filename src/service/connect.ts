import axios from 'axios';
import AxiosInstance from './api';

export const loginApi = async (params: any) => {
  const response = await AxiosInstance.post('/auth/login', params);
  const { data } = response;
  return data;
};
export const loginDiscord = async ({ ...params }: any) => {
  const url = `/user/login-by-discord`;
  const response = await AxiosInstance.post(url, { ...params });
  const { data } = response;
  return data;
};

export const loginTW = async ({ ...params }: any) => {
  const url = `/user/login-by-twitter`;
  const response = await AxiosInstance.post(url, { ...params });
  const { data } = response;
  return data;
};
