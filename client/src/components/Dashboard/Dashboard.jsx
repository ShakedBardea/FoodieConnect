import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Group admin panel
  if (user?.role === 'group_admin') return <AdminDashboard />;

  // For regular users, redirect to feed
  return <Navigate to="/feed" replace />;
};

export default Dashboard;
