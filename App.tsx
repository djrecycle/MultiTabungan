import React, { useState, useEffect } from 'react';
import { Student, Transaction, ViewState } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentManager } from './components/StudentManager';
import { TransactionManager } from './components/TransactionManager';
import { AIFinancialAdvisor } from './components/AIFinancialAdvisor';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initial Mock Data or Load from LocalStorage
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Ahmad Rizky', className: '10 IPA 1', balance: 500000, joinDate: '2023-01-15' },
      { id: '2', name: 'Siti Aminah', className: '11 IPS 2', balance: 1250000, joinDate: '2023-02-20' },
      { id: '3', name: 'Budi Darmawan', className: '12 IPA 3', balance: 750000, joinDate: '2023-03-10' },
    ];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [
      { id: '101', studentId: '1', studentName: 'Ahmad Rizky', type: 'DEPOSIT', amount: 500000, date: '2023-10-01T08:00:00.000Z', note: 'Setoran Awal' },
      { id: '102', studentId: '2', studentName: 'Siti Aminah', type: 'DEPOSIT', amount: 1000000, date: '2023-10-02T09:30:00.000Z', note: 'Tabungan' },
      { id: '103', studentId: '2', studentName: 'Siti Aminah', type: 'DEPOSIT', amount: 250000, date: '2023-10-05T10:00:00.000Z', note: 'Tambahan' },
      { id: '104', studentId: '3', studentName: 'Budi Darmawan', type: 'DEPOSIT', amount: 800000, date: '2023-10-06T11:00:00.000Z', note: 'Uang Kas' },
      { id: '105', studentId: '3', studentName: 'Budi Darmawan', type: 'WITHDRAWAL', amount: 50000, date: '2023-10-10T13:00:00.000Z', note: 'Beli Buku' },
    ];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Handlers
  const addStudent = (newStudent: Student) => {
    setStudents([...students, newStudent]);
  };

  const addStudents = (newStudents: Student[]) => {
    setStudents([...students, ...newStudents]);
  };

  const deleteStudent = (id: string) => {
    if (window.confirm('Yakin ingin menghapus siswa ini? Semua data akan hilang.')) {
      setStudents(students.filter(s => s.id !== id));
      // Optional: cleanup transactions related to student
    }
  };

  const addTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update student balance
    setStudents(prev => prev.map(s => {
      if (s.id === newTransaction.studentId) {
        const newBalance = newTransaction.type === 'DEPOSIT' 
          ? s.balance + newTransaction.amount 
          : s.balance - newTransaction.amount;
        return { ...s, balance: newBalance };
      }
      return s;
    }));
  };

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard students={students} transactions={transactions} />;
      case 'STUDENTS':
        return <StudentManager students={students} addStudent={addStudent} addStudents={addStudents} deleteStudent={deleteStudent} />;
      case 'TRANSACTIONS':
        return <TransactionManager students={students} transactions={transactions} addTransaction={addTransaction} />;
      case 'AI_ADVISOR':
        return <AIFinancialAdvisor students={students} transactions={transactions} />;
      default:
        return <Dashboard students={students} transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* Sidebar (Desktop) */}
      <Sidebar currentView={currentView} setView={setCurrentView} />

      {/* Mobile Header/Nav Overlay */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-20 px-4 py-3 flex justify-between items-center">
        <h1 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          TabunganKu
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-10 pt-16 px-4 animate-fade-in">
           <div className="space-y-2">
            {['DASHBOARD', 'STUDENTS', 'TRANSACTIONS', 'AI_ADVISOR'].map((view) => (
              <button
                key={view}
                onClick={() => {
                  setCurrentView(view as ViewState);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${
                  currentView === view ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
              >
                {view === 'AI_ADVISOR' ? 'Asisten Cerdas' : view.charAt(0) + view.slice(1).toLowerCase()}
              </button>
            ))}
           </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 mt-14 md:mt-0 overflow-x-hidden">
        {renderView()}
      </main>
    </div>
  );
};

export default App;