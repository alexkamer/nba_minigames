export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};
