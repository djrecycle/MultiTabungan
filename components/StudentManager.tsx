import React, { useState, useRef } from 'react';
import { Student } from '../types';
import { Plus, Search, Trash2, User, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface StudentManagerProps {
  students: Student[];
  addStudent: (student: Student) => void;
  addStudents: (students: Student[]) => void;
  deleteStudent: (id: string) => void;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export const StudentManager: React.FC<StudentManagerProps> = ({ students, addStudent, addStudents, deleteStudent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newClass) return;

    const newStudent: Student = {
      id: Date.now().toString(),
      name: newName,
      className: newClass,
      balance: 0,
      joinDate: new Date().toISOString(),
    };

    addStudent(newStudent);
    setNewName('');
    setNewClass('');
    setIsModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        // Process data (Assuming Row 1 is header, start from Row 2)
        // Or if no header, process all. Let's assume first column is Name, second is Class
        const newStudents: Student[] = [];
        
        // Skip header if it looks like a header (contains "Nama" or "Name")
        let startIndex = 0;
        if (data.length > 0 && Array.isArray(data[0])) {
             const firstRow = data[0] as any[];
             if (firstRow[0] && typeof firstRow[0] === 'string' && (firstRow[0].toLowerCase().includes('nama') || firstRow[0].toLowerCase().includes('name'))) {
                 startIndex = 1;
             }
        }

        for (let i = startIndex; i < data.length; i++) {
          const row = data[i] as any[];
          if (row && row.length >= 2 && row[0]) {
            newStudents.push({
              id: (Date.now() + i).toString(),
              name: row[0].toString(),
              className: row[1]?.toString() || 'Umum',
              balance: 0,
              joinDate: new Date().toISOString(),
            });
          }
        }

        if (newStudents.length > 0) {
          addStudents(newStudents);
          alert(`Berhasil mengimpor ${newStudents.length} siswa!`);
        } else {
          alert('Tidak ada data valid yang ditemukan dalam file.');
        }

      } catch (error) {
        console.error(error);
        alert('Gagal membaca file. Pastikan format Excel/CSV valid.');
      } finally {
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Siswa</h2>
          <p className="text-gray-500">Kelola daftar siswa dan lihat saldo individual.</p>
        </div>
        
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Upload size={18} />
            <span className="hidden md:inline">Import Excel/CSV</span>
            <span className="md:hidden">Import</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden md:inline">Tambah Siswa</span>
            <span className="md:hidden">Tambah</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama siswa atau kelas..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Import Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <FileSpreadsheet size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-800">Tips Import Data</h4>
          <p className="text-sm text-blue-600 mt-1">
            Gunakan file Excel (.xlsx) atau CSV. Pastikan kolom pertama adalah <strong>Nama Siswa</strong> dan kolom kedua adalah <strong>Kelas</strong>. Baris pertama akan dianggap sebagai header jika berisi teks 'Nama'.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Nama Siswa</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Kelas</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Tanggal Bergabung</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Saldo Saat Ini</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <User size={16} />
                        </div>
                        <span className="font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.className}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(student.joinDate).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">{formatRupiah(student.balance)}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => deleteStudent(student.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Hapus Siswa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tambah Siswa Baru</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  placeholder="Contoh: 10 IPA 1"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};