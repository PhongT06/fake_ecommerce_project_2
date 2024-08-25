import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function AdminProducts() {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [successMessage, setSuccessMessage] = useState('');
   const [editingProduct, setEditingProduct] = useState(null);
   const [newProduct, setNewProduct] = useState({
      title: '',
      price: '',
      description: '',
      category: '',
      image: ''
   });

   useEffect(() => {
      fetchProducts();
   }, []);

   const fetchProducts = async () => {
      try {
         setLoading(true);
         const response = await api.get('/admin/products');
         setProducts(response.data);
         setLoading(false);
      } catch (error) {
         console.error('Error fetching products:', error);
         setError('Failed to fetch products. Please try again.');
         setLoading(false);
      }
   };

   const handleInputChange = (e, isNewProduct = false) => {
      const { name, value } = e.target;
      if (isNewProduct) {
         setNewProduct(prev => ({ ...prev, [name]: value }));
      } else {
         setEditingProduct(prev => ({ ...prev, [name]: value }));
      }
   };

   const addProduct = async (e) => {
      e.preventDefault();
      try {
         setLoading(true);
         const response = await api.post('/admin/products', newProduct);
         setProducts([...products, response.data]);
         setNewProduct({ title: '', price: '', description: '', category: '', image: '' });
         setSuccessMessage('Product added successfully');
         setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
         console.error('Error adding product:', error);
         setError('Failed to add product. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   const startEditing = (product) => {
      setEditingProduct({ ...product });
   };

   const cancelEditing = () => {
      setEditingProduct(null);
   };

   const saveEdit = async (e) => {
      e.preventDefault();
      try {
         setLoading(true);
         const response = await api.put(`/admin/products/${editingProduct.id}`, editingProduct);
         setProducts(products.map(product => product.id === editingProduct.id ? response.data : product));
         setEditingProduct(null);
         setSuccessMessage('Product updated successfully');
         setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
         console.error('Error editing product:', error);
         setError('Failed to update product. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   const deleteProduct = async (id) => {
      if (window.confirm('Are you sure you want to delete this product?')) {
         try {
            setLoading(true);
            await api.delete(`/admin/products/${id}`);
            setProducts(products.filter(product => product.id !== id));
            setSuccessMessage('Product deleted successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
         } catch (error) {
            console.error('Error deleting product:', error);
            setError('Failed to delete product. Please try again.');
         } finally {
            setLoading(false);
         }
      }
   };

   if (loading) {
      return <div className="text-center mt-8">Loading...</div>;
   }

   return (
      <div className="container mx-auto mt-8 px-4">
         <h2 className="text-2xl font-bold mb-4">Manage Products</h2>
         
         {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
               <strong className="font-bold">Error!</strong>
               <span className="block sm:inline"> {error}</span>
            </div>
         )}
         
         {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
               <strong className="font-bold">Success!</strong>
               <span className="block sm:inline"> {successMessage}</span>
            </div>
         )}
         
         {/* Add New Product Form */}
         <form onSubmit={addProduct} className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h3 className="text-xl font-semibold mb-2">Add New Product</h3>
            <div className="mb-4">
               <input
                  type="text"
                  placeholder="Title"
                  name="title"
                  value={newProduct.title}
                  onChange={(e) => handleInputChange(e, true)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
               />
            </div>
            <div className="mb-4">
               <input
                  type="number"
                  placeholder="Price"
                  name="price"
                  value={newProduct.price}
                  onChange={(e) => handleInputChange(e, true)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
               />
            </div>
            <div className="mb-4">
               <textarea
                  placeholder="Description"
                  name="description"
                  value={newProduct.description}
                  onChange={(e) => handleInputChange(e, true)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
               ></textarea>
            </div>
            <div className="mb-4">
               <input
                  type="text"
                  placeholder="Category"
                  name="category"
                  value={newProduct.category}
                  onChange={(e) => handleInputChange(e, true)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
               />
            </div>
            <div className="mb-4">
               <input
                  type="text"
                  placeholder="Image URL"
                  name="image"
                  value={newProduct.image}
                  onChange={(e) => handleInputChange(e, true)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
               />
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
               Add Product
            </button>
         </form>

         {/* Product List */}
         <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h3 className="text-xl font-semibold mb-2">Product List</h3>
            <table className="w-full">
               <thead>
                  <tr>
                     <th className="px-4 py-2">ID</th>
                     <th className="px-4 py-2">Title</th>
                     <th className="px-4 py-2">Price</th>
                     <th className="px-4 py-2">Category</th>
                     <th className="px-4 py-2">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {products.map(product => (
                     <tr key={product.id}>
                        <td className="border px-4 py-2">{product.id}</td>
                        <td className="border px-4 py-2">{product.title}</td>
                        <td className="border px-4 py-2">${product.price}</td>
                        <td className="border px-4 py-2">{product.category}</td>
                        <td className="border px-4 py-2">
                           <button onClick={() => startEditing(product)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                              Edit
                           </button>
                           <button onClick={() => deleteProduct(product.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                              Delete
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Edit Product Modal */}
         {editingProduct && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
               <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3 text-center">
                     <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Product</h3>
                     <form onSubmit={saveEdit} className="mt-2 px-7 py-3">
                        <input
                           type="text"
                           name="title"
                           value={editingProduct.title}
                           onChange={handleInputChange}
                           className="w-full px-3 py-2 mb-3 text-gray-700 border rounded-lg focus:outline-none"
                           placeholder="Title"
                           required
                        />
                        <input
                           type="number"
                           name="price"
                           value={editingProduct.price}
                           onChange={handleInputChange}
                           className="w-full px-3 py-2 mb-3 text-gray-700 border rounded-lg focus:outline-none"
                           placeholder="Price"
                           required
                        />
                        <textarea
                           name="description"
                           value={editingProduct.description}
                           onChange={handleInputChange}
                           className="w-full px-3 py-2 mb-3 text-gray-700 border rounded-lg focus:outline-none"
                           placeholder="Description"
                           required
                        ></textarea>
                        <input
                           type="text"
                           name="category"
                           value={editingProduct.category}
                           onChange={handleInputChange}
                           className="w-full px-3 py-2 mb-3 text-gray-700 border rounded-lg focus:outline-none"
                           placeholder="Category"
                           required
                        />
                        <input
                           type="text"
                           name="image"
                           value={editingProduct.image}
                           onChange={handleInputChange}
                           className="w-full px-3 py-2 mb-3 text-gray-700 border rounded-lg focus:outline-none"
                           placeholder="Image URL"
                           required
                        />
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300">
                           Save Changes
                        </button>
                     </form>
                     <div className="items-center px-4 py-3">
                        <button
                           id="ok-btn"
                           className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                           onClick={cancelEditing}
                        >
                           Cancel
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

export default AdminProducts;