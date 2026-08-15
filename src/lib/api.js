import axios from 'axios'
import { getErrorMessage } from './errors'
import { API_URL } from './env'

export const ACCESS_KEY = 'mtid.accessToken'
export const REFRESH_KEY = 'mtid.refreshToken'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

const raw = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

function read(key) {
  return sessionStorage.getItem(key)
}

function writeTokens(accessToken, refreshToken) {
  if (accessToken) sessionStorage.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
}

export function persistSession(payload) {
  writeTokens(payload.accessToken, payload.refreshToken)
  return payload
}

api.interceptors.request.use((config) => {
  const token = read(ACCESS_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

let refreshPromise = null

async function refreshSession() {
  const refreshToken = read(REFRESH_KEY)
  if (!refreshToken) {
    throw new Error('Sessão expirada.')
  }
  const { data } = await raw.post('/api/v1/auth/owners/refresh', null, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  })
  persistSession(data)
  return data.accessToken
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = refreshSession().finally(() => {
            refreshPromise = null
          })
        }
        const accessToken = await refreshPromise
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch {
        clearTokens()
      }
    }
    return Promise.reject(error)
  },
)

export const ownerAuth = {
  login: (email, password) => api.post('/api/v1/auth/owners/token', { email, password }),
  google: (idToken) => api.post('/api/v1/auth/owners/google-token', { idToken }),
  logout: () =>
    raw.post('/api/v1/auth/owners/logout', null, {
      headers: { Authorization: `Bearer ${read(REFRESH_KEY) || read(ACCESS_KEY)}` },
    }),
}

export const owners = {
  me: () => api.get('/api/v1/owner/me'),
  create: (body) => api.post('/api/v1/owner/create', body),
  updateMe: (body) => api.patch('/api/v1/owner/me', body),
  attachAddress: (body) => api.patch('/api/v1/owner/me/address', body),
  removeAddress: (index) => api.delete(`/api/v1/owner/me/address/${index}`),
  uploadPhoto: (file) => {
    const body = new FormData()
    body.append('image', file)
    return api.post('/api/v1/owner/me/images/PROFILE', body)
  },
  removePhoto: () => api.delete('/api/v1/owner/me/images/PROFILE'),
  sendVerification: (ownerId, email) => api.post(`/api/v1/owner/${ownerId}/email/verification/send`, { email }),
  forgotPassword: (email) => api.post('/api/v1/owner/password/forgot', { email }),
}

export const addresses = {
  lookup: (country, zipCode, params = {}) =>
    api.get(`/api/v1/addresses/${String(country).toLowerCase()}/${encodeURIComponent(zipCode)}`, { params }),
}

export const apps = {
  list: () => api.get('/api/v1/client-applications'),
  get: (appId) => api.get(`/api/v1/client-applications/${appId}`),
  create: (body) => api.post('/api/v1/client-applications/create', body),
  update: (body) => api.patch('/api/v1/client-applications/settings', body),
  rotateSecret: (appId) => api.patch(`/api/v1/client-applications/${appId}/rotate-secret`),
  disable: (appId) => api.patch(`/api/v1/client-applications/${appId}/disable`),
  enable: (appId) => api.patch(`/api/v1/client-applications/${appId}/enable`),
  addOwners: (body) => api.patch('/api/v1/client-applications/add-owner', body),
  updateOwnerRole: (appId, ownerId, role) =>
    api.patch(`/api/v1/client-applications/${appId}/owners/${ownerId}`, { role }),
  removeOwner: (appId, ownerId) => api.delete(`/api/v1/client-applications/${appId}/owners/${ownerId}`),
}

export const roles = {
  list: (appId) => api.get(`/api/v1/user-roles/app/${appId}`),
  create: (appId, roleName) => api.post(`/api/v1/user-roles/app/${appId}/create`, { roleName }),
  update: (appId, body) => api.patch(`/api/v1/user-roles/app/${appId}/update`, body),
  remove: (userRoleId) => api.delete(`/api/v1/user-roles/${userRoleId}`),
}

export { getErrorMessage, API_URL }
