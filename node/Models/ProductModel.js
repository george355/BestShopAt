const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true
  },
  monetary_value: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  sale_price: String,
  original_price: String,
  promotion: String,
  sale_information: [String],
  image_url: {
    type: String,
    required: [true, 'Product image URL is required'],
    validate: {
      validator: function(v) {
        return v != null && v.trim() !== '';
      },
      message: 'Product image URL cannot be null or empty'
    }
  },
  store: String,
  unit_price: String
});

const Product = mongoose.model('Product', productSchema, 'FirstCollection');

module.exports = Product;

