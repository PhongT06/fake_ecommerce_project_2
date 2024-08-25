import React from 'react';

function OrderReview({ shippingInfo, paymentInfo, cartItems, onPlaceOrder }) {
   const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

   return (
      <div className="space-y-4">
         <div>
            <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
            <p>{shippingInfo.name}</p>
            <p>{shippingInfo.address}</p>
            <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}</p>
            <p>{shippingInfo.country}</p>
         </div>
         <div>
            <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
            <p>Card ending in {paymentInfo.card.last4}</p>
         </div>
         <div>
            <h3 className="text-lg font-semibold mb-2">Order Items</h3>
            {cartItems.map(item => (
               <div key={item.product_id} className="flex justify-between items-center border-b py-2">
                  <span>{item.title} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
               </div>
            ))}
            <div className="flex justify-between items-center font-bold mt-2">
               <span>Total</span>
               <span>${total.toFixed(2)}</span>
            </div>
         </div>
         <button 
            onClick={onPlaceOrder}
            className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300"
         >
            Place Order
         </button>
      </div>
   );
}

export default OrderReview;