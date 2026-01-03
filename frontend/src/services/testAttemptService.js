import axiosInstance from '../Api/axiosInstance';

// Test Attempt API Service
export const testAttemptService = {
  // Create a new test attempt
  createTestAttempt: async (candidateId, positionId) => {
    try {
      const response = await axiosInstance.post('/test-attempt/create', {
        candidateId,
        positionId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating test attempt:', error);
      throw error;
    }
  },

  // Submit test with attempt tracking
  submitTestWithAttempt: async (testData, attemptInfo) => {
    try {
      const formData = new FormData();
      formData.append('candidateId', attemptInfo.candidateId);
      formData.append('positionId', attemptInfo.positionId);
      formData.append('attemptId', attemptInfo.attemptId);
      formData.append('timeTakenInSeconds', testData.timeTakenInSeconds);
      formData.append('timeTakenFormatted', testData.timeTakenFormatted);
      formData.append('answers', JSON.stringify(testData.answers));
      
      if (testData.recording) {
        formData.append('recording', testData.recording);
      }

      const response = await axiosInstance.post('/test-attempt/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error submitting test:', error);
      throw error;
    }
  },

  // Get all attempts for a candidate-position combination
  getCandidateAttempts: async (candidateId, positionId) => {
    try {
      const response = await axiosInstance.get(
        `/test-attempt/candidate/${candidateId}/position/${positionId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching attempts:', error);
      throw error;
    }
  },

  // Get latest attempt for a candidate-position combination
  getLatestAttempt: async (candidateId, positionId) => {
    try {
      const response = await axiosInstance.get(
        `/test-attempt/latest/${candidateId}/position/${positionId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching latest attempt:', error);
      throw error;
    }
  },

  // Get all test results with attempt information
  getAllResultsWithAttempts: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/test-attempt/results', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching results with attempts:', error);
      throw error;
    }
  }
};

// Progress API Service (Updated for attempts)
export const progressService = {
  // Save progress with attempt tracking
  saveProgress: async (progressData) => {
    try {
      const response = await axiosInstance.post('/test-progress/save', progressData);
      return response.data;
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  },

  // Get progress by attempt ID
  getProgress: async (attemptId) => {
    try {
      const response = await axiosInstance.get(`/test-progress/get/${attemptId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching progress:', error);
      throw error;
    }
  },

  // Reset progress for an attempt
  resetProgress: async (attemptId) => {
    try {
      const response = await axiosInstance.delete('/test-progress/reset', {
        data: { attemptId }
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting progress:', error);
      throw error;
    }
  }
};

// Legacy API Service (for backward compatibility)
export const legacyTestService = {
  // Original test submission (still works)
  submitTest: async (testData) => {
    try {
      const formData = new FormData();
      formData.append('candidateId', testData.candidateId);
      formData.append('positionId', testData.positionId);
      formData.append('timeTakenInSeconds', testData.timeTakenInSeconds);
      formData.append('timeTakenFormatted', testData.timeTakenFormatted);
      formData.append('answers', JSON.stringify(testData.answers));
      
      if (testData.recording) {
        formData.append('recording', testData.recording);
      }

      const response = await axiosInstance.post('/test', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error submitting test (legacy):', error);
      throw error;
    }
  },

  // Original progress save (still works)
  saveProgress: async (progressData) => {
    try {
      const response = await axiosInstance.post('/test-progress/save', progressData);
      return response.data;
    } catch (error) {
      console.error('Error saving progress (legacy):', error);
      throw error;
    }
  }
};
