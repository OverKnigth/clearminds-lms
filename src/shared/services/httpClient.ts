// Single Axios instance — única instancia HTTP del proyecto
// Todos los adapters importan desde aquí, nunca crean su propio cliente
export { api, API_ENDPOINTS, apiClient } from './api';
