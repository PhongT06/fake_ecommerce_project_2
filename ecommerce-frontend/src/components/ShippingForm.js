import React, { useState } from 'react';

function ShippingForm({ onSubmit }) {
   const [formData, setFormData] = useState({
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
   });

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <div>
            <label htmlFor="name" className="block mb-1">Full Name:</label>
            <input
               type="text"
               id="name"
               name="name"
               value={formData.name}
               onChange={handleChange}
               required
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <div>
            <label htmlFor="address" className="block mb-1">Address:</label>
            <input
               type="text"
               id="address"
               name="address"
               value={formData.address}
               onChange={handleChange}
               required
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <div>
            <label htmlFor="city" className="block mb-1">City:</label>
            <input
               type="text"
               id="city"
               name="city"
               value={formData.city}
               onChange={handleChange}
               required
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <div>
            <label htmlFor="state" className="block mb-1">State:</label>
            <input
               type="text"
               id="state"
               name="state"
               value={formData.state}
               onChange={handleChange}
               required
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <div>
            <label htmlFor="country" className="block mb-1">Country:</label>
            <input
               type="text"
               id="country"
               name="country"
               value={formData.country}
               onChange={handleChange}
               required
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <div>
            <label htmlFor="postalCode" className="block mb-1">Postal Code:</label>
            <input
               type="text"
               id="postalCode"
               name="postalCode"
               value={formData.postalCode}
               onChange={handleChange}
               required
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Continue to Payment
         </button>
      </form>
   );
}

export default ShippingForm;