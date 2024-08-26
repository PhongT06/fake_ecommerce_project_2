import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
   const [cartItemCount, setCartItemCount] = useState(0);

   const updateCartItemCount = async () => {
      try {
         const response = await api.get('/user/cart');
         const totalQuantity = response.data.items.reduce((total, item) => total + item.quantity, 0);
         setCartItemCount(totalQuantity);
      } catch (err) {
         console.error('Error fetching cart items:', err);
      }
   };

   const addToCart = async (productId, quantity) => {
      try {
         await api.post('/user/cart', { product_id: productId, quantity });
         setCartItemCount(prevCount => prevCount + quantity);
      } catch (err) {
         console.error('Error adding item to cart:', err);
         throw err;
      }
   };

   useEffect(() => {
      updateCartItemCount();
   }, []);

   return (
      <CartContext.Provider value={{ cartItemCount, updateCartItemCount, addToCart }}>
         {children}
      </CartContext.Provider>
   );
};

export const useCart = () => useContext(CartContext);