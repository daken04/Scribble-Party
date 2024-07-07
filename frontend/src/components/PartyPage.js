import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', { autoConnect: false });

function PartyPage({ user }) {
  const { partyCode } = useParams();
  const [members, setMembers] = useState([]);
  const [partyDetails, setPartyDetails] = useState({});
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const navigate = useNavigate();

  const [drawing, setDrawing] = useState(false);
  const [current, setCurrent] = useState({ x: 0, y: 0 });

  const drawLine = useCallback((x0, y0, x1, y1, emit) => {
    const context = contextRef.current;
    if (context) {
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.stroke();
      context.closePath();
    }

    if (!emit) return;
    socket.emit('drawingData', { x0, y0, x1, y1, partyCode });
    //console.log('Emitting drawing data:', { x0, y0, x1, y1, partyCode });
  }, [partyCode]);

  const clearDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    socket.emit('clearDrawing', partyCode);
  }, [partyCode]);

  useEffect(() => {
    socket.connect();

    const fetchPartyDetails = async () => {
      const res = await axios.get(`http://localhost:5000/party-members/${partyCode}`);
      setPartyDetails(res.data);
      setMembers(res.data.members);
    };
    fetchPartyDetails();

    socket.emit('join', { partyCode, userId: user.id });

    socket.on('membersUpdate', (updatedMembers) => {
      setMembers(updatedMembers);
    });

    socket.on('chat', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('drawingData', (data) => {
      //console.log('Received drawing data from server:', data);
      const { x0, y0, x1, y1 } = data;
      drawLine(x0, y0, x1, y1, false);
    });

    socket.on('clearDrawing', () => {
      clearDrawing();
    });

    socket.on('partyDeleted', () => {
      alert('The party has been deleted by the admin.');
      navigate('/');
    });

    return () => {
      socket.emit('leave', { partyCode, userId: user.id });
      socket.off('chat');
      socket.off('membersUpdate');
      socket.off('drawingData');
      socket.off('clearDrawing');
      socket.off('partyDeleted');
      socket.disconnect();
    };
  }, [partyCode, user.id, drawLine, clearDrawing, navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth * 0.75;
      canvas.height = window.innerHeight * 0.75;
      canvas.style.width = `${window.innerWidth * 0.75}px`;
      canvas.style.height = `${window.innerHeight * 0.75}px`;

      const context = canvas.getContext('2d');
      context.scale(1, 1);
      context.lineCap = 'round';
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      contextRef.current = context;
    }
  }, []);

  const startDrawing = (e) => {
    setDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    setCurrent({ x: offsetX, y: offsetY });
  };

  const draw = (e) => {
    if (!drawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const { x, y } = current;
    drawLine(x, y, offsetX, offsetY, true);
    setCurrent({ x: offsetX, y: offsetY });
  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  const handleLeaveParty = async () => {
    try {
      await axios.post('http://localhost:5000/leave-party', { partyCode, userId: user.id });
      navigate('/');
    } catch (error) {
      console.error('Error leaving party:', error);
    }
  };

  const handleDeleteParty = async () => {
    try {
      await axios.post('http://localhost:5000/leave-party', { partyCode, userId: user.id });
      navigate('/');
    } catch (error) {
      console.error('Error deleting party:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const newMessage = { userId: user.username, message, partyCode };
    socket.emit('chat', newMessage);
    setMessages((prevMessages) => [...prevMessages]);
    setMessage('');
  };

  return (
    <div className="flex h-screen relative">
      {showLeftSidebar && (
        <div className="w-1/4 bg-gray-200 p-4 flex flex-col fixed left-0 top-0 h-full z-10">
          <h3 className="text-xl font-bold mb-4">{partyDetails.name}</h3>
          <p className="text-green-500 text-lg mb-4">Party Code: {partyCode}</p>
          <h3 className="text-xl font-bold mb-4">Party Members</h3>
          <ul>
            {members.map((member) => (
              <li key={member.id} className={member.id === user.id ? 'font-bold' : ''}>
                {member.username}{member.id === partyDetails.admin_id && ' (Admin)'}
              </li>
            ))}
          </ul>
          {partyDetails.admin_id === user.id && (
            <button onClick={handleDeleteParty} className="mt-4 bg-red-500 text-white py-2 px-4 rounded">
              Delete Party
            </button>
          )}
          <button onClick={handleLeaveParty} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
            Leave Party
          </button>
        </div>
      )}
      <button 
        className={`absolute top-1/2 transform -translate-y-1/2 bg-gray-600 text-white p-2 rounded z-20 ${showLeftSidebar ? 'left-1/4 -ml-4' : 'left-0 ml-4'}`}
        onClick={() => {
          setShowLeftSidebar(!showLeftSidebar);
        }}
      >
        {showLeftSidebar ? '❮' : '❯'}
      </button>
      <div className={`flex-grow flex flex-col items-center justify-center p-4 transition-all duration-300 ${showLeftSidebar ? 'ml-1/4' : 'ml-0'} ${showRightSidebar ? 'mr-1/4' : 'mr-0'}`}>
        <canvas
          ref={canvasRef}
          className="border"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <button onClick={clearDrawing} className="mt-4 bg-yellow-500 text-white py-2 px-4 rounded">
          Clear Drawing
        </button>
      </div>
      {showRightSidebar && (
        <div className="w-1/4 bg-gray-200 p-4 flex flex-col fixed right-0 top-0 h-full z-10">
          <h3 className="text-xl font-bold mb-4">Chat</h3>
          <div className="overflow-y-auto h-64 border p-2 mb-4">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <strong>{msg.userId}</strong>: {msg.message}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border mb-2"
              placeholder="Type a message"
              required
            />
            <button type="submit" className="w-full bg-purple-500 text-white py-2 px-4 rounded">
              Send
            </button>
          </form>
        </div>
      )}
      <button 
        className={`absolute top-1/2 transform -translate-y-1/2 bg-gray-600 text-white p-2 rounded z-20 ${showRightSidebar ? 'right-1/4 -mr-4' : 'right-0 mr-4'}`}
        onClick={() => {
          setShowRightSidebar(!showRightSidebar);
        }}
      >
        {showRightSidebar ? '❯' : '❮'}
      </button>
    </div>
  );
}

export default PartyPage;
