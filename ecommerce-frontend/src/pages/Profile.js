import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Profile() {
   const [profile, setProfile] = useState({
      username: '',
      email: '',
      firstname: '',
      lastname: '',
      address: '',
      phone: ''
   });
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [successMessage, setSuccessMessage] = useState('');

   useEffect(() => {
      fetchProfile();
   }, []);

   const fetchProfile = async () => {
      try {
         const response = await api.get('/user/profile');
         setProfile(response.data);
         setLoading(false);
      } catch (err) {
         setError('Failed to fetch profile. Please try again.');
         setLoading(false);
      }
   };

   const handleChange = (e) => {
      setProfile({ ...profile, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccessMessage('');
      try {
         await api.put('/user/profile', profile);
         setSuccessMessage('Profile updated successfully');
      } catch (err) {
         setError('Failed to update profile. Please try again.');
      }
   };

   if (loading) return <div className="container mx-auto mt-8">Loading...</div>;

   return (
      <div className="container mx-auto mt-8 max-w-md">
         <h2 className="text-2xl font-bold mb-4">User Profile</h2>
         {error && <p className="text-red-500 mb-4">{error}</p>}
         {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
         <form onSubmit={handleSubmit} className="space-y-4">
         <div>
            <label htmlFor="username" className="block mb-1">Username:</label>
            <input
               type="text"
               id="username"
               name="username"
               value={profile.username}
               readOnly
               className="w-full px-3 py-2 border rounded bg-gray-100"
            />
         </div>
         <div>
            <label htmlFor="email" className="block mb-1">Email:</label>
            <input
               type="email"
               id="email"
               name="email"
               value={profile.email}
               onChange={handleChange}
               required
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <div>
            <label htmlFor="firstname" className="block mb-1">First Name:</label>
            <input
               type="text"
               id="firstname"
               name="firstname"
               value={profile.firstname}
               onChange={handleChange}
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <div>
            <label htmlFor="lastname" className="block mb-1">Last Name:</label>
            <input
               type="text"
               id="lastname"
               name="lastname"
               value={profile.lastname}
               onChange={handleChange}
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <div>
            <label htmlFor="address" className="block mb-1">Address:</label>
            <input
               type="text"
               id="address"
               name="address"
               value={profile.address}
               onChange={handleChange}
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <div>
            <label htmlFor="phone" className="block mb-1">Phone:</label>
            <input
               type="tel"
               id="phone"
               name="phone"
               value={profile.phone}
               onChange={handleChange}
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Update Profile
         </button>
         </form>
      </div>
   );
}

export default Profile;