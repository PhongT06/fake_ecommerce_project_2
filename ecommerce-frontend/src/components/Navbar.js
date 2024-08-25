import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search } from 'lucide-react';

function Navbar() {
   const [user, setUser] = useState(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [categories, setCategories] = useState([]);
   const [selectedCategory, setSelectedCategory] = useState('');
   const navigate = useNavigate();

   useEffect(() => {
      fetchUser();
      fetchCategories();
   }, []);

   const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
         try {
            const response = await api.get('/user/profile');
            setUser(response.data);
         } catch (error) {
            console.error('Error fetching user profile:', error);
            localStorage.removeItem('token');
            setUser(null);
         }
      } else {
         setUser(null);
      }
   };

   const fetchCategories = async () => {
      try {
         const response = await api.get('/all-categories');
         setCategories(response.data);
      } catch (err) {
         console.error('Error fetching categories:', err);
      }
   };

   useEffect(() => {
      fetchUser();
   }, []);

   useEffect(() => {
      // Listen for changes in localStorage
      const handleStorageChange = () => {
         fetchUser();
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
         window.removeEventListener('storage', handleStorageChange);
      };
   }, []);

   const handleLogout = () => {
      localStorage.removeItem('token');
      setUser(null);
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
            </div>

            <div className="flex items-center space-x-4">
               {user && (
                  <span className="text-white text-lg font-semibold">Welcome, {user.username}</span>
               )}
            </div>

            <form onSubmit={handleSearch} className="flex-grow max-w-md mx-4">
               <div className="flex">
                  <input
                     type="text"
                     placeholder="Search products..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full px-4 py-2 rounded-r-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-r-full hover:bg-blue-600">
                     <Search className="inline-block" />
                  </button>
               </div>
            </form>

            <div className="flex items-center space-x-4">
               {user ? (
                  <>
                     <Link to="/profile" className="text-white">Profile</Link>
                     <Link to="/order-history" className="text-white">Order History</Link> {/* Add this line */}
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