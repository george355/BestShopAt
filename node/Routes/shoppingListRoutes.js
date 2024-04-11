const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middleware/authMiddleware');
const User = require('../Models/UserModel');


router.post('/saveShoppingList', authMiddleware, async (req, res) => {
    console.log('Attempting to save shopping list');

    try {
      const { userId, shoppingList } = req.body;
      const user = await User.findByIdAndUpdate(
        userId,
        { shoppingList },
        { new: true }
      );
      res.status(200).json(user.shoppingList);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

router.get('/getShoppingList', authMiddleware, async (req, res) => {
    console.log('[Backend] Attempting to get shopping list for user ID:', req.query.userId);

    try {
      const { userId } = req.query;
      console.log('[Backend] Fetching user with ID:', userId);

      const user = await User.findById(userId).populate('shoppingList.productId');
      console.log('[Backend] Populated shopping list:', user.shoppingList);

      const populatedShoppingList = user.shoppingList.map(item => ({
        ...item.productId._doc,
        quantity: item.quantity // Include the quantity in the resulting object
      }));
      res.status(200).json(populatedShoppingList);
    } catch (error) {
        console.error('[Backend] Error fetching shopping list:', error);

      res.status(500).json({ message: 'Server error', error });
    }
  });
  

module.exports = router;