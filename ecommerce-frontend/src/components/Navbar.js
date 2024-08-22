import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Navbar() {
   const [user, setUser] = useState(null);
   const navigate = useNavigate();

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

   return (
      <nav className="bg-gray-800 p-4">
         <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
               <Link to="/" className="text-white text-xl font-bold">E-commerce Store</Link>
               <Link to="/products" className="text-white">Products</Link>
               <Link to="/cart" className="text-white">Cart</Link>
            </div>

            <div className="flex-grow text-center">
               {user && (
                  <span className="text-white text-lg font-semibold">Welcome, {user.username}</span>
               )}
            </div>

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