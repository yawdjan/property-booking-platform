// Helper utility functions

export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  return (Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))) + 1;
};

export const calculateBookingTotal = (nightlyRate, nights, cleaningFee) => {
  return (nightlyRate * nights) + cleaningFee;
};

export const calculateCommission = (totalAmount, commissionRate) => {
  return (totalAmount * commissionRate) / 100;
};

export const getCommissionRate = (agent, property, globalRate) => {
  // Option B: Agent-specific → Property default → Global default
  if (agent?.commissionRate !== null && agent?.commissionRate !== undefined) {
    return agent.commissionRate;
  }
  if (property?.commissionRate) {
    return property.commissionRate;
  }
  return globalRate;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const isDateBooked = (date, bookings, propertyId) => {
  if (!date) return false;
  const dateStr = date.toISOString().split('T')[0];
  return bookings.some(b => 
    b.propertyId === propertyId &&
    b.status === 'Booked' &&
    dateStr >= b.checkIn && dateStr < b.checkOut
  );
};

export const getMinCheckInDate = () => {
  // 24 hours minimum notice
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  return minDate.toISOString().split('T')[0];
};

export const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  
  // Add empty days for the first week
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }
  
  // Add all days in the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  return days;
};