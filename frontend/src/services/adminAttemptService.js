import axiosInstance from '../Api/axiosInstance';

// Admin Attempt Management API Service
export const adminAttemptService = {
  // Get all attempts with filtering and pagination
  getAllAttempts: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/admin/attempts/attempts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching attempts:', error);
      throw error;
    }
  },

  // Get detailed attempt information
  getAttemptDetails: async (attemptId) => {
    try {
      const response = await axiosInstance.get(`/admin/attempts/attempts/${attemptId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attempt details:', error);
      throw error;
    }
  },

  // Get candidate's all attempts
  getCandidateAttempts: async (candidateId, positionId = null) => {
    try {
      const params = positionId ? { positionId } : {};
      const response = await axiosInstance.get(`/admin/attempts/candidates/${candidateId}/attempts`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching candidate attempts:', error);
      throw error;
    }
  },

  // Get attempt analytics for dashboard
  getAttemptAnalytics: async (period = '30d') => {
    try {
      const response = await axiosInstance.get('/admin/attempts/analytics', { 
        params: { period } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Reset attempt (mark as abandoned)
  resetAttempt: async (attemptId) => {
    try {
      const response = await axiosInstance.patch(`/admin/attempts/attempts/${attemptId}/reset`);
      return response.data;
    } catch (error) {
      console.error('Error resetting attempt:', error);
      throw error;
    }
  },

  // Delete attempt (admin only)
  deleteAttempt: async (attemptId) => {
    try {
      const response = await axiosInstance.delete(`/admin/attempts/attempts/${attemptId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting attempt:', error);
      throw error;
    }
  }
};
