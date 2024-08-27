import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCarousel = ({ products = [] }) => {
   const [currentIndex, setCurrentIndex] = useState(0);

   const nextSlide = useCallback(() => {
      setCurrentIndex((prevIndex) => 
         prevIndex === products.length - 1 ? 0 : prevIndex + 1
      );
   }, [products.length]);

   const prevSlide = useCallback(() => {
      setCurrentIndex((prevIndex) => 
         prevIndex === 0 ? products.length - 1 : prevIndex - 1
      );
   }, [products.length]);

   useEffect(() => {
      const timer = setInterval(() => {
         if (products.length > 1) {
            nextSlide();
         }
      }, 5000);

      return () => clearInterval(timer);
   }, [nextSlide, products.length]);

   if (!products || products.length === 0) {
      return <div className="text-center text-gray-500">No products available.</div>;
   }

   return (
      <div className="relative w-full max-w-3xl mx-auto">
         <div className="overflow-hidden">
            <div 
               className="flex transition-transform duration-300 ease-in-out" 
               style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
               {products.map((product) => (
                  <div key={product.id} className="w-full flex-shrink-0 px-4">
                     <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-xs mx-auto">
                        <div className="relative h-64">
                           <img src={product.image} alt={product.title} className="w-full h-full object-contain" />
                        </div>
                        <div className="p-4">
                           <h3 className="text-lg font-semibold mb-2 truncate">{product.title}</h3>
                           <p className="text-gray-600 mb-2 font-bold">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>
                           {product.category && (
                              <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold mb-2">
                                 {product.category}
                              </span>
                           )}
                           <Link 
                              to="/products"
                              className="block w-full bg-blue-500 text-white text-center px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 mt-2"
                           >
                              Shop Now
                           </Link>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
         {products.length > 1 && (
            <>
               <button
                  onClick={prevSlide}
                  className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Previous product"
               >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
               </button>
               <button
                  onClick={nextSlide}
                  className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Next product"
               >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
               </button>
            </>
         )}
      </div>
   );
};

export default ProductCarousel;