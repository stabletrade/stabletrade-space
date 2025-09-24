import AxiosInstance from './api';

export const getTask = async (data?: any) => {
  const res = await AxiosInstance.get('/task/get-all', {
    params: data,
  });
  return res.data;
};

export const checkTask = async (id?: any) => {
  const res = await AxiosInstance.post(`/task/check-task/${id}`);
  return res.data;
};

export const getReward = async (data?: any) => {
  const res = await AxiosInstance.get('/users/reward', {
    params: data,
  });
  return res.data;
};

export const signClaimReward = async (params?: any) => {
  const res = await AxiosInstance.post('/reward/sign-claim-reward', params);
  return res.data;
};

export const signClaimRewardStake = async (params?: any) => {
  const res = await AxiosInstance.post('/reward/sign-claim-staking-reward', params);
  return res.data;
};
