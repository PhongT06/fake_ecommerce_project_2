import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../utils/api';

function PaymentForm({ onSubmit }) {
   const stripe = useStripe();
   const elements = useElements();
   const [error, setError] = useState(null);
   const [processing, setProcessing] = useState(false);

   const handleSubmit = async (event) => {
      event.preventDefault();
      setProcessing(true);

      if (!stripe || !elements) {
         return;
      }

      const result = await stripe.createPaymentMethod({
         type: 'card',
         card: elements.getElement(CardElement),
      });

      if (result.error) {
         setError(result.error.message);
         setProcessing(false);
      } else {
         onSubmit(result.paymentMethod);
      }
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <div className="bg-gray-50 p-4 rounded-md">
            <CardElement options={{style: {base: {fontSize: '16px'}}}} />
         </div>
         {error && <div className="text-red-500">{error}</div>}
         <button 
            type="submit" 
            disabled={!stripe || processing} 
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50"
         >
            {processing ? 'Processing...' : 'Pay Now'}
         </button>
      </form>
   );
}

export default PaymentForm;