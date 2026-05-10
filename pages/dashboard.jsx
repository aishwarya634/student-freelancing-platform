import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ScoreCard from '../components/ScoreCard';

const Dashboard = () => {
  const [data, setData] = useState({ projects: [], assessments: [] });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const [projRes, assRes] = await Promise.all([
        axios.get('/api/projects', { headers }),
        axios.get('/api/assessments/my', { headers })
      ]);
      setData({ projects: projRes.data, assessments: assRes.data });
    };
    fetchData();
  }, [token]);

  const steps = [
    { id: '01', title: 'Create Profile', desc: 'Showcase your skills and academic achievements.' },
    { id: '02', title: 'Take Assessment', desc: 'Verify your expertise through our curated tests.' },
    { id: '03', title: 'Find Projects', desc: 'Apply for real-world gigs from top clients.' },
    { id: '04', title: 'Build Portfolio', desc: 'Get paid and earn verified work experience.' }
  ];

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar activePage="Dashboard" />
      <main className="flex-1 ml-64 p-8">
        {/* Hero Banner */}
        <div className="bg-[#04342C] rounded-2xl p-10 text-white mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, Developer!</h1>
            <p className="text-teal-100 opacity-80">You have 3 active projects and 2 pending assessments.</p>
          </div>
          <div className="flex gap-4">
            <ScoreCard label="Overall Rank" score="92" />
          </div>
        </div>

        {/* How it Works Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {steps.map(step => (
            <div key={step.id} className="p-6 bg-[#E1F5EE]/30 rounded-xl border border-teal-50">
              <span className="text-3xl font-black text-[#1D9E75]/20 block mb-2">{step.id}</span>
              <h4 className="font-bold text-[#04342C] mb-1">{step.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;