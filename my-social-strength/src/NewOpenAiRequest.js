import React, { useState } from 'react';
import './index.css';
import OpenAI from 'openai';

const OpenAIRequest = () => {
  const [messageHistory, setMessageHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const openaiClient = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const generateResponse = async () => {
    if (!selectedFile) {
      alert('Please select a file.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Read the contents of the selected file
      const reader = new FileReader();
      reader.readAsText(selectedFile);
      reader.onload = async () => {
        let userInputFromFile = reader.result;
        
        const question = "D'apres les discussion par mail que tu as reçu donne moi uniquement les adresse mail des personnes" 
        +"a qui David pourrait envoyer un questionnaire pour recueillir des " 
        +"feedbacks sur ses qualités et points forts si les discussion sont sans importance "
        +"les gens ne doivent pas etre compté dedans donc ne les indique pas dans le resultat que tu vas me donner " 
        +"analyse bien les discussion pour etre sur que les personne le connaissent bien ou on eu des echange avec lui ?";
        userInputFromFile += question;
        if (!userInputFromFile.trim()) {
          alert('The file is empty. Please select a valid file.');
          return;
        }

        const userMessage = { role: 'user', content: userInputFromFile };
        const newMessageHistory = [...messageHistory, userMessage];
        const response = await openaiClient.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: newMessageHistory,
          max_tokens:  500,
        });

        if (response.choices && response.choices[0]) {
          setMessageHistory([...newMessageHistory, response.choices[0].message]);
        } else {
          throw new Error('Unexpected response structure');
        }
      };
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // const handleKeypress = e => {
  //   //it triggers by pressing the enter key
  // if (e.keyCode === 13) {
  //   generateResponse();
  // }
  // };
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
          type="file"
          onChange={handleFileChange}
          />
          <button
            type="submit"
            aria-label="Send Message"
            onClick={generateResponse}
            disabled={loading || !selectedFile}
          >
            {loading ? 'Loading...' : 'Send'}
          </button>
            {error && <p className="error-message">{error}</p>}
          </div>
    </div>
  );
};

export default OpenAIRequest;

