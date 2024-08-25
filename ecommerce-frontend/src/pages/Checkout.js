import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ShippingForm from '../components/ShippingForm';
import PaymentForm from '../components/PaymentForm';
import OrderReview from '../components/OrderReview';
import api from '../utils/api';
import { CreditCard, Truck, ClipboardList } from 'lucide-react';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function Checkout() {
   const [step, setStep] = useState(1);
   const [shippingInfo, setShippingInfo] = useState({});
   const [paymentInfo, setPaymentInfo] = useState({});
   const [cartItems, setCartItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const navigate = useNavigate();

   useEffect(() => {
      fetchCartItems();
   }, []);

   const fetchCartItems = async () => {
      try {
         setLoading(true);
         const response = await api.get('/user/cart');
         setCartItems(response.data.items || []);
         setLoading(false);
      } catch (error) {
         console.error('Error fetching cart items:', error);
         setError('Failed to fetch cart items. Please try again.');
         setLoading(false);
      }
   };

   const handleShippingSubmit = (data) => {
      setShippingInfo(data);
      setStep(2);
   };

   const handlePaymentSubmit = (paymentMethod) => {
      setPaymentInfo(paymentMethod);
      setStep(3);
   };

   const handlePlaceOrder = async () => {
      try {
         const orderData = {
            total_amount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
            shipping_address: `${shippingInfo.name}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.postalCode}, ${shippingInfo.country}`,
            items: cartItems.map(item => ({
               product_id: item.product_id,
               quantity: item.quantity,
               price: item.price,
               title: item.title
            })),
            payment_method_id: paymentInfo.id
         };

         const orderResponse = await api.post('/orders', orderData);

         // Clear the cart after successful order placement
         await api.delete('/user/cart');

         navigate(`/order-confirmation/${orderResponse.data.order_id}`);
      } catch (error) {
         console.error('Error placing order:', error);
         setError('Failed to place order. Please try again.');
      }
   };

   if (loading) {
      return (
         <div className="container mx-auto mt-8 text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-xl">Loading checkout...</p>
         </div>
      );
   }

   if (error) {
      return (
         <div className="container mx-auto mt-8 text-center">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
               <p className="font-bold">Error</p>
               <p>{error}</p>
            </div>
         </div>
      );
   }

   return (
      <div className="container mx-auto mt-8 px-4 max-w-4xl">
         <h2 className="text-3xl font-bold mb-8 text-center">Checkout</h2>

         <div className="flex justify-between mb-8">
            <div className={`flex-1 text-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
               <div className="flex items-center justify-center mb-2">
                  <Truck size={24} className="mr-2" />
                  <span className="font-semibold">Shipping</span>
               </div>
               <div className="h-1 bg-blue-600"></div>
            </div>
            <div className={`flex-1 text-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
               <div className="flex items-center justify-center mb-2">
                  <CreditCard size={24} className="mr-2" />
                  <span className="font-semibold">Payment</span>
               </div>
               <div className="h-1 bg-blue-600"></div>
            </div>
            <div className={`flex-1 text-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
               <div className="flex items-center justify-center mb-2">
                  <ClipboardList size={24} className="mr-2" />
                  <span className="font-semibold">Review</span>
               </div>
               <div className="h-1 bg-blue-600"></div>
            </div>
         </div>

         <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            {step === 1 && <ShippingForm onSubmit={handleShippingSubmit} />}
            {step === 2 && (
               <Elements stripe={stripePromise}>
                  <PaymentForm onSubmit={handlePaymentSubmit} />
               </Elements>
            )}
            {step === 3 && (
               <OrderReview
                  shippingInfo={shippingInfo}
                  paymentInfo={paymentInfo}
                  cartItems={cartItems}
                  onPlaceOrder={handlePlaceOrder}
               />
            )}
         </div>
      </div>
   );
}

export default Checkout;