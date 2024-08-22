import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ProductDetails() {
   const [product, setProduct] = useState(null);
   const [loading, setLoading] = useState(true);
   const { id } = useParams();

   useEffect(() => {
      axios.get(`http://localhost:5000/api/products/${id}`)
         .then(response => {
         setProduct(response.data);
         setLoading(false);
         })
         .catch(error => {
         console.error('Error fetching product details:', error);
         setLoading(false);
         });
   }, [id]);

   if (loading) {
      return <div className="container mx-auto mt-8">Loading...</div>;
   }

   if (!product) {
      return <div className="container mx-auto mt-8">Product not found</div>;
   }

   return (
      <div className="container mx-auto mt-8">
         <div className="flex flex-col md:flex-row">
         <img src={product.image} alt={product.title} className="w-full md:w-1/2 h-64 object-cover mb-4 md:mb-0 md:mr-4" />
         <div>
            <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
            <p className="text-gray-600 mb-2">${product.price}</p>
            <p className="mb-4">{product.description}</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">Add to Cart</button>
         </div>
         </div>
      </div>
   );
}

export default ProductDetails;