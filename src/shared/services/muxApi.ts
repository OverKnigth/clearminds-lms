import { apiClient } from './httpClient';

export const muxApi = {
  createUploadUrl: async (title?: string): Promise<{ uploadId: string; uploadUrl: string }> => {
    const response = await apiClient.post('/admin/mux/upload-url', { title });
    return response.data.data;
  },

  getUploadStatus: async (uploadId: string) => {
    const response = await apiClient.get(`/admin/mux/upload/${uploadId}`);
    return response.data.data;
  },

  importFromUrl: async (url: string, title?: string): Promise<{ assetId: string; status: string; playbackId: string | null }> => {
    const response = await apiClient.post('/admin/mux/import-url', { url, title });
    return response.data.data;
  },

  getAssetStatus: async (assetId: string): Promise<{ assetId: string; status: string; playbackId: string | null; duration: number | null }> => {
    const response = await apiClient.get(`/admin/mux/asset/${assetId}`);
    return response.data.data;
  },

  checkPlayback: async (playbackId: string): Promise<{ ready: boolean; reason?: string; playbackId: string }> => {
    const response = await apiClient.get(`/mux/playback/${playbackId}`);
    return response.data.data;
  },
};
