import axios from 'axios';

const instance = axios.create({
  baseURL: '/api', // your backend prefix
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Optional: auth / error interceptors
instance.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default instance;
