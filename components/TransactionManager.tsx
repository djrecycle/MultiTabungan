import React, { useState } from 'react';
import { Student, Transaction, TransactionType } from '../types';
import { PlusCircle, MinusCircle, Search, History } from 'lucide-react';

interface TransactionManagerProps {
  students: Student[];
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export const TransactionManager: React.FC<TransactionManagerProps> = ({ students, transactions, addTransaction }) => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'HISTORY'>('NEW');
  
  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [type, setType] = useState<TransactionType>('DEPOSIT');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Filter State
  const [historyFilter, setHistoryFilter] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedStudentId) {
      setError('Pilih siswa terlebih dahulu.');
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Jumlah uang harus lebih dari 0.');
      return;
    }

    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    if (type === 'WITHDRAWAL' && student.balance < numAmount) {
      setError(`Saldo tidak mencukupi. Saldo saat ini: ${formatRupiah(student.balance)}`);
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      studentId: selectedStudentId,
      studentName: student.name,
      type,
      amount: numAmount,
      date: new Date().toISOString(),
      note: note || (type === 'DEPOSIT' ? 'Setoran tunai' : 'Penarikan tunai'),
    };

    addTransaction(newTransaction);
    
    // Reset form
    setAmount('');
    setNote('');
    alert('Transaksi berhasil disimpan!');
  };

  const filteredTransactions = transactions.filter(t => 
    t.studentName.toLowerCase().includes(historyFilter.toLowerCase()) || 
    t.note.toLowerCase().includes(historyFilter.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Transaksi</h2>
          <p className="text-gray-500">Catat setoran dan penarikan atau lihat riwayat.</p>
        </div>
        <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex">
          <button
            onClick={() => setActiveTab('NEW')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'NEW' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Transaksi Baru
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'HISTORY' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Riwayat
          </button>
        </div>
      </div>

      {activeTab === 'NEW' ? (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Form Transaksi</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Siswa</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">-- Cari Siswa --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.className}) - Saldo: {formatRupiah(s.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('DEPOSIT')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  type === 'DEPOSIT' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-green-200'
                }`}
              >
                <PlusCircle size={28} />
                <span className="font-bold">Setoran</span>
              </button>
              
              <button
                type="button"
                onClick={() => setType('WITHDRAWAL')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  type === 'WITHDRAWAL' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-gray-200 hover:border-red-200'
                }`}
              >
                <MinusCircle size={28} />
                <span className="font-bold">Penarikan</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
              <input 
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 text-lg font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
              <input 
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Contoh: Uang LKS, Tabungan Mingguan"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className={`w-full py-3 rounded-lg font-bold text-white shadow-sm transition-all ${
                type === 'DEPOSIT' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {type === 'DEPOSIT' ? 'Simpan Setoran' : 'Proses Penarikan'}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {/* History View */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Cari riwayat transaksi..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Tanggal</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Siswa</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Jenis</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Catatan</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(t.date).toLocaleDateString('id-ID')} <span className="text-xs text-gray-400 ml-1">{new Date(t.date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{t.studentName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            t.type === 'DEPOSIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {t.type === 'DEPOSIT' ? 'SETORAN' : 'PENARIKAN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{t.note}</td>
                        <td className={`px-6 py-4 text-right font-bold ${t.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'DEPOSIT' ? '+' : '-'}{formatRupiah(t.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400 flex flex-col items-center gap-2">
                        <History size={32} />
                        <span>Belum ada riwayat transaksi.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};