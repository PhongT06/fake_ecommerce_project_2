import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
   return (
      <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Link to="/admin/products" className="bg-blue-500 text-white p-4 rounded">
            Manage Products
         </Link>
         <Link to="/admin/orders" className="bg-green-500 text-white p-4 rounded">
            View Orders
         </Link>
         <Link to="/admin/users" className="bg-purple-500 text-white p-4 rounded">
            Manage Users
         </Link>
      </div>
      </div>
   );
}

export default AdminDashboard;
