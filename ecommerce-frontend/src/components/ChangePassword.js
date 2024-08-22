import React, { useState } from 'react';
import api from '../utils/api';

function ChangePassword() {
   const [passwords, setPasswords] = useState({
      current_password: '',
      new_password: '',
      confirm_password: ''
   });
   const [error, setError] = useState('');
   const [successMessage, setSuccessMessage] = useState('');

   const handleChange = (e) => {
      setPasswords({ ...passwords, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccessMessage('');

      if (passwords.new_password !== passwords.confirm_password) {
         setError('New passwords do not match');
         return;
      }

      try {
         await api.post('/user/change-password', {
         current_password: passwords.current_password,
         new_password: passwords.new_password
         });
         setSuccessMessage('Password changed successfully');
         setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      } catch (err) {
         setError('Failed to change password. Please try again.');
      }
   };

   return (
      <div className="mt-8">
         <h3 className="text-xl font-bold mb-4">Change Password</h3>
         {error && <p className="text-red-500 mb-4">{error}</p>}
         {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
         <form onSubmit={handleSubmit} className="space-y-4">
         <div>
            <label htmlFor="current_password" className="block mb-1">Current Password:</label>
            <input
               type="password"
               id="current_password"
               name="current_password"
               value={passwords.current_password}
               onChange={handleChange}
               required
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <div>
            <label htmlFor="new_password" className="block mb-1">New Password:</label>
            <input
               type="password"
               id="new_password"
               name="new_password"
               value={passwords.new_password}
               onChange={handleChange}
               required
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <div>
            <label htmlFor="confirm_password" className="block mb-1">Confirm New Password:</label>
            <input
               type="password"
               id="confirm_password"
               name="confirm_password"
               value={passwords.confirm_password}
               onChange={handleChange}
               required
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
            Change Password
         </button>
         </form>
      </div>
   );
}

export default ChangePassword;