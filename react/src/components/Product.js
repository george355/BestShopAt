import React from 'react';
import '../css/Product.css';

const Product = ({ product, onToggleProductInList, isProductSelected }) => {
  if (!product || typeof product !== 'object') {
    return null;
  }

  const { name, monetary_value, image_url, product_link, store, promotion } = product;

  const isSelected = isProductSelected(product);

  const handleToggleSelect = () => {
    if (!isSelected) {
      onToggleProductInList({ ...product, quantity: 1 });
    } else {
      onToggleProductInList(product);
    }
  };

  return (
    <div className={`product ${isSelected ? 'selected' : ''}`}>
      <div className="product-image-container">
        <img className="product-image" src={image_url} alt={name} />
        {promotion && <span className="product-promotion">{promotion}</span>}
      </div>
      <div className="product-info">
        <a href={product_link} target="_blank" rel="noopener noreferrer">
          <h2 className="product-name" data-name={name} title={name}>{name}</h2>
        </a>
        {store && <div className="product-store">Available at: {store}</div>}
        <div className="product-price">{monetary_value}</div>
        <button className="select-button" onClick={handleToggleSelect}>
          {isSelected ? 'Remove from List' : 'Add to List'}
        </button>
      </div>
    </div>
  );
};

export default Product;
