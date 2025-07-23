import useSWR from 'swr';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  status?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useNotifications(userId: string | undefined) {
  const { data, error, mutate } = useSWR<Notification[]>(
    userId ? `/api/admin/notifications?userId=${userId}` : null,
    fetcher,
    { refreshInterval: 10000 } // Poll every 10s for real-time updates
  );

  const markAsRead = async (id: string) => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    mutate();
  };

  return {
    notifications: data || [],
    isLoading: !error && !data,
    isError: error,
    markAsRead,
    refetch: mutate,
  };
} 