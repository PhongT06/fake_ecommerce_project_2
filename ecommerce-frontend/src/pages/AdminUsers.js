import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function AdminUsers() {
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      fetchUsers();
   }, []);

   const fetchUsers = async () => {
      try {
         const response = await api.get('/admin/users');
         setUsers(response.data);
         setLoading(false);
      } catch (error) {
         console.error('Error fetching users:', error);
         setError('Failed to fetch users. Please try again.');
         setLoading(false);
      }
   };

   const updateUserRole = async (userId, newRole) => {
      try {
         await api.put(`/admin/users/${userId}`, { role: newRole });
         setUsers(users.map(user => 
         user.id === userId ? { ...user, role: newRole } : user
         ));
      } catch (error) {
         console.error('Error updating user role:', error);
         setError('Failed to update user role. Please try again.');
      }
   };

   if (loading) return <div className="text-center mt-8">Loading users...</div>;
   if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

   return (
      <div className="container mx-auto mt-8">
         <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
         <table className="w-full border-collapse border border-gray-300">
         <thead>
            <tr className="bg-gray-200">
               <th className="border border-gray-300 px-4 py-2">User ID</th>
               <th className="border border-gray-300 px-4 py-2">Username</th>
               <th className="border border-gray-300 px-4 py-2">Email</th>
               <th className="border border-gray-300 px-4 py-2">Role</th>
               <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
         </thead>
         <tbody>
            {users.map(user => (
               <tr key={user.id}>
               <td className="border border-gray-300 px-4 py-2">{user.id}</td>
               <td className="border border-gray-300 px-4 py-2">{user.username}</td>
               <td className="border border-gray-300 px-4 py-2">{user.email}</td>
               <td className="border border-gray-300 px-4 py-2">{user.role}</td>
               <td className="border border-gray-300 px-4 py-2">
                  <select
                     value={user.role}
                     onChange={(e) => updateUserRole(user.id, e.target.value)}
                     className="border rounded px-2 py-1"
                  >
                     <option value="user">User</option>
                     <option value="admin">Admin</option>
                  </select>
               </td>
               </tr>
            ))}
         </tbody>
         </table>
      </div>
   );
}

export default AdminUsers;