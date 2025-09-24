import { CHAIN } from '@/constant';
import { create } from 'zustand';

const useStore = create((set: any) => ({
  count: 0,
  setCount: (count: number) => set({ count }),
  aptPrice: 1,
  setaptPrice: (aptPrice: any) => set({ aptPrice }),
  showModalConnectWallet: false,
  setShowModalConnectWallet: (showModalConnectWallet: boolean) =>
    set({ showModalConnectWallet }),
  showModalSuccess: false,
  setShowModalSuccess: (showModalSuccess: boolean) => set({ showModalSuccess }),
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  currentConnectedAccount: null as any,
  setCurrentConnectedAccount: (currentConnectedAccount: string) =>
    set({ currentConnectedAccount }),
  orderDetail: {} as any,
  setOrderDetail: (orderDetail: any) => set({ orderDetail }),
  selectedToken: undefined,
  setSelectedToken: (selectedToken: any) => set({ selectedToken }),
  showModalCreateOffer: false,
  setShowModalCreateOffer: (showModalCreateOffer: any) =>
    set({ showModalCreateOffer }),
  showModalTradeToken: false,
  setShowModalTradeToken: (showModalTradeToken: any) =>
    set({ showModalTradeToken }),
  showModalSelectToken: false,
  setShowModalSelectToken: (showModalSelectToken: any) =>
    set({ showModalSelectToken }),
  currentActiveChain: null as any,
  setCurrentActiveChain: (currentActiveChain: any) => set({ currentActiveChain }),
}));

export default useStore;
