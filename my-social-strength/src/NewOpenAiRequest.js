import React, { useState, useEffect } from 'react';
import './index.css';
import OpenAI from 'openai';

const OpenAIRequest = () => {
  const [userInput, setUserInput] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const openaiClient = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  useEffect(() => {
    // Cleanup function to remove event listeners, if needed
    return () => {};
  }, []);

  const generateResponse = async () => {
    if (!userInput.trim()) {
      alert('Please enter a valid message.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const userMessage = { role: 'user', content: userInput };
      const newMessageHistory = [...messageHistory, userMessage];
      
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: newMessageHistory,
        max_tokens:  100,
      });

      if (response.choices && response.choices[0]) {
        setMessageHistory([...newMessageHistory, response.choices[0].message]);
        setUserInput('');
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleKeypress = e => {
    //it triggers by pressing the enter key
  if (e.keyCode === 13) {
    generateResponse();
  }
};
  return (  
    <div className="openai-container">
      <div className="centered-content">
            <div className="message-history">
                {messageHistory.map((message, index) => (
                <p key={index} className={message.role === 'user' ? 'user_msg' : ''}>
                    <span>{message.content}</span>
                </p>
                ))}
            </div>
        <input
            type="text"
            // aria-label="Enter your message here"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message here..."
            onKeyDown={handleKeypress}
        /><br></br>
        <button
            type="submit"
            aria-label="Send Message"
            onClick={generateResponse}
            disabled={loading}
        >
            {loading ? 'Loading...' : 'Send'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default OpenAIRequest;

