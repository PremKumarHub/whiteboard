const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth API
  async register(username, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, email, password }),
    });
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Room API
  async createRoom(name, isPrivate = false, passcode = '', maxUsers = 50) {
    const res = await fetch(`${API_BASE_URL}/rooms/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, isPrivate, passcode, maxUsers }),
    });
    return res.json();
  },

  async getRoomDetails(roomId) {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async verifyPasscode(roomId, passcode) {
    const res = await fetch(`${API_BASE_URL}/rooms/verify-passcode`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ roomId, passcode }),
    });
    return res.json();
  },

  async listPublicRooms() {
    const res = await fetch(`${API_BASE_URL}/rooms`, {
      headers: getHeaders(),
    });
    return res.json();
  },
};
