import { fetchAllTxs, fetchListPool, fetchNewTxs } from '@/service/pool';
import useStore from '@/store';
import { useQuery } from '@tanstack/react-query';

export const useGetListPool = ({ ...params }: any) => {
  const currentActiveChain = useStore((state) => state.currentActiveChain);
  return useQuery({
    queryKey: ['poolList', { ...params }],
    queryFn: async (data) => {
      try {
        return fetchListPool({ ...params });
      } catch (error) {
        console.log(error);
      }
    },
  });
};

export const useGetListTxs = ({ enabled, ...params }: any) => {
  const currentActiveChain = useStore((state) => state.currentActiveChain);
  return useQuery({
    queryKey: ['allTxsList', { ...params }],
    queryFn: async (data) => {
      try {
        return fetchAllTxs({ ...params });
      } catch (error) {
        console.log(error);
      }
    },
    enabled,
  });
};

export const useGetNewTxs = ({ ...params }: any) => {
  const currentActiveChain = useStore((state) => state.currentActiveChain);
  return useQuery({
    queryKey: ['newTxsList', { ...params }],
    queryFn: async (data) => {
      try {
        return fetchNewTxs({ ...params });
      } catch (error) {
        console.log(error);
      }
    },
  });
};
