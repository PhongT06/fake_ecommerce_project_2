import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Cart() {
   const [cart, setCart] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const navigate = useNavigate();

   useEffect(() => {
      fetchCart();
   }, []);

   const fetchCart = async () => {
      try {
         const response = await api.get('/user/cart');
         setCart(response.data);
         setLoading(false);
      } catch (err) {
         console.error('Error fetching cart:', err);
         if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(err.response.data);
            console.log(err.response.status);
            console.log(err.response.headers);
            if (err.response.status === 401) {
               setError('unauthorized');
            } else {
               setError(`Server error: ${err.response.data.message || 'Unknown error'}`);
            }
         } else if (err.request) {
            // The request was made but no response was received
            console.log(err.request);
            setError('No response received from server. Please check your internet connection.');
         } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', err.message);
            setError(`Error: ${err.message}`);
         }
         setLoading(false);
      }
   };

   const updateQuantity = async (productId, quantity) => {
      try {
         await api.put('/user/cart', { product_id: productId, quantity });
         fetchCart();
      } catch (err) {
         setError('Failed to update cart. Please try again.');
      }
   };

   const removeItem = async (productId) => {
      try {
         await api.put('/user/cart', { product_id: productId, quantity: 0 });
         fetchCart();
      } catch (err) {
         setError('Failed to remove item. Please try again.');
      }
   };

   if (loading) return <div className="container mx-auto mt-8">Loading...</div>;
   
   if (error === 'unauthorized') {
      return (
         <div className="container mx-auto mt-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
            <p className="mb-4">Please log in to view your cart.</p>
            <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
               Log In
            </Link>
         </div>
      );
   }

   if (error) return <div className="container mx-auto mt-8 text-red-500">{error}</div>;

   return (
      <div className="container mx-auto mt-8">
         <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
         {cart.length === 0 ? (
         <p>Your cart is empty.</p>
         ) : (
         <div>
            {cart.map(item => (
               <div key={item.product_id} className="flex items-center justify-between border-b py-4">
               <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-gray-600">${item.price} x {item.quantity}</p>
               </div>
               <div className="flex items-center">
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="px-2 py-1 bg-gray-200 rounded">-</button>
                  <span className="mx-2">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                  <button onClick={() => removeItem(item.product_id)} className="ml-4 text-red-500">Remove</button>
               </div>
               </div>
            ))}
            <div className="mt-4 text-xl font-bold">
               Total: ${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
            </div>
         </div>
         )}
      </div>
   );
}

export default Cart;