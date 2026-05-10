import React from 'react';
import { LayoutDashboard, FolderKanban, Users, ClipboardCheck, UserCircle, LogOut } from 'lucide-react';

const Sidebar = ({ activePage }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/dashboard' },
    { name: 'Projects', icon: <FolderKanban size={20}/>, path: '/projects' },
    { name: 'Team', icon: <Users size={20}/>, path: '/team' },
    { name: 'Assessments', icon: <ClipboardCheck size={20}/>, path: '/assessments' },
    { name: 'Portfolio', icon: <UserCircle size={20}/>, path: '/portfolio' },
  ];

  return (
    <div className="w-64 h-screen bg-[#04342C] text-[#9FE1CB] flex flex-col fixed left-0 top-0">
      <div className="p-6 text-2xl font-bold text-white border-b border-[#0F6E56]">
        SkillBridge
      </div>
      <nav className="flex-1 mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <div
            key={item.name}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              activePage === item.name ? 'bg-[#0F6E56] text-white' : 'hover:bg-[#0F6E56]/50'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </div>
        ))}
      </nav>
      <div className="p-6 border-t border-[#0F6E56] hover:text-white cursor-pointer flex items-center gap-3">
        <LogOut size={20}/> <span>Logout</span>
      </div>
    </div>
  );
};

export default Sidebar;