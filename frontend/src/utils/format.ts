export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date | string, format: string = 'MMM dd, yyyy'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Simple formatter for common formats
  const pad = (num: number): string => num.toString().padStart(2, '0');
  
  const formats: Record<string, string> = {
    'yyyy': d.getFullYear().toString(),
    'MM': pad(d.getMonth() + 1),
    'dd': pad(d.getDate()),
    'HH': pad(d.getHours()),
    'mm': pad(d.getMinutes()),
    'ss': pad(d.getSeconds()),
  };
  
  let result = format;
  Object.entries(formats).forEach(([key, value]) => {
    result = result.replace(key, value);
  });
  
  return result;
};
