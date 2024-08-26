import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ConfirmationModal from '../components/ConfirmationModal';

function OrderConfirmation() {
   const [order, setOrder] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [successMessage, setSuccessMessage] = useState('');
   const { orderId } = useParams();
   const navigate = useNavigate();

   useEffect(() => {
      fetchOrder();
   }, [orderId]);

   const fetchOrder = async () => {
      try {
         const response = await api.get(`/orders/${orderId}`);
         setOrder(response.data);
         setLoading(false);
      } catch (err) {
         console.error('Error fetching order:', err);
         setError('Failed to fetch order details. Please try again.');
         setLoading(false);
      }
   };

   const handleCancelOrder = async () => {
      try {
         await api.post(`/orders/${orderId}/cancel`);
         setIsModalOpen(false);
         setSuccessMessage('Your order has been cancelled successfully.');
         fetchOrder();  // Refresh the order details
         setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
      } catch (err) {
         console.error('Error cancelling order:', err);
         setError('Failed to cancel order. Please try again.');
      }
   };

   const formatShippingAddress = (address) => {
      const parts = address.split(', ');
      if (parts.length >= 4) {
         return (
            <>
               <p>{parts[0]}</p>
               <p>{parts[1]}</p>
               <p>{`${parts[2]}, ${parts[3]}`}</p>
               {parts[4] && <p>{parts[4]}</p>}
            </>
         );
      }
      return address;
   };

   if (loading) return <div>Loading...</div>;
   if (error) return <div className="text-red-500">{error}</div>;
   if (!order) return <div>No order found</div>;

   return (
      <div className="container mx-auto mt-8 p-4">
         <h2 className="text-2xl font-bold mb-4">Order Confirmation</h2>
         {successMessage ? (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
               <p>{successMessage}</p>
            </div>
         ) : (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
               <p className="font-bold">Thank you for your order!</p>
               <p>Your order has been successfully placed.</p>
            </div>
         )}
         <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Order Details</h3>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Total Amount:</strong> ${order.total_amount.toFixed(2)}</p>
            <p><strong>Status:</strong> {order.status}</p>
         </div>
         <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Shipping Information</h3>
            {formatShippingAddress(order.shipping_address)}
         </div>
         <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Order Items</h3>
            {order.items.map((item, index) => (
               <div key={index} className="flex justify-between border-b py-2">
                  <span>{item.title} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
               </div>
            ))}
         </div>
         <div className="space-x-2">
            <Link to="/" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
               Go to Home Page
            </Link>
            {['pending', 'processing'].includes(order.status) && (
               <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
               >
                  Cancel Order
               </button>
            )}
         </div>
         <ConfirmationModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleCancelOrder}
            message="Cancel Order"
         />
      </div>
   );
}

export default OrderConfirmation;