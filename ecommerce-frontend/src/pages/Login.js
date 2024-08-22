import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

function Login() {
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const navigate = useNavigate();

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      try {
         const response = await api.post('/auth/login', { username, password });
         localStorage.setItem('token', response.data.token);
         // Trigger localStorage event
         window.dispatchEvent(new Event('storage'));
         if (response.data.role === 'admin') {
            navigate('/admin');
         } else {
            navigate('/');
         }
      } catch (err) {
         setError('Invalid username or password');
      }
   };

   return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
         <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
         </div>

         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
               {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                     <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                     <div className="mt-1">
                        <input
                           id="username"
                           name="username"
                           type="text"
                           required
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}
                           className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                     </div>
                  </div>

                  <div>
                     <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                     <div className="mt-1">
                        <input
                           id="password"
                           name="password"
                           type="password"
                           required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                     </div>
                  </div>

                  <div>
                     <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Sign in
                     </button>
                  </div>
               </form>

               <div className="mt-6">
                  <div className="relative">
                     <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                     </div>
                     <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                           Or
                        </span>
                     </div>
                  </div>

                  <div className="mt-6">
                     <Link
                        to="/register"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                     >
                        Create a new account
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

export default Login;