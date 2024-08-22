import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function AdminOrders() {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);

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
         setLoading(false);
      }
   };

   if (loading) {
      return <div>Loading...</div>;
   }

   return (
      <div className="container mx-auto mt-8">
         <h2 className="text-2xl font-bold mb-4">View Orders</h2>
         <table className="w-full">
         <thead>
            <tr>
               <th>Order ID</th>
               <th>User ID</th>
               <th>Total Amount</th>
               <th>Status</th>
               <th>Created At</th>
            </tr>
         </thead>
         <tbody>
            {orders.map(order => (
               <tr key={order.id}>
               <td>{order.id}</td>
               <td>{order.user_id}</td>
               <td>${order.total_amount}</td>
               <td>{order.status}</td>
               <td>{new Date(order.created_at).toLocaleString()}</td>
               </tr>
            ))}
         </tbody>
         </table>
      </div>
   );
}

export default AdminOrders;