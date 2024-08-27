import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

function Products() {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [activeSlide, setActiveSlide] = useState(0);
   const [flippedCards, setFlippedCards] = useState({});
   const [notification, setNotification] = useState(null);
   const navigate = useNavigate();
   const { addToCart } = useCart();

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const response = await api.get('/products');
            setProducts(response.data);
            setLoading(false);
         } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to fetch products. Please try again.');
            setLoading(false);
         }
      };

      fetchProducts();
   }, []);

   const handlePrev = () => {
      setActiveSlide((prev) => (prev === 0 ? products.length - 1 : prev - 1));
   };

   const handleNext = () => {
      setActiveSlide((prev) => (prev === products.length - 1 ? 0 : prev + 1));
   };

   const handleFlip = (productId) => {
      setFlippedCards((prev) => ({ ...prev, [productId]: !prev[productId] }));
   };

   const handleAddToCart = async (product) => {
      try {
         await addToCart(product.id, 1);
         setNotification({
            message: `${product.title} added to cart!`,
            type: 'success'
         });
      } catch (error) {
         console.error('Error adding to cart:', error);
         setNotification({
            message: 'Failed to add item to cart. Please try again.',
            type: 'error'
         });
      }
   };

   const closeNotification = () => {
      setNotification(null);
   };

   const goToCart = () => {
      navigate('/cart');
   };

   if (loading) return <div className="container mx-auto mt-8 p-4 text-center text-lg font-semibold text-blue-600">Loading products...</div>;
   if (error) return <div className="container mx-auto mt-8 p-4 text-center text-lg font-semibold text-red-600">{error}</div>;

   return (
      <div className="bg-blue-600 min-h-screen py-8">
         <div className="container mx-auto mt-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-center text-white">Our Products</h1>
            
            {notification && (
               <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                  <div className="bg-white border border-gray-300 text-gray-700 px-6 py-4 rounded shadow-lg max-w-md w-full">
                     <p className="font-bold text-lg mb-4 text-center">{notification.message}</p>
                     <div className="flex justify-between items-center">
                        <button onClick={closeNotification} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                           Continue Shopping
                        </button>
                        <button onClick={goToCart} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                           Go to Cart
                        </button>
                     </div>
                  </div>
               </div>
            )}

            <div className="relative overflow-hidden">
               <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                  {products.map((product, index) => (
                     <div key={product.id} className="w-full flex-shrink-0 px-4">
                        <div className="mx-auto max-w-md">
                           <div className={`card-container ${flippedCards[product.id] ? 'flipped' : ''}`}>
                              <div className="card">
                                 <div className="card-front">
                                    <div className="h-3/5 overflow-hidden">
                                       <img src={product.image} alt={product.title} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="p-4 h-2/5 flex flex-col justify-between">
                                       <div>
                                          <h3 className="text-xl font-medium text-gray-900">{product.title}</h3>
                                          <p className="mt-1 text-gray-500">${product.price.toFixed(2)}</p>
                                          <div className="mt-2 flex gap-2">
                                             <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                                                {product.category}
                                             </span>
                                          </div>
                                       </div>
                                       <div className="flex justify-between items-center mt-2">
                                          <button
                                             onClick={() => handleFlip(product.id)}
                                             className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                                          >
                                             View Details
                                          </button>
                                          <button
                                             onClick={() => handleAddToCart(product)}
                                             className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition-colors"
                                          >
                                             Add to Cart
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="card-back">
                                    <div className="p-4 h-full flex flex-col justify-between">
                                       <div>
                                          <h3 className="text-xl font-medium text-gray-900 mb-2">{product.title}</h3>
                                          <p className="text-gray-600 mb-4">{product.description}</p>
                                       </div>
                                       <div className="flex justify-between items-center">
                                          <button
                                             onClick={() => handleFlip(product.id)}
                                             className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                                          >
                                             Back to Card
                                          </button>
                                          <button
                                             onClick={() => handleAddToCart(product)}
                                             className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition-colors"
                                          >
                                             Add to Cart
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
               <button
                  onClick={handlePrev}
                  className="absolute top-1/2 left-1/4 transform -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Previous product"
               >
                  <ChevronLeft className="w-8 h-8 text-gray-800" />
               </button>
               <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-1/4 transform -translate-y-1/2 translate-x-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Next product"
               >
                  <ChevronRight className="w-8 h-8 text-gray-800" />
               </button>
            </div>
            <div className="flex justify-center mt-4">
               {products.map((_, index) => (
                  <button
                     key={index}
                     onClick={() => setActiveSlide(index)}
                     className={`h-3 w-3 rounded-full mx-1 ${index === activeSlide ? 'bg-blue-500' : 'bg-gray-300'}`}
                  />
               ))}
            </div>
         </div>
      </div>
   );
}

export default Products;