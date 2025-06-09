const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const path = require('path');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Chat route is working!' });
});

// Đường dẫn tới file credentials
const keyFilePath = path.join(__dirname, '../Dialogflow API Client/dreamnestbot-disp-9e9e69da1235.json');

// Kiểm tra file credentials tồn tại
const fs = require('fs');
if (!fs.existsSync(keyFilePath)) {
  console.error('Error: Dialogflow credentials file not found at:', keyFilePath);
  throw new Error('Dialogflow credentials not found');
}

let sessionClient;
try {
  // Khởi tạo session client với credentials
  sessionClient = new dialogflow.SessionsClient({
    keyFilename: keyFilePath
  });
  console.log('✅ Dialogflow session client initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Dialogflow client:', error);
  throw error;
}

const projectId = process.env.DIALOGFLOW_PROJECT_ID || 'dreamnestbot-disp';
console.log('Using Dialogflow Project ID:', projectId);

router.post('/', async (req, res) => {
  try {
    console.log('📥 Received chat request:', req.body);
    const { message, sessionId } = req.body;
    
    if (!message) {
      console.log('❌ No message provided in request');
      return res.status(400).json({ error: 'Message is required' });
    }

    const currentSessionId = sessionId || uuid.v4();
    console.log('🔑 Using session ID:', currentSessionId);
    
    // Tạo session path với project ID
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      currentSessionId
    );
    console.log('🔗 Session path:', sessionPath);

    // Cấu hình request
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: 'vi'
        }
      }
    };

    console.log('📤 Sending request to Dialogflow:', {
      projectId,
      sessionId: currentSessionId,
      message
    });

    // Gọi Dialogflow API với timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000);
    });

    const [response] = await Promise.race([
      sessionClient.detectIntent(request),
      timeoutPromise
    ]);

    const result = response.queryResult;

    if (!result || !result.fulfillmentText) {
      console.warn('⚠️ Empty response from Dialogflow');
      return res.status(500).json({ 
        error: 'Invalid response from chatbot',
        details: 'No fulfillment text received'
      });
    }

    console.log('📥 Received response from Dialogflow:', {
      fulfillmentText: result.fulfillmentText,
      intent: result.intent?.displayName,
      confidence: result.intentDetectionConfidence
    });

    // Trả về response cho client
    res.json({
      reply: result.fulfillmentText,
      sessionId: currentSessionId,
      intent: result.intent?.displayName,
      confidence: result.intentDetectionConfidence
    });

  } catch (err) {
    console.error('❌ Dialogflow error:', err);
    
    // Phân loại lỗi để trả về message phù hợp
    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (err.message === 'Request timeout') {
      errorMessage = 'Request to chatbot timed out';
      statusCode = 504;
    } else if (err.code === 7 || err.code === 16) {
      errorMessage = 'Authentication error with chatbot service';
      statusCode = 401;
    } else if (err.code === 'ENOENT') {
      errorMessage = 'Configuration error';
      statusCode = 500;
    }

    res.status(statusCode).json({ 
      error: errorMessage,
      details: err.message 
    });
  }
});

module.exports = router;
