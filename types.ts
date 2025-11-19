import React from 'react';

export interface Student {
  id: string;
  name: string;
  className: string;
  balance: number;
  joinDate: string;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';

export interface Transaction {
  id: string;
  studentId: string;
  studentName: string; // Denormalized for easier display
  type: TransactionType;
  amount: number;
  date: string;
  note: string;
}

export type ViewState = 'DASHBOARD' | 'STUDENTS' | 'TRANSACTIONS' | 'AI_ADVISOR';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}