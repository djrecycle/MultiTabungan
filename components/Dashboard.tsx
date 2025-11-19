import React from 'react';
import { Student, Transaction } from '../types';
import { Wallet, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  students: Student[];
  transactions: Transaction[];
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export const Dashboard: React.FC<DashboardProps> = ({ students, transactions }) => {
  const totalBalance = students.reduce((acc, s) => acc + s.balance, 0);
  const totalStudents = students.length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date.startsWith(today)).length;
  
  // Prepare Chart Data (Last 6 months ideally, but let's do by type for now)
  const depositTotal = transactions.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0);
  const withdrawTotal = transactions.filter(t => t.type === 'WITHDRAWAL').reduce((acc, t) => acc + t.amount, 0);
  
  const chartData = [
    { name: 'Pemasukan', amount: depositTotal, color: '#10b981' },
    { name: 'Penarikan', amount: withdrawTotal, color: '#ef4444' },
  ];

  const recentActivity = transactions.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Ringkasan Tabungan</h2>
        <p className="text-gray-500">Overview kondisi keuangan siswa sekolah.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-semibold bg-green-50 text-green-600 px-2 py-1 rounded">Total Aset</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{formatRupiah(totalBalance)}</h3>
          <p className="text-sm text-gray-500 mt-1">Akumulasi seluruh siswa</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Users size={24} />
            </div>
             <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded">Siswa Aktif</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{totalStudents}</h3>
          <p className="text-sm text-gray-500 mt-1">Total pemegang rekening</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
              <TrendingUp size={24} />
            </div>
             <span className="text-xs font-semibold bg-purple-50 text-purple-600 px-2 py-1 rounded">Hari Ini</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{todayTransactions}</h3>
          <p className="text-sm text-gray-500 mt-1">Transaksi diproses hari ini</p>
        </div>
      </div>

      {/* Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Perbandingan Arus Kas</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terakhir</h3>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Belum ada transaksi.</p>
            ) : (
              recentActivity.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {t.type === 'DEPOSIT' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.studentName}</p>
                      <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${t.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'DEPOSIT' ? '+' : '-'}{formatRupiah(t.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};