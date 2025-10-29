import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Common/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import RecipeList from './components/Recipes/RecipeList';
import RecipeDetail from './components/Recipes/RecipeDetail';
import Dashboard from './components/Dashboard/Dashboard';
import ChatPage from './components/Chat/ChatPage';
import GroupsPage from './components/Groups/GroupsPage';
import UserFeed from './components/Feed/UserFeed';
import HomePage from './components/HomePage';
import ProfileEdit from './components/Profile/ProfileEdit';
import UserSearch from './components/Users/UserSearch';
import FriendsList from './components/Users/FriendsList';
import CreateRecipe from './components/Recipes/CreateRecipe';
import MyRecipes from './components/Recipes/MyRecipes';
import './styles/main.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const CreateRecipeRoute = () => {
  const { user } = useAuth();
  
  // Group admins should use their admin panel to create recipes
  if (user?.role === 'group_admin') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🚫 Access Restricted</h2>
        <p>As a group administrator, you can only create recipes for your group.</p>
        <p>Please use your <strong>Group Admin Panel</strong> to add recipes to your group.</p>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }
  
  return <CreateRecipe />;
};

 

function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recipes" element={
          <PrivateRoute>
            <RecipeList />
          </PrivateRoute>
        } />
        <Route path="/recipes/:id" element={
          <PrivateRoute>
            <RecipeDetail />
          </PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/chat" element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        } />
        <Route path="/groups" element={
          <PrivateRoute>
            <GroupsPage />
          </PrivateRoute>
        } />
        <Route path="/feed" element={
          <PrivateRoute>
            <UserFeed />
          </PrivateRoute>
        } />
        <Route path="/profile/edit" element={
          <PrivateRoute>
            <ProfileEdit />
          </PrivateRoute>
        } />
        <Route path="/users/search" element={
          <PrivateRoute>
            <UserSearch />
          </PrivateRoute>
        } />
        <Route path="/friends" element={
          <PrivateRoute>
            <FriendsList />
          </PrivateRoute>
        } />
        <Route path="/recipes/create" element={
          <PrivateRoute>
            <CreateRecipeRoute />
          </PrivateRoute>
        } />
        <Route path="/my-recipes" element={
          <PrivateRoute>
            <MyRecipes />
          </PrivateRoute>
        } />
        <Route path="/recipes/:id/edit" element={
          <PrivateRoute>
            <CreateRecipe />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
