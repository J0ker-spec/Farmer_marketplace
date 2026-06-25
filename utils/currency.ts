// Currency formatting for Sierra Leonean Leones

export const formatLeones = (amount: number): string => {
  return `Le ${amount.toLocaleString('en-SL')}`;
  // Output: "Le 1,200,000"
};

export const parseLeones = (formatted: string): number => {
  // Parse "Le 1,200,000" back to 1200000
  const numeric = formatted.replace(/[^0-9.-]/g, '');
  return parseFloat(numeric);
};
