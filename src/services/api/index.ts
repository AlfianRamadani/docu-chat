import { AxiosInstance } from '../../../utils/AxiosInstance';

export const uploadToStorage = async (formData: FormData, onProgress: (progress: number) => void) => {
  const response = AxiosInstance.post('/upload', formData, {
    onUploadProgress: progressEvent => {
      const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
      onProgress(progress);
    }
  });
  return response;
};
