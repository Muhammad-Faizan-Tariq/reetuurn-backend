export const generateOrderNumber = () => {
  return `RTN-${Date.now()}`;
};

export const generatePIN = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
