export const formatDateToIST = (dateString) => {
  if (!dateString) return "N/A";
  
  const options = { 
    timeZone: "Asia/Kolkata", 
    year: "numeric", 
    month: "2-digit", 
    day: "2-digit" 
  };
  
  return new Date(dateString).toLocaleDateString("en-IN", options);
};

export const formatDateTimeToIST = (dateString) => {
    if (!dateString) return "N/A";
    
    const options = { 
      timeZone: "Asia/Kolkata", 
      year: "numeric", 
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    };
    
    return new Date(dateString).toLocaleString("en-IN", options);
  };
