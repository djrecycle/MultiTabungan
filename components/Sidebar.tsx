import React from 'react';
import { LayoutDashboard, Users, CreditCard, Sparkles, PiggyBank } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'STUDENTS', label: 'Data Siswa', icon: <Users size={20} /> },
    { id: 'TRANSACTIONS', label: 'Transaksi', icon: <CreditCard size={20} /> },
    { id: 'AI_ADVISOR', label: 'Asisten Cerdas', icon: <Sparkles size={20} /> },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col hidden md:flex z-10">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <PiggyBank size={24} />
        </div>
        <h1 className="text-xl font-bold text-gray-800">TabunganKu</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === item.id
                ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
          <p className="text-xs font-medium text-blue-100 mb-1">Powered by</p>
          <p className="text-sm font-bold flex items-center gap-2">
            <Sparkles size={14} /> Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
};