const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_CANDIDATE_ID = '507f1f77bcf86cd799439011'; // Replace with actual candidate ID
const TEST_POSITION_ID = '507f1f77bcf86cd799439012'; // Replace with actual position ID

// Test data
const testData = {
  candidateId: TEST_CANDIDATE_ID,
  positionId: TEST_POSITION_ID,
  timeTakenInSeconds: 1800,
  timeTakenFormatted: "30:00",
  answers: JSON.stringify([
    {
      questionId: "507f1f77bcf86cd799439013",
      selectedOption: "507f1f77bcf86cd799439014",
      status: 1
    }
  ])
};

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
};

// Test functions
const testCreateAttempt = async () => {
  console.log('\n🧪 Testing: Create Test Attempt');
  const result = await apiCall('POST', '/test-attempt/create', {
    candidateId: TEST_CANDIDATE_ID,
    positionId: TEST_POSITION_ID
  });

  if (result.success) {
    console.log('✅ Create attempt successful');
    console.log('Response:', result.data);
    return result.data.data.attemptId;
  } else {
    console.log('❌ Create attempt failed');
    console.log('Error:', result.error);
    return null;
  }
};

const testGetLatestAttempt = async () => {
  console.log('\n🧪 Testing: Get Latest Attempt');
  const result = await apiCall('GET', `/test-attempt/latest/${TEST_CANDIDATE_ID}/position/${TEST_POSITION_ID}`);

  if (result.success) {
    console.log('✅ Get latest attempt successful');
    console.log('Response:', result.data);
    return result.data.data?.attemptId;
  } else {
    console.log('❌ Get latest attempt failed');
    console.log('Error:', result.error);
    return null;
  }
};

const testGetAllAttempts = async () => {
  console.log('\n🧪 Testing: Get All Attempts');
  const result = await apiCall('GET', `/test-attempt/candidate/${TEST_CANDIDATE_ID}/position/${TEST_POSITION_ID}`);

  if (result.success) {
    console.log('✅ Get all attempts successful');
    console.log('Response:', result.data);
  } else {
    console.log('❌ Get all attempts failed');
    console.log('Error:', result.error);
  }
};

const testSaveProgress = async (attemptId) => {
  console.log('\n🧪 Testing: Save Progress');
  const progressData = {
    candidateId: TEST_CANDIDATE_ID,
    positionId: TEST_POSITION_ID,
    attemptId: attemptId,
    attemptNumber: 1,
    progress: {
      questions: [
        {
          questionId: "507f1f77bcf86cd799439013",
          question: "What is React?",
          options: [
            { optionId: "opt1", optionText: "A library" },
            { optionId: "opt2", optionText: "A framework" }
          ],
          selectedOption: "opt1",
          selectedOptionText: "A library",
          status: 1
        }
      ],
      currentQuestionIndex: 0,
      timeLeft: 1500
    }
  };

  const result = await apiCall('POST', '/test-progress/save', progressData);

  if (result.success) {
    console.log('✅ Save progress successful');
    console.log('Response:', result.data);
  } else {
    console.log('❌ Save progress failed');
    console.log('Error:', result.error);
  }
};

const testGetProgress = async (attemptId) => {
  console.log('\n🧪 Testing: Get Progress');
  const result = await apiCall('GET', `/test-progress/get/${attemptId}`);

  if (result.success) {
    console.log('✅ Get progress successful');
    console.log('Response:', result.data);
  } else {
    console.log('❌ Get progress failed');
    console.log('Error:', result.error);
  }
};

const testSubmitTest = async (attemptId) => {
  console.log('\n🧪 Testing: Submit Test');
  
  // Create FormData for file upload
  const FormData = require('form-data');
  const formData = new FormData();
  
  formData.append('candidateId', TEST_CANDIDATE_ID);
  formData.append('positionId', TEST_POSITION_ID);
  formData.append('attemptId', attemptId);
  formData.append('timeTakenInSeconds', testData.timeTakenInSeconds);
  formData.append('timeTakenFormatted', testData.timeTakenFormatted);
  formData.append('answers', testData.answers);

  try {
    const response = await axios.post(`${BASE_URL}/test-attempt/submit`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    console.log('✅ Submit test successful');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Submit test failed');
    console.log('Error:', error.response?.data || error.message);
  }
};

const testGetAllResults = async () => {
  console.log('\n🧪 Testing: Get All Results with Attempts');
  const result = await apiCall('GET', '/test-attempt/results');

  if (result.success) {
    console.log('✅ Get all results successful');
    console.log('Response:', result.data);
  } else {
    console.log('❌ Get all results failed');
    console.log('Error:', result.error);
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Backend API Tests for Multiple Test Attempts');
  console.log('=' .repeat(60));

  try {
    // Test 1: Create a new attempt
    const attemptId = await testCreateAttempt();
    
    if (attemptId) {
      // Test 2: Get latest attempt
      await testGetLatestAttempt();
      
      // Test 3: Save progress
      await testSaveProgress(attemptId);
      
      // Test 4: Get progress
      await testGetProgress(attemptId);
      
      // Test 5: Submit test (commented out to avoid creating actual test results)
      // await testSubmitTest(attemptId);
    }

    // Test 6: Get all attempts
    await testGetAllAttempts();
    
    // Test 7: Get all results
    await testGetAllResults();

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 All tests completed!');
    console.log('\n📝 Notes:');
    console.log('- Replace TEST_CANDIDATE_ID and TEST_POSITION_ID with actual IDs');
    console.log('- Ensure your server is running on port 5000');
    console.log('- Make sure you have valid candidate and position data in your database');
    console.log('- Uncomment testSubmitTest() to test actual test submission');

  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testCreateAttempt,
  testGetLatestAttempt,
  testGetAllAttempts,
  testSaveProgress,
  testGetProgress,
  testSubmitTest,
  testGetAllResults
};
