import { authApi } from './authApi';
import { adminApi } from './adminApi';
import { tutorApi } from './tutorApi';
import { studentApi } from './studentApi';
import { contentApi } from './contentApi';
import { reportsApi } from './reportsApi';
import { muxApi } from './muxApi';

// Unified api object — backwards compatibility for all existing imports
export const api = Object.assign(
  {},
  authApi,
  adminApi,
  tutorApi,
  studentApi,
  contentApi,
  reportsApi,
  {
    muxCreateUploadUrl: muxApi.createUploadUrl,
    muxGetUploadStatus: muxApi.getUploadStatus,
    muxImportFromUrl: muxApi.importFromUrl,
    muxGetAssetStatus: muxApi.getAssetStatus,
    muxCheckPlayback: muxApi.checkPlayback,
  }
);

export { apiClient, GOOGLE_CLIENT_ID } from './httpClient';
export { authApi } from './authApi';
export { adminApi } from './adminApi';
export { tutorApi } from './tutorApi';
export { studentApi } from './studentApi';
export { contentApi } from './contentApi';
export { reportsApi } from './reportsApi';
export { muxApi } from './muxApi';
