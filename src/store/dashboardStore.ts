import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChannelMetrics {
  channelName: string;
  views: number;
  viewsChange: number;
  engagement: number;
  engagementChange: number;
  subscribers: number;
  subscribersChange: number;
}

interface DashboardStore {
  channelMetrics: ChannelMetrics | null;
  setChannelMetrics: (metrics: ChannelMetrics | null) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      channelMetrics: null,
      setChannelMetrics: (metrics) => set({ channelMetrics: metrics }),
    }),
    {
      name: 'dashboard-storage',
    }
  )
);