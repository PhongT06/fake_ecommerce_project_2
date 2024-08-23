import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ConfirmationModal from '../components/ConfirmationModal';

function OrderHistory() {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedOrderId, setSelectedOrderId] = useState(null);
   const [successMessage, setSuccessMessage] = useState('');

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

   const openCancelModal = (orderId) => {
      setSelectedOrderId(orderId);
      setIsModalOpen(true);
   };

   const handleCancelOrder = async () => {
      try {
         await api.post(`/orders/${selectedOrderId}/cancel`);
         setIsModalOpen(false);
         setSuccessMessage('Your order has been cancelled successfully.');
         fetchOrders();
         setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
      } catch (err) {
         console.error('Error cancelling order:', err);
         setError('Failed to cancel order. Please try again.');
      }
   };

   if (loading) return <div>Loading...</div>;
   if (error) return <div className="text-red-500">{error}</div>;

   return (
      <div className="container mx-auto mt-8 p-4">
         <h2 className="text-2xl font-bold mb-4">Order History</h2>
         {successMessage && (
               <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
                  <p>{successMessage}</p>
               </div>
         )}
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
                           <div className="mt-2 space-x-2">
                              <Link to={`/order-confirmation/${order.id}`} className="text-blue-500 hover:underline">
                                 View Details
                              </Link>
                              {['pending', 'processing'].includes(order.status) && (
                                 <button 
                                       onClick={() => openCancelModal(order.id)}
                                       className="text-red-500 hover:underline"
                                 >
                                       Cancel Order
                                 </button>
                              )}
                           </div>
                     </div>
                  ))}
               </div>
         )}
         <ConfirmationModal 
               isOpen={isModalOpen}
               onClose={() => setIsModalOpen(false)}
               onConfirm={handleCancelOrder}
               message="Cancel Order"
         />
      </div>
   );
}

export default OrderHistory;