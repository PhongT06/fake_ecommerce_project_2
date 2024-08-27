import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, ShoppingCart, Menu, User, Package, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function Navbar() {
   const { user, logout, updateUser } = useAuth();
   const { cartItemCount, updateCartItemCount } = useCart();
   const [searchTerm, setSearchTerm] = useState('');
   const [setCategories] = useState([]);
   const [selectedCategory] = useState('');
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const navigate = useNavigate();

   
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
   
   useEffect(() => {
      fetchCategories();
      if (!user) {
         checkUserStatus();
      }
   }, [user, checkUserStatus, fetchCategories]);

   const handleLogout = () => {
      logout();
      updateCartItemCount();
      navigate('/login');
   };

   const handleSearch = (e) => {
      e.preventDefault();
      if (searchTerm.trim()) {
         navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}&category=${encodeURIComponent(selectedCategory)}`);
      }
   };

   const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
   };

   return (
      <nav className="bg-gray-800 p-4">
         <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
               <Link to="/" className="text-white text-xl font-bold">NeoVerse Market</Link>
               {user && (
                  <span className="text-white text-lg font-semibold hidden md:inline-block">
                     Welcome, {user.username}
                  </span>
               )}
            </div>

            <form onSubmit={handleSearch} className="flex-grow max-w-md mx-4 hidden md:flex">
               <div className="flex w-full">
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

            <div className="flex items-center space-x-6">
               <Link to="/products" className="text-white hidden md:inline-block">Products</Link>
               <Link to="/cart" className="text-white relative">
                  <ShoppingCart size={24} />
                  {cartItemCount > 0 && (
                     <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {cartItemCount}
                     </span>
                  )}
               </Link>
               <button onClick={toggleMenu} className="text-white">
                  <Menu size={24} />
               </button>
            </div>
         </div>

         {/* Dropdown Menu */}
         {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
               {user ? (
                  <>
                     <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User size={18} className="inline-block mr-2" />
                        Profile
                     </Link>
                     {user.role === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                           <Package size={18} className="inline-block mr-2" />
                           Admin Dashboard
                        </Link>
                     )}
                     <Link to="/order-history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Package size={18} className="inline-block mr-2" />
                        Order History
                     </Link>
                     <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <LogOut size={18} className="inline-block mr-2" />
                        Logout
                     </button>
                  </>
               ) : (
                  <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                     <LogIn size={18} className="inline-block mr-2" />
                     Log In
                  </Link>
               )}
            </div>
         )}
      </nav>
   );
}

export default Navbar;