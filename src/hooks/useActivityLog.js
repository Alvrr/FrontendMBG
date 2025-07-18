import { useState, useEffect, useCallback } from 'react';

export const useActivityLog = (options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    maxActivities = 50
  } = options;

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Mock data untuk sementara
  const mockActivities = [
    {
      id: 1,
      type: 'transaction',
      title: 'Pembayaran Baru',
      description: 'Pembayaran dari pelanggan untuk produk ABC',
      user: 'Admin',
      timestamp: new Date().toISOString(),
      details: { amount: 150000 }
    },
    {
      id: 2,
      type: 'product',
      title: 'Produk Ditambahkan',
      description: 'Produk baru XYZ telah ditambahkan ke inventory',
      user: 'Admin',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: {}
    },
    {
      id: 3,
      type: 'customer',
      title: 'Pelanggan Baru',
      description: 'Pelanggan baru telah terdaftar',
      user: 'Kasir',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      details: {}
    }
  ];

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulasi delay API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Set mock data
      const limitedActivities = mockActivities.slice(0, maxActivities);
      setActivities(limitedActivities);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Gagal memuat aktivitas');
    } finally {
      setLoading(false);
    }
  }, [maxActivities]);

  const refresh = useCallback(async () => {
    await fetchActivities();
  }, [fetchActivities]);

  const getStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === today.getTime();
    });

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const weekActivities = activities.filter(activity => 
      new Date(activity.timestamp) >= thisWeek
    );

    return {
      total: activities.length,
      today: todayActivities.length,
      thisWeek: weekActivities.length
    };
  }, [activities]);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Auto refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchActivities, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchActivities]);

  return {
    activities,
    loading,
    error,
    lastUpdated,
    refresh,
    getStats
  };
};