import React, { useState } from 'react';
import { User, Mail, Lock, GraduationCap, Briefcase, ArrowRight } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('student');

  return (
    <div className="min-h-screen bg-[#E1F5EE] flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse">
        
        {/* Left Hero Section (Flipped for Register) */}
        <div className="md:w-2/5 bg-[#04342C] p-10 text-white flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">Join Us</h2>
          <p className="text-teal-100 opacity-80 mb-6">Create an account to start your journey with our professional community.</p>
          <div className="p-4 bg-[#1D9E75] bg-opacity-20 rounded-lg border border-[#1D9E75]">
            <p className="text-sm italic">"The best way to predict the future is to create it."</p>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="md:w-3/5 p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
            <p className="text-sm text-gray-500 mt-1">Please select your role and fill the details.</p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${role === 'student' ? 'border-[#1D9E75] text-[#1D9E75] bg-teal-50' : 'border-gray-100 text-gray-400'}`}
            >
              <GraduationCap size={18} />
              <span className="font-semibold">Student</span>
            </button>
            <button 
              onClick={() => setRole('client')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${role === 'client' ? 'border-[#1D9E75] text-[#1D9E75] bg-teal-50' : 'border-gray-100 text-gray-400'}`}
            >
              <Briefcase size={18} />
              <span className="font-semibold">Client</span>
            </button>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="text" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1D9E75] outline-none" placeholder="John Doe" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="email" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1D9E75] outline-none" placeholder="john@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="password" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1D9E75] outline-none" placeholder="••••••••" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Confirm</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="password" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1D9E75] outline-none" placeholder="••••••••" />
              </div>
            </div>

            <button className="md:col-span-2 mt-4 w-full bg-[#1D9E75] hover:bg-[#168a65] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
              Register Now <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account? <span className="text-[#1D9E75] font-bold cursor-pointer hover:underline">Log in</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;