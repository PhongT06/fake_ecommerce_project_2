import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

function OrderConfirmation() {
   const [order, setOrder] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const { orderId } = useParams();

   useEffect(() => {
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

      fetchOrder();
   }, [orderId]);

   if (loading) return <div>Loading...</div>;
   if (error) return <div className="text-red-500">{error}</div>;
   if (!order) return <div>No order found</div>;

   // Parse shipping address
   let addressLines = [];
   if (order.shipping_address) {
      addressLines = order.shipping_address.split(',').map(part => part.trim());
   }

   return (
      <div className="container mx-auto mt-8 p-4">
         <h2 className="text-2xl font-bold mb-4">Order Confirmation</h2>
         <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p className="font-bold">Thank you for your order!</p>
            <p>Your order has been successfully placed.</p>
         </div>
         <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Order Details</h3>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Total Amount:</strong> ${order.total_amount.toFixed(2)}</p>
         </div>
         <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Shipping Information</h3>
            {addressLines.map((line, index) => (
               <p key={index}>{line}</p>
            ))}
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
         <Link to="/" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Go to Home Page
         </Link>
      </div>
   );
}

export default OrderConfirmation;