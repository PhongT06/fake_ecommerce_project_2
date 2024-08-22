import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
         console.log('Cart data:', response.data);
         
         if (response.data && response.data.items) {
            setCart(response.data.items);
         } else {
            setCart([]);
         }
         setLoading(false);
      } catch (err) {
         console.error('Error fetching cart:', err);
         setError('Failed to fetch cart. Please try again. Error: ' + err.message);
         setLoading(false);
      }
   };

   const updateQuantity = async (productId, quantity) => {
      try {
         await api.put('/user/cart', { product_id: productId, quantity });
         fetchCart();
      } catch (err) {
         console.error('Error updating cart:', err);
         setError('Failed to update cart. Please try again. Error: ' + err.message);
      }
   };

   const removeItem = async (productId) => {
      try {
         await api.put('/user/cart', { product_id: productId, quantity: 0 });
         fetchCart();
      } catch (err) {
         console.error('Error removing item:', err);
         setError('Failed to remove item. Please try again. Error: ' + err.message);
      }
   };

   const handleCheckout = () => {
      navigate('/checkout');
   };

   if (loading) return <div className="container mx-auto mt-8">Loading...</div>;
   if (error) return <div className="container mx-auto mt-8 text-red-500">{error}</div>;

   const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

   return (
      <div className="container mx-auto mt-8 px-4">
         <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
         {cart.length === 0 ? (
         <p>Your cart is empty.</p>
         ) : (
         <div>
            {cart.map(item => (
               <div key={item.product_id} className="flex flex-col md:flex-row items-center justify-between border-b py-4">
                  <div className="flex items-center mb-4 md:mb-0">
                     <img src={item.image} alt={item.title} className="w-20 h-20 object-cover mr-4" />
                     <div>
                        <h3 className="font-bold">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                        <p className="text-sm text-gray-500">Category: {item.category}</p>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <p className="text-lg font-semibold mb-2">${item.price.toFixed(2)} x {item.quantity}</p>
                     <div className="flex items-center">
                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="px-2 py-1 bg-gray-200 rounded">-</button>
                        <span className="mx-2">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                        <button onClick={() => removeItem(item.product_id)} className="ml-4 text-red-500">Remove</button>
                     </div>
                  </div>
               </div>
            ))}
            <div className="mt-4 text-xl font-bold">
               Total: ${totalAmount.toFixed(2)}
            </div>
            <button 
               onClick={handleCheckout}
               className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
            >
               Proceed to Checkout
            </button>
         </div>
         )}
      </div>
   );
}

export default Cart;