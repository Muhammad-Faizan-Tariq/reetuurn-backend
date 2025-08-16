export const calculateTotalPrice = (packages) => {
  const prices = { small: 2.9, medium: 3.2, large: 3.6 };
  return packages.reduce((sum, p) => sum + (prices[p.size] || 0), 0);
};
