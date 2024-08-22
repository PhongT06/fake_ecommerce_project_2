import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductCarousel = ({ products = [] }) => {
   console.log('ProductCarousel received products:', products);

   const [currentIndex, setCurrentIndex] = useState(0);
   const [flippedCards, setFlippedCards] = useState({});

   const nextSlide = () => {
      setCurrentIndex((prevIndex) => 
         prevIndex === products.length - 1 ? 0 : prevIndex + 1
      );
   };

   const prevSlide = () => {
      setCurrentIndex((prevIndex) => 
         prevIndex === 0 ? products.length - 1 : prevIndex - 1
      );
   };

   const toggleCardFlip = (id) => {
      setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
   };

   useEffect(() => {
      const timer = setInterval(() => {
         if (products.length > 1) {
         nextSlide();
         }
      }, 5000);

      return () => clearInterval(timer);
   }, [currentIndex, products.length]);

   if (!products || products.length === 0) {
      console.log('No products available in ProductCarousel');
      return <div className="bg-red-200 p-4 border-2 border-red-500">No products available in ProductCarousel.</div>;
   }

   console.log('Rendering ProductCarousel with', products.length, 'products');

   return (
      <div className="relative w-full max-w-4xl mx-auto bg-blue-200 p-4 border-2 border-blue-500 min-h-[400px]">
         <div className="text-center mb-4">Debug: ProductCarousel is rendering</div>
         <div className="overflow-hidden">
         <div 
            className="flex transition-transform duration-300 ease-in-out" 
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
         >
            {products.map((product) => (
               <div key={product.id} className="w-full flex-shrink-0 px-4">
               <div className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-500 ${flippedCards[product.id] ? 'rotate-y-180' : ''}`}>
                  <div className="relative">
                     <img src={product.image} alt={product.title} className="w-full h-64 object-cover" />
                     <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                     <button 
                        onClick={() => toggleCardFlip(product.id)}
                        className="bg-white text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300"
                     >
                        View Details
                     </button>
                     </div>
                  </div>
                  <div className="p-4">
                     <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                     <p className="text-gray-600 mb-2">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>
                     {product.category && (
                     <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                        {product.category}
                     </span>
                     )}
                  </div>
                  {flippedCards[product.id] && (
                     <div className="absolute inset-0 bg-white p-4 transform rotate-y-180">
                     <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                     <p className="text-gray-600 mb-4">{product.description}</p>
                     <button 
                        onClick={() => toggleCardFlip(product.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300"
                     >
                        Back to Front
                     </button>
                     </div>
                  )}
               </div>
               </div>
            ))}
         </div>
         </div>
         {products.length > 1 && (
         <>
            <button
               onClick={prevSlide}
               className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors duration-300"
            >
               <ChevronLeft className="w-6 h-6" />
            </button>
            <button
               onClick={nextSlide}
               className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors duration-300"
            >
               <ChevronRight className="w-6 h-6" />
            </button>
         </>
         )}
      </div>
   );
};

export default ProductCarousel;