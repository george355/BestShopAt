// server.js
const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./Routes/ProductRoutes.js');
const authRoutes = require('./Routes/authRoutes');
const shoppinglistRoutes = require('./Routes/shoppingListRoutes.js');

const connectDB = require('./Database.js'); // Import the connectDB function
const cors = require('cors');

require('dotenv').config();

const app = express();

connectDB();

// Use CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:5001'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'), false);
    }
  }
}));

// Parse JSON bodies for this app. Make sure this comes before your routes.
app.use(express.json());


app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/shoppingList', shoppinglistRoutes);

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});