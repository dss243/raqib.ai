export const loginWithReddit = () => {
    window.location.href = 'http://localhost:8000/login/reddit';
  };
  
  export const getAuthToken = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('access_token');
  };
  
  export const getStoredCredentials = () => {
    const creds = localStorage.getItem('reddit_user');
    return creds ? JSON.parse(creds) : null;
  };
  
  export const clearCredentials = () => {
    localStorage.removeItem('reddit_token');
    localStorage.removeItem('reddit_user');
  };
  
  // Removed duplicate clearCredentials function
  export const getAccessToken = () => {
    return localStorage.getItem('reddit_access_token');
  };
  
  export const handleOAuthCallback = () => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    
    if (accessToken) {
      localStorage.setItem('reddit_access_token', accessToken);
      localStorage.setItem('reddit_username', params.get('user_name'));
      localStorage.setItem('reddit_user_id', params.get('user_id'));
      localStorage.setItem('reddit_avatar', params.get('icon_img'));
      
      // Clean the URL
      window.history.replaceState({}, document.title, '/dashboard');
    }
    
    return accessToken;
  };
  
  export const logout = () => {
    localStorage.removeItem('reddit_access_token');
    localStorage.removeItem('reddit_username');
    localStorage.removeItem('reddit_user_id');
    localStorage.removeItem('reddit_avatar');
    window.location.href = '/login';
  };