import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../utils/api';

function SearchResults() {
   const [results, setResults] = useState([]);
   const [categories, setCategories] = useState([]);
   const [selectedCategory, setSelectedCategory] = useState('');
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [searchQuery, setSearchQuery] = useState('');
   const location = useLocation();

   useEffect(() => {
      fetchCategories();
      const searchParams = new URLSearchParams(location.search);
      const query = searchParams.get('q');
      const category = searchParams.get('category');
      setSearchQuery(query || '');
      if (query) {
         fetchSearchResults(query, category);
      }
      if (category) {
         setSelectedCategory(category);
      }
   }, [location.search]);

   const fetchCategories = async () => {
      try {
         const response = await api.get('/all-categories');
         setCategories(response.data);
      } catch (err) {
         console.error('Error fetching categories:', err);
      }
   };

   const fetchSearchResults = async (query, category = '') => {
      try {
         setLoading(true);
         const response = await api.get(`/products/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
         setResults(response.data);
         setLoading(false);
      } catch (err) {
         console.error('Error fetching search results:', err);
         setError('Failed to fetch search results. Please try again.');
         setLoading(false);
      }
   };

   const handleCategoryChange = (e) => {
      const category = e.target.value;
      setSelectedCategory(category);
      fetchSearchResults(searchQuery, category);
   };

   if (loading) {
      return <div className="container mx-auto mt-8 text-center">Loading search results...</div>;
   }

   if (error) {
      return <div className="container mx-auto mt-8 text-center text-red-500">{error}</div>;
   }

   return (
      <div className="container mx-auto mt-8">
         <h2 className="text-2xl font-bold mb-4">Search Results for "{searchQuery}"</h2>
         <div className="mb-4">
            <label htmlFor="category" className="mr-2">Filter by category:</label>
            <select
               id="category"
               value={selectedCategory}
               onChange={handleCategoryChange}
               className="border rounded px-2 py-1"
            >
               <option value="">All Categories</option>
               {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
               ))}
            </select>
         </div>
         {results.length === 0 ? (
            <p>No results found. Try a different search term or category.</p>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {results.map(product => (
                  <div key={product.id} className="border rounded-lg overflow-hidden shadow-lg">
                     <img src={product.image} alt={product.title} className="w-full h-48 object-cover"/>
                     <div className="p-4">
                        <h3 className="font-bold text-xl mb-2">{product.title}</h3>
                        <p className="text-gray-700 text-base mb-2">${product.price.toFixed(2)}</p>
                        <p className="text-gray-600 text-sm mb-2">Category: {product.category}</p>
                        <Link to={`/products/${product.id}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                           View Details
                        </Link>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}

export default SearchResults;