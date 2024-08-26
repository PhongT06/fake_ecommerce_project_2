import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';

function ProductDetails() {
   const [product, setProduct] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [quantity, setQuantity] = useState(1);
   const [notification, setNotification] = useState(null);
   const { id } = useParams();
   const { addToCart } = useCart();

   const fetchProduct = useCallback(async () => {
      try {
         const response = await api.get(`/products/${id}`);
         setProduct(response.data);
         setLoading(false);
      } catch (err) {
         console.error('Error fetching product details:', err);
         setError('Failed to fetch product details. Please try again.');
         setLoading(false);
      }
   }, [id]);

   useEffect(() => {
      fetchProduct();
   }, [fetchProduct]);

   const handleAddToCart = useCallback(async () => {
      try {
         console.log('Adding to cart:', { product_id: id, quantity });
         await addToCart(id, quantity);
         console.log('Successfully added to cart');
         setNotification(`${quantity} ${product.title}${quantity > 1 ? 's have' : ' has'} been added to your cart!`);
      } catch (err) {
         console.error('Error adding item to cart:', err);
         setError('Failed to add item to cart. Please try again.');
      }
   }, [id, quantity, product, addToCart]);

   if (loading) return <div className="container mx-auto mt-8">Loading...</div>;
   if (error) return <div className="container mx-auto mt-8 text-red-500">{error}</div>;
   if (!product) return <div className="container mx-auto mt-8">Product not found</div>;

   return (
      <div className="container mx-auto mt-8">
         {notification && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
               <span className="block sm:inline">{notification}</span>
               <div className="flex justify-end space-x-2 mt-2">
                  <button
                     onClick={() => setNotification(null)}
                     className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                     Continue Shopping
                  </button>
                  <Link
                     to="/cart"
                     className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                     Go to Cart
                  </Link>
               </div>
            </div>
         )}
         <div className="flex flex-col md:flex-row">
            <img src={product.image} alt={product.title} className="w-full md:w-1/2 h-64 object-cover mb-4 md:mb-0 md:mr-4" />
            <div>
               <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
               <p className="text-gray-600 mb-2">${product.price}</p>
               <p className="mb-4">{product.description}</p>
               <div className="flex items-center mb-4">
                  <label htmlFor="quantity" className="mr-2">Quantity:</label>
                  <input
                     type="number"
                     id="quantity"
                     min="1"
                     value={quantity}
                     onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                     className="border rounded px-2 py-1 w-16"
                  />
               </div>
               <button 
                  onClick={handleAddToCart}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
               >
                  Add to Cart
               </button>
            </div>
         </div>
      </div>
   );
}

export default ProductDetails;