const DEFAULT_API_URL = import.meta.env.PROD ? 'https://mt-id-api.onrender.com' : 'http://localhost:8081'

export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')
export const API_HOST = API_URL.replace(/^https?:\/\//, '')