import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
   const { user, logout, updateUser } = useAuth();
   const [searchTerm, setSearchTerm] = useState('');
   const [categories, setCategories] = useState([]);
   const [selectedCategory, setSelectedCategory] = useState('');
   const navigate = useNavigate();

   useEffect(() => {
      fetchCategories();
      if (!user) {
         checkUserStatus();
      }
   }, [user]);

   const checkUserStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
         try {
            const response = await api.get('/user/profile');
            updateUser(response.data);
         } catch (error) {
            console.error('Error fetching user profile:', error);
            localStorage.removeItem('token');
         }
      }
   };

   const fetchCategories = async () => {
      try {
         const response = await api.get('/categories');
         setCategories(response.data);
      } catch (err) {
         console.error('Error fetching categories:', err);
      }
   };

   const handleLogout = () => {
      logout();
      navigate('/login');
   };

   const handleSearch = (e) => {
      e.preventDefault();
      if (searchTerm.trim()) {
         navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}&category=${encodeURIComponent(selectedCategory)}`);
      }
   };

   return (
      <nav className="bg-gray-800 p-4">
         <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
               <Link to="/" className="text-white text-xl font-bold">NeoVerse Market</Link>
               <Link to="/products" className="text-white">Products</Link>
               <Link to="/cart" className="text-white">Cart</Link>
               {user && user.role === 'admin' && (
                  <Link to="/admin" className="text-white hover:text-gray-300">
                     Admin Dashboard
                  </Link>
               )}
            </div>

            <form onSubmit={handleSearch} className="flex-grow max-w-md mx-4">
               <div className="flex">
                  <input
                     type="text"
                     placeholder="Search products..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full px-4 py-2 rounded-l-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-r-full hover:bg-blue-600">
                     <Search className="inline-block" />
                  </button>
               </div>
            </form>

            <div className="flex-grow text-center">
               {user && (
                  <span className="text-white text-lg font-semibold">
                     Welcome, {user.username} {user.role === 'admin' ? '(Admin)' : ''}
                  </span>
               )}
            </div>

            <div className="flex items-center space-x-4">
               {user ? (
                  <>
                     <Link to="/profile" className="text-white">Profile</Link>
                     <Link to="/order-history" className="text-white">Order History</Link>
                     <button onClick={handleLogout} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Logout</button>
                  </>
               ) : (
                  <Link to="/login" className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">Login</Link>
               )}
            </div>
         </div>
      </nav>
   );
}

export default Navbar;