import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateParty({ user }) {
  const [partyName, setPartyName] = useState('');
  const navigate = useNavigate();

  async function handleCreateParty(e) {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/create-party', {
        name: partyName,
        adminId: user.id,
      });
      const partyCode = res.data.party_code;
      navigate(`/party/${partyCode}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-xs">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Party</h2>
        <form onSubmit={handleCreateParty} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Party Name</label>
            <input
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Party
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateParty;
