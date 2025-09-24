import { getUserProfileApi, getUserStake } from '@/service/token';
import useStore from '@/store';
import { useQuery } from '@tanstack/react-query';

export const GET_USER_PROFILE_KEY = ['user', 'profile'];

export const useUserProfile = () => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: GET_USER_PROFILE_KEY,
    queryFn: async (data) => {
      try {
        return getUserProfileApi({});
      } catch (error) {
        console.log(error);
      }
    },
    enabled: isAuthenticated,
  });
};

export const useUserStake = () => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['user', 'stake'],
    queryFn: async (data) => {
      try {
        return getUserStake({});
      } catch (error) {
        console.log(error);
      }
    },
    enabled: isAuthenticated,
  });
};
