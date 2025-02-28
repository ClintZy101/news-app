import {create} from 'zustand';

const useUserStore = create((set) => ({
  user: {
    email: localStorage.getItem('email') || '',
    role: localStorage.getItem('role') || '',
    token: localStorage.getItem('token') || '',
  },
  setUser: (user) => {
    localStorage.setItem('email', user.email);
    localStorage.setItem('role', user.role);
    localStorage.setItem('token', user.token);
    set({ user });
  },
  clearUser: () => {
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    set({ user: { email: '', role: '', token: '' } });
  },
}));

export default useUserStore;
