import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

function Cart() {
   const [cart, setCart] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const navigate = useNavigate();
   const { updateCartItemCount } = useCart();

   useEffect(() => {
      fetchCart();
   }, [fetchCart]);

   const fetchCart = async () => {
      try {
         const response = await api.get('/user/cart');
         setCart(response.data);
         setLoading(false);
         updateCartItemCount();
      } catch (err) {
         console.error('Error fetching cart:', err);
         if (err.response && err.response.status === 401) {
            setError('unauthorized');
         } else {
            setError('Failed to fetch cart. Please try again.');
         }
         setLoading(false);
      }
   };

   const updateQuantity = async (productId, quantity) => {
      try {
         await api.put('/user/cart', { product_id: productId, quantity });
         fetchCart();
         updateCartItemCount();
      } catch (err) {
         setError('Failed to update cart. Please try again.');
      }
   };

   const removeItem = async (productId) => {
      try {
         await api.put('/user/cart', { product_id: productId, quantity: 0 });
         fetchCart();
         updateCartItemCount();
      } catch (err) {
         setError('Failed to remove item. Please try again.');
      }
   };

   if (loading) {
      return (
         <div className="max-w-2xl mx-auto mt-8 text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-xl">Loading your cart...</p>
         </div>
      );
   }
   
   if (error === 'unauthorized') {
      return (
         <div className="max-w-2xl mx-auto mt-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Your Cart</h2>
            <p className="mb-6 text-xl">Please log in to view your cart.</p>
            <Link to="/login" className="bg-blue-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors duration-300 shadow-md">
               Log In
            </Link>
         </div>
      );
   }

   if (error) {
      return (
         <div className="max-w-2xl mx-auto mt-8 text-center">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
               <p className="font-bold">Error</p>
               <p>{error}</p>
            </div>
         </div>
      );
   }

   if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return (
         <div className="max-w-2xl mx-auto mt-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Your Cart</h2>
            <ShoppingCart className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">Your cart is empty.</p>
            <Link to="/products" className="mt-6 inline-block bg-blue-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors duration-300 shadow-md">
               Start Shopping
            </Link>
         </div>
      );
   }

   const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

   return (
      <div className="max-w-2xl mx-auto mt-8 px-4">
         <h2 className="text-3xl font-bold mb-8 text-center">Your Cart</h2>
         <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            {cart.items.map(item => (
               <div key={item.product_id} className="flex flex-col sm:flex-row items-center justify-between border-b py-4 last:border-b-0">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                     <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                     <div>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                     </div>
                  </div>
                  <div className="flex items-center space-x-4">
                     <div className="flex items-center border rounded">
                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100 transition-colors duration-200">
                           <Minus size={14} />
                        </button>
                        <span className="px-2 py-1 border-x">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100 transition-colors duration-200">
                           <Plus size={14} />
                        </button>
                     </div>
                     <p className="font-semibold text-lg w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                     <button onClick={() => removeItem(item.product_id)} className="text-red-500 hover:text-red-700 transition-colors duration-200">
                        <Trash2 size={18} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
         <div className="bg-gray-100 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
               <span className="text-xl">Total:</span>
               <span className="font-bold text-2xl">${total.toFixed(2)}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
               <button 
                  onClick={() => navigate('/products')}
                  className="w-full sm:w-1/2 bg-blue-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors duration-300 shadow-md flex items-center justify-center"
               >
                  <ArrowLeft size={20} className="mr-2" />
                  Back to Shop
               </button>
               <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full sm:w-1/2 bg-green-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-600 transition-colors duration-300 shadow-md"
               >
                  Proceed to Checkout
               </button>
            </div>
         </div>
      </div>
   );
}

export default Cart;