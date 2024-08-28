import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

function Register() {
   const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstname: '',
      lastname: '',
   });
   const [error, setError] = useState('');
   const [successMessage, setSuccessMessage] = useState('');
   const navigate = useNavigate();
   const { login } = useAuth();

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccessMessage('');
   
      if (formData.password !== formData.confirmPassword) {
         setError("Passwords don't match");
         return;
      }
   
      try {
         const response = await api.post('/auth/register', formData);
         console.log('Registration response:', response.data);
         
         setSuccessMessage('Registration successful! Logging you in...');
         
         const success = await login(formData.username, formData.password);
         if (success) {
            setTimeout(() => {
               navigate('/');
            }, 2000);
         } else {
            setError('Registration successful, but login failed. Please try logging in.');
         }
      } catch (err) {
         console.error('Registration error:', err.response ? err.response.data : err);
         setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
   };

   return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
         <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
         </div>

         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
               <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
                  <p className="font-bold">Demo Project</p>
                  <p>This is a showcase e-commerce website. You can use fake information to register and test out the site.</p>
                  <p className="mt-2">Example:</p>
                  <ul className="list-disc list-inside ml-4">
                     <li>Username: testuser123</li>
                     <li>Email: testuser@example.com</li>
                     <li>Password: password123</li>
                  </ul>
               </div>

               {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
               {successMessage && <p className="text-green-500 mb-4 text-center">{successMessage}</p>}
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                     <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                     <div className="mt-1">
                        <input
                           id="username"
                           name="username"
                           type="text"
                           required
                           value={formData.username}
                           onChange={handleChange}
                           className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                     </div>
                  </div>

                  <div>
                     <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                     <div className="mt-1">
                        <input
                           id="email"
                           name="email"
                           type="email"
                           required
                           value={formData.email}
                           onChange={handleChange}
                           className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                           value={formData.password}
                           onChange={handleChange}
                           className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                     </div>
                  </div>

                  <div>
                     <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                     <div className="mt-1">
                        <input
                           id="confirmPassword"
                           name="confirmPassword"
                           type="password"
                           required
                           value={formData.confirmPassword}
                           onChange={handleChange}
                           className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                     </div>
                  </div>

                  <div>
                     <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">First Name</label>
                     <div className="mt-1">
                        <input
                           id="firstname"
                           name="firstname"
                           type="text"
                           value={formData.firstname}
                           onChange={handleChange}
                           className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                     </div>
                  </div>

                  <div>
                     <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Last Name</label>
                     <div className="mt-1">
                        <input
                           id="lastname"
                           name="lastname"
                           type="text"
                           value={formData.lastname}
                           onChange={handleChange}
                           className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                     </div>
                  </div>

                  <div>
                     <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Register
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
                           Already have an account?
                        </span>
                     </div>
                  </div>

                  <div className="mt-6">
                     <Link
                        to="/login"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                     >
                        Sign in
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

export default Register;