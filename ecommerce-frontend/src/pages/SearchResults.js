import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../utils/api';

function SearchResults() {
   const [results, setResults] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const location = useLocation();

   useEffect(() => {
      const searchQuery = new URLSearchParams(location.search).get('q');
      if (searchQuery) {
         fetchSearchResults(searchQuery);
      }
   }, [location.search]);

   const fetchSearchResults = async (query) => {
      try {
         setLoading(true);
         const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
         setResults(response.data);
         setLoading(false);
      } catch (err) {
         console.error('Error fetching search results:', err);
         setError('Failed to fetch search results. Please try again.');
         setLoading(false);
      }
   };

   if (loading) {
      return <div className="container mx-auto mt-8 text-center">Loading search results...</div>;
   }

   if (error) {
      return <div className="container mx-auto mt-8 text-center text-red-500">{error}</div>;
   }

   return (
      <div className="container mx-auto mt-8">
         <h2 className="text-2xl font-bold mb-4">Search Results</h2>
         {results.length === 0 ? (
            <p>No results found. Try a different search term.</p>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {results.map(product => (
                  <div key={product.id} className="border rounded-lg overflow-hidden shadow-lg">
                     <img src={product.image} alt={product.title} className="w-full h-48 object-cover"/>
                     <div className="p-4">
                        <h3 className="font-bold text-xl mb-2">{product.title}</h3>
                        <p className="text-gray-700 text-base mb-2">${product.price.toFixed(2)}</p>
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