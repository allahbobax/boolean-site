const API_URL = 'https://api.booleanclient.ru'

// API functions for license keys
export const getLicenseKeys = async () => {
  try {
    const response = await fetch(`${API_URL}/api/keys`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return { success: false, message: 'Failed to fetch keys' };
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};

export const createLicenseKeys = async (keys: any[]) => {
  try {
    const response = await fetch(`${API_URL}/api/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keys }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return { success: false, message: 'Failed to create keys' };
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};

export const activateLicenseKey = async (key: string, userId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/keys?action=activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, userId }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    const errorData = await response.json();
    return errorData;
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};

export const deleteLicenseKey = async (keyId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/keys?id=${keyId}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return { success: false, message: 'Failed to delete key' };
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};
