import React, { useState } from 'react';
import axios from 'axios';

function JoinParty({ user }){
  const [partyCode, setPartyCode] = useState('');
  const [message, setMessage] = useState('');

  async function handleJoinParty(e){
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/join-party', {
        partyCode: partyCode,
        userId: user.id,
      });

      if(res.data){
        setMessage("Joined Successfully")
      }
      // Redirect to the party page or handle success
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-xs">
        <h2 className="text-2xl font-bold mb-6 text-center">Join Party</h2>
        <form onSubmit={handleJoinParty} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" >
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Party Code</label>
            <input
              type="text"
              value={partyCode}
              onChange={(e) => setPartyCode(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Join Party
            </button>
          </div>
          {message && <p className="mt-4 text-center text-green-500" >{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default JoinParty;
