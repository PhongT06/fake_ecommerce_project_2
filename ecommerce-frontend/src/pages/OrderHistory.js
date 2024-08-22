import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function OrderHistory() {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      fetchOrders();
   }, []);

   const fetchOrders = async () => {
      try {
         setLoading(true);
         const response = await api.get('/user/orders');
         setOrders(response.data);
         setLoading(false);
      } catch (err) {
         console.error('Error fetching orders:', err);
         setError('Failed to fetch order history. Please try again.');
         setLoading(false);
      }
   };

   if (loading) return <div>Loading...</div>;
   if (error) return <div className="text-red-500">{error}</div>;

   return (
      <div className="container mx-auto mt-8 p-4">
         <h2 className="text-2xl font-bold mb-4">Order History</h2>
         {orders.length === 0 ? (
               <p>You haven't placed any orders yet.</p>
         ) : (
               <div className="space-y-4">
                  {orders.map((order) => (
                     <div key={order.id} className="border p-4 rounded-lg">
                           <h3 className="text-xl font-semibold mb-2">Order #{order.id}</h3>
                           <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                           <p><strong>Total:</strong> ${order.total_amount.toFixed(2)}</p>
                           <p><strong>Status:</strong> {order.status}</p>
                           <h4 className="font-semibold mt-2">Items:</h4>
                           <ul>
                              {order.items.map((item, index) => (
                                 <li key={index}>
                                       {item.title} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                                 </li>
                              ))}
                           </ul>
                           <Link to={`/order-confirmation/${order.id}`} className="text-blue-500 hover:underline mt-2 inline-block">
                              View Details
                           </Link>
                     </div>
                  ))}
               </div>
         )}
      </div>
   );
}

export default OrderHistory;