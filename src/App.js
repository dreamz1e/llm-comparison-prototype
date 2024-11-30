import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  
  const models = {
    'OpenAI': ['gpt-4', 'gpt-3.5-turbo'],
    'Anthropic': ['claude-3-opus', 'claude-3-sonnet'],
    'Gemini': ['gemini-pro'],
    'LLama': ['llama-2-70b']
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      content: input,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          model: selectedModel
        }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        content: data.response,
        role: 'assistant',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="model-selector">
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {Object.entries(models).map(([provider, modelList]) => (
              <optgroup label={provider} key={provider}>
                {modelList.map(model => (
                  <option value={model} key={model}>{model}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        
        <div className="messages">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.role}`}
            >
              {message.content}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;
