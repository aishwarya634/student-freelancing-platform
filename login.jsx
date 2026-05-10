import React, { useState } from 'react';
import { Eye, EyeOff, GraduationCap, Briefcase, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');

  return (
    <div className="min-h-screen bg-[#E1F5EE] flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:row">
        
        {/* Left Hero Section */}
        <div className="md:w-2/5 bg-[#04342C] p-10 text-white flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
          <p className="text-teal-100 opacity-80 mb-8">Login to stay connected and manage your academic progress.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[#1D9E75] w-5 h-5" />
              <span className="text-sm">Secure Data Encryption</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[#1D9E75] w-5 h-5" />
              <span className="text-sm">24/7 Support Access</span>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="md:w-3/5 p-8 md:p-12">
          <div className="flex justify-between items-baseline mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Login</h1>
            <button className="text-sm font-semibold text-[#1D9E75] hover:underline">New here? Register</button>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div 
              onClick={() => setRole('student')}
              className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center ${role === 'student' ? 'border-[#1D9E75] bg-white shadow-md' : 'border-transparent bg-gray-50'}`}
            >
              <GraduationCap className={`mb-2 ${role === 'student' ? 'text-[#1D9E75]' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-700">Student</span>
            </div>
            <div 
              onClick={() => setRole('client')}
              className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center ${role === 'client' ? 'border-[#1D9E75] bg-white shadow-md' : 'border-transparent bg-gray-50'}`}
            >
              <Briefcase className={`mb-2 ${role === 'client' ? 'text-[#1D9E75]' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-700">Client</span>
            </div>
          </div>

          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none" placeholder="Enter your email" />
            </div>

            <div className="relative">
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-600">Password</label>
                <button type="button" className="text-xs font-bold text-[#1D9E75] hover:underline">Forgot password?</button>
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none" 
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-[#1D9E75]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button className="w-full bg-[#1D9E75] hover:bg-[#168a65] text-white font-bold py-3 rounded-lg transition-all shadow-lg active:scale-95">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;