'use client'

import { useState } from 'react';
import { useCompletion } from 'ai/react';

export interface IHistory {
  user: string,
  bot: string
}

export default function SloganGenerator() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion({api: '/api/completion'});
  
  const [history, setHistory] = useState<IHistory[]>([]);

  const handleFormSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
    setHistory(prevHistory => [...prevHistory, { user: input, bot: completion }]);
    
    // send a POST request to your backend
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: input }),
    })
      .then(response => response.json())
      .then(data => console.log(data));
  }


  return (
    <div className="mx-auto w-full max-w-md min-h-screen py-8 px-4 bg-gradient-to-b from-black to-white text-black flex flex-col justify-between">
      <div className="overflow-auto">
        {history.map((entry, index) => (
          <div key={index} className="mb-4">
            <div className="font-bold text-white mb-2">You: {entry.user}</div>
            <div className="font-semibold text-white">Bot: {entry.bot}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleFormSubmit} className="mt-4">
        <input
          className="w-full bg-white text-black rounded p-2"
          value={input}
          placeholder="Enter movement command..."
          onChange={handleInputChange}
        />
        <button className="w-full mt-2 bg-white text-black py-2 rounded">Submit</button>
      </form>
    </div>
  );
}
