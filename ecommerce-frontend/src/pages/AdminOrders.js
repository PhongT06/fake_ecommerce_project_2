import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function AdminOrders() {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      fetchOrders();
   }, []);

   const fetchOrders = async () => {
      try {
         const response = await api.get('/admin/orders');
         setOrders(response.data);
         setLoading(false);
      } catch (error) {
         console.error('Error fetching orders:', error);
         setError('Failed to fetch orders. Please try again.');
         setLoading(false);
      }
   };

   const updateOrderStatus = async (orderId, newStatus) => {
      try {
         await api.put(`/admin/orders/${orderId}`, { status: newStatus });
         setOrders(orders.map(order => 
         order.id === orderId ? { ...order, status: newStatus } : order
         ));
      } catch (error) {
         console.error('Error updating order status:', error);
         setError('Failed to update order status. Please try again.');
      }
   };

   if (loading) return <div className="text-center mt-8">Loading orders...</div>;
   if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

   return (
      <div className="container mx-auto mt-8">
         <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>
         <table className="w-full border-collapse border border-gray-300">
         <thead>
            <tr className="bg-gray-200">
               <th className="border border-gray-300 px-4 py-2">Order ID</th>
               <th className="border border-gray-300 px-4 py-2">User ID</th>
               <th className="border border-gray-300 px-4 py-2">Total Amount</th>
               <th className="border border-gray-300 px-4 py-2">Status</th>
               <th className="border border-gray-300 px-4 py-2">Created At</th>
               <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
         </thead>
         <tbody>
            {orders.map(order => (
               <tr key={order.id}>
               <td className="border border-gray-300 px-4 py-2">{order.id}</td>
               <td className="border border-gray-300 px-4 py-2">{order.user_id}</td>
               <td className="border border-gray-300 px-4 py-2">${order.total_amount.toFixed(2)}</td>
               <td className="border border-gray-300 px-4 py-2">{order.status}</td>
               <td className="border border-gray-300 px-4 py-2">{new Date(order.created_at).toLocaleString()}</td>
               <td className="border border-gray-300 px-4 py-2">
                  <select
                     value={order.status}
                     onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                     className="border rounded px-2 py-1"
                  >
                     <option value="pending">Pending</option>
                     <option value="processing">Processing</option>
                     <option value="shipped">Shipped</option>
                     <option value="delivered">Delivered</option>
                     <option value="cancelled">Cancelled</option>
                  </select>
               </td>
               </tr>
            ))}
         </tbody>
         </table>
      </div>
   );
}

export default AdminOrders;