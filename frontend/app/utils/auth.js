export const handleSessionExpiration = () => {
    // Clear local storage
    localStorage.clear();
  
    // Redirect to login page
    window.location.href = '/';
  };
  