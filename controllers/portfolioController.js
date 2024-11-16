const PortfolioItem = require('../models/portfolioItem');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');

// Create Portfolio Item 
exports.createPortfolioItem = async (req, res) => {
  const { title, description } = req.body;
  const images = req.files.map(file => path.join('uploads', file.filename)); // Save image paths

  try {
      const newItem = new PortfolioItem({
          title,
          description,
          images,
          userId: req.session.user.userId // Assign the userId from session
      });

      await newItem.save();
      res.status(201).json({ message: 'Portfolio item created successfully', item: newItem });
  } catch (error) {
      console.error('Error creating portfolio item:', error);
      res.status(500).json({ error: 'Failed to create portfolio item' });
  }
};

// Get all Portfolio Items
exports.getPortfolioItems = async (req, res) => {
  try {
    // Fetch all portfolio items from the database
    const items = await PortfolioItem.find();

    // Fetch user details for each portfolio item by userId
    const itemsWithUser = await Promise.all(items.map(async (item) => {
      const user = await User.findById(item.userId); // Use findById to get user by userId

      return {
        ...item.toObject(),
        author: {
          firstName: user ? user.firstName : 'Anonymous',
          lastName: user ? user.lastName : 'Anonymous'
        }
      };
      
    }));

    // Send the modified portfolio items with user information
    res.json(itemsWithUser);
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio items' });
  }
};


// Get portfolio by id
exports.getByIdPortfolioItem = async (req, res) => {
  try {
    const itemId = req.params.id; 
    const item = await PortfolioItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio item' });
  }
};

exports.updatePortfolioItem = async (req, res) => {
  const { title, description, deletedImages } = req.body;
  try {
    // Retrieve the current images from the database (if available)
    const portfolioItem = await PortfolioItem.findById(req.params.id);
    const currentImages = portfolioItem ? portfolioItem.images : [];

    // Initialize new images from uploaded files, if available
    const newImages = req.files ? req.files.map(file => path.join('uploads', file.filename)) : [];

    // Combine the current images with the newly uploaded images
    const allImages = [...currentImages, ...newImages];

    // Initialize images if not passed in the request
    const deletedImagesArray = Array.isArray(deletedImages) ? deletedImages : [deletedImages];
    // Handle image deletions if deletedImages exists and is not empty
    if (deletedImagesArray && deletedImagesArray.length > 0) {
      deletedImagesArray.forEach((imagePath) => {
        if (imagePath && imagePath !== 'null' && imagePath !== 'undefined') { 
          const imageFilePath = path.join(__dirname, '..', imagePath);  
          fs.unlink(imageFilePath, (err) => {
            if (err) {
              console.error('Error deleting image:', err);
            } else {
              console.log('Deleted image:', imagePath);
            }
          });
          // Remove the deleted image from the allImages array
          const imageIndex = allImages.indexOf(imagePath);
          if (imageIndex > -1) {
            allImages.splice(imageIndex, 1); 
          }
        } else {
          console.log('Invalid image path:', imagePath);
        }
      });
    }

    // Update the portfolio item with the new data
    const updatedItem = await PortfolioItem.findByIdAndUpdate(
      req.params.id,
      { title, description, images: allImages, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Portfolio item updated successfully', item: updatedItem });
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    res.status(500).json({ error: 'Failed to update portfolio item' });
  }
};


// Delete Portfolio Item (Admin only)
exports.deletePortfolioItem = async (req, res) => {
  try {
    // Fetch the portfolio item to get associated images
    const deletedItem = await PortfolioItem.findById(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete images from the 'uploads' folder
    deletedItem.images.forEach((imagePath) => {
      const imageFilePath = path.join(__dirname, '..', imagePath);
      fs.unlink(imageFilePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        } else {
          console.log('Deleted image:', imagePath);
        }
      });
    });

    // Now delete the portfolio item from the database
    await PortfolioItem.findByIdAndDelete(req.params.id);

    // Respond with a success message
    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({ error: 'Failed to delete portfolio item' });
  }
};
