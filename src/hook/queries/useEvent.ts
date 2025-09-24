import { checkTask, getReward, getTask } from '@/service/event';
import useStore from '@/store';
import { messageError, messageSuccess } from '@/utils/message';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetListTask = ({ ...params }: any) => {
  return useQuery({
    queryKey: ['taskList', params],
    queryFn: async (data) => {
      try {
        return getTask(params);
      } catch (error) {
        console.log(error);
      }
    },
  });
};

export const useCheckTask = () => {
  return useMutation({
    mutationFn: checkTask,
    onSuccess: () => {
      messageSuccess('Success!');
    },
    onError: (error: any) => {
      console.log(error);
      messageError(error?.message || 'Something went wrong!');
    },
  });
};

export const useGetReward = ({ ...params }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['reward', params],
    queryFn: async (data) => {
      try {
        return getReward(params);
      } catch (error) {
        console.log(error);
      }
    },
    enabled: isAuthenticated,
  });
};
