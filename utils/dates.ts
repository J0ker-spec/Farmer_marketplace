// Date utilities for freshness calculation

export const getDaysSinceHarvest = (harvestDate: Date): number => {
  const now = new Date();
  const harvest = new Date(harvestDate);
  const diffTime = Math.abs(now.getTime() - harvest.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getFreshnessStatus = (harvestDate: Date): {
  status: 'very-fresh' | 'fresh' | 'check';
  label: string;
  color: string;
} => {
  const days = getDaysSinceHarvest(harvestDate);
  
  if (days <= 3) {
    return {
      status: 'very-fresh',
      label: 'Very Fresh',
      color: '#22C55E',
    };
  } else if (days <= 7) {
    return {
      status: 'fresh',
      label: 'Fresh',
      color: '#EAB308',
    };
  } else {
    return {
      status: 'check',
      label: 'Check with farmer',
      color: '#F97316',
    };
  }
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-SL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('en-SL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
