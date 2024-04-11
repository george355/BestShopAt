// ShoppingList.js
import React from 'react';
import '../css/ShoppingList.css';
import axios from 'axios';

const ShoppingList = ({
  activeStores,
  selectedProducts,
  onRemoveProduct,
  UpdateQuantity,
  ClearShoppingList,

}) => {

  //Show only products from a certain store
  const filteredProducts = selectedProducts.filter((product) => {
    const storeCondition = activeStores ? product.store === activeStores : true;

    return storeCondition;
  });

  const handleSaveShoppingList = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to save your shopping list.');
      return;
    }
    try {
      const userId = JSON.parse(atob(token.split('.')[1])).id; // Decode the JWT to get the user's ID
      await axios.post('http://localhost:5000/api/shoppingList/saveShoppingList', {
        userId,
        shoppingList: selectedProducts.map((product) => ({ productId: product._id, quantity: product.quantity }))
        // Here we ensure we send the _id as productId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Shopping list saved successfully.');
    } catch (error) {
      console.error('Error saving shopping list:', error);
      alert('Failed to save shopping list.');
    }
  };

  const handleQuantityChange = (product, newQuantity) => {
    UpdateQuantity(product, parseInt(newQuantity, 10));
  };

  const handleClearShoppingList = () => {
    ClearShoppingList();
  };

  // Calculate the total cost of all items in the shopping list
  const total = selectedProducts.reduce((acc, product) =>
    acc + (parseFloat(product.price) * (product.quantity || 1)), 0);

  // Calculate the subtotal cost of items in the shopping list from a certain shop
  const subtotal = filteredProducts.reduce((acc, product) =>
    acc + (parseFloat(product.price) * (product.quantity || 1)), 0);

  const totalQuantity = selectedProducts.reduce((acc, product) =>
    acc + product.quantity, 0);
  
  const uniqueQuantity = selectedProducts.length;

  const totalQuantityFromStore = filteredProducts.reduce((acc, product) =>
    acc + product.quantity, 0);
  
  const uniqueQuantityFromStore = filteredProducts.length;

  const handleDownloadList = () => {
    const listContent = selectedProducts.map(product =>
      `Product: ${product.name}\nPrice: ${product.monetary_value}\nStore: ${product.store}\nQuantity: ${product.quantity}\n\n`
    ).join('');

    const blob = new Blob([listContent], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'shopping-list.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="shopping-list">
        <h2>Your Shopping List</h2>
        <div className="products-grid">
          {filteredProducts.map((product, index) => (
            <div key={index} className="product-card">
              <div className="product-image-container">
                <img src={product.image_url} alt={product.name} className="product-image" />
                {/* Conditionally display the promotion tag */}
                {product.promotion && (
                  <span className="product-promotion">{product.promotion}</span>
                )}
              </div>
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-store">Available at: {product.store}</p>
                <p className="product-price">Price: {product.monetary_value}</p>
                <div className="product-quantity">
                  <label htmlFor={`quantity-${product._id}`}>Quantity:</label>
                  <input
                    id={`quantity-${product._id}`}
                    type="number"
                    value={product.quantity || 1}
                    onChange={(e) => handleQuantityChange(product, e.target.value)}
                    min="1"
                    className="quantity-input"
                  />
                </div>
                <button onClick={() => onRemoveProduct(product)} className="remove-button">
                  Remove
                </button>
              </div>
            </div>
          ))}

        </div>
        <div className='bottom-bar'>
          <div className="button-container">
            <button onClick={handleClearShoppingList} className="list-button remove-all">
              Remove All
            </button>
            <button onClick={handleDownloadList} className="list-button download-list">
              Download List
            </button>
            <button onClick={handleSaveShoppingList} className="list-button save-list">
              Save List
            </button>
          </div>
          <div className='shoppinglist-totals'>
            <span className='total-quantity'>Quantity: {activeStores ? totalQuantityFromStore : totalQuantity}
              <div>Unique Products: {activeStores ? uniqueQuantityFromStore : uniqueQuantity}</div>
            </span>
            <span className='total-amount'>Total: €{total.toFixed(2)} {activeStores && <div>(€{subtotal.toFixed(2)} from {activeStores})</div>}</span>
          </div>
        </div>
      </div>
    </>

  );
};

export default ShoppingList;
