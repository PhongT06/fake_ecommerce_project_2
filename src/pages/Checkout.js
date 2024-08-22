import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ShippingForm from '../components/ShippingForm';
import PaymentForm from '../components/PaymentForm';
import OrderReview from '../components/OrderReview';
import api from '../utils/api';

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
         console.log('Cart data:', response.data); // For debugging
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
      console.log('Payment Method:', paymentMethod); // For debugging
      setPaymentInfo(paymentMethod);
      setStep(3);
   };

   const handlePlaceOrder = async () => {
      try {
         const orderData = {
            total_amount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
            shipping_address: `${shippingInfo.name}, ${shippingInfo.address}, ${shippingInfo.city} ${shippingInfo.state} ${shippingInfo.postalCode}, ${shippingInfo.country}`,
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
      return <div>Loading...</div>;
   }

   if (error) {
      return <div className="text-red-500">{error}</div>;
   }

   return (
      <div className="container mx-auto mt-8">
         <h2 className="text-2xl font-bold mb-4">Checkout</h2>
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
   );
}

export default Checkout;