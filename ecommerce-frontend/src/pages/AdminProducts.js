import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function AdminProducts() {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchProducts();
   }, []);

   const fetchProducts = async () => {
      try {
         const response = await api.get('/admin/products');
         setProducts(response.data);
         setLoading(false);
      } catch (error) {
         console.error('Error fetching products:', error);
         setLoading(false);
      }
   };

   const handleDelete = async (productId) => {
      try {
         await api.delete(`/admin/products/${productId}`);
         setProducts(products.filter(product => product.id !== productId));
      } catch (error) {
         console.error('Error deleting product:', error);
      }
   };

   if (loading) {
      return <div>Loading...</div>;
   }

   return (
      <div className="container mx-auto mt-8">
         <h2 className="text-2xl font-bold mb-4">Manage Products</h2>
         <table className="w-full">
         <thead>
            <tr>
               <th>ID</th>
               <th>Title</th>
               <th>Price</th>
               <th>Actions</th>
            </tr>
         </thead>
         <tbody>
            {products.map(product => (
               <tr key={product.id}>
               <td>{product.id}</td>
               <td>{product.title}</td>
               <td>${product.price}</td>
               <td>
                  <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                  <button 
                     className="bg-red-500 text-white px-2 py-1 rounded"
                     onClick={() => handleDelete(product.id)}
                  >
                     Delete
                  </button>
               </td>
               </tr>
            ))}
         </tbody>
         </table>
      </div>
   );
}

export default AdminProducts;