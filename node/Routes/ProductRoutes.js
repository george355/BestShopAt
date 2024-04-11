const express = require('express');
const router = express.Router();
const Product = require('../Models/ProductModel.js');

// GET all products with optional filtering and search
router.get('/', async (req, res) => {
  console.log('[Backend] Attempting to get products with filters:', req.query);

  const { store, promotion, category, search, page = 1, limit = 10, sort } = req.query; // Default page=1, limit=10


  let query = {};

  if (store) {
    query.store = store;
  }

  if (promotion) {
    query.store = promotion; // Set the store to the promotion filter
    query.promotion = { $ne: null }; // Check that the promotion is not null
  }

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  let sortCriteria = {};

  if (sort === 'name_asc') {
    sortCriteria.name = 1;
  } else if (sort === 'name_desc') {
    sortCriteria.name = -1;
  } else if (sort === 'price_asc') {
    sortCriteria.price = 1;
  } else if (sort === 'price_desc') {
    sortCriteria.price = -1;
  }

  try {
    const products = await Product.find(query).sort(sortCriteria).limit(limit * 1).skip((page - 1) * limit);
    const count = await Product.countDocuments(query);
    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;