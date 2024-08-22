import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function AdminUsers() {
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);

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
         setLoading(false);
      }
   };

   const handleRoleChange = async (userId, newRole) => {
      try {
         await api.put(`/admin/users/${userId}`, { role: newRole });
         setUsers(users.map(user => 
         user.id === userId ? { ...user, role: newRole } : user
         ));
      } catch (error) {
         console.error('Error updating user role:', error);
      }
   };

   if (loading) {
      return <div>Loading...</div>;
   }

   return (
      <div className="container mx-auto mt-8">
         <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
         <table className="w-full">
         <thead>
            <tr>
               <th>ID</th>
               <th>Username</th>
               <th>Email</th>
               <th>Role</th>
               <th>Actions</th>
            </tr>
         </thead>
         <tbody>
            {users.map(user => (
               <tr key={user.id}>
               <td>{user.id}</td>
               <td>{user.username}</td>
               <td>{user.email}</td>
               <td>{user.role}</td>
               <td>
                  <select 
                     value={user.role} 
                     onChange={(e) => handleRoleChange(user.id, e.target.value)}
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