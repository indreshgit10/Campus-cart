import Product from '../models/Product.js';

// @desc    Fetch all products
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate('user', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  const { name, price, description, image, category, subject, semester, isTopper, isDigital, isFree, fileUrl, demoFileUrl } = req.body;

  try {
    const product = new Product({
      name,
      price,
      user: req.user._id,
      image,
      description,
      category,
      subject,
      semester,
      isTopper,
      isDigital,
      isFree,
      fileUrl,
      demoFileUrl,
    });

    const createdProduct = await product.save();
    const populatedProduct = await Product.findById(createdProduct._id).populate('user', 'name');
    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const { name, price, description, image, category, subject, semester, isTopper, isDigital, isFree, fileUrl, demoFileUrl } = req.body;

    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.description = description ?? product.description;
    product.image = image ?? product.image;
    product.category = category ?? product.category;
    product.subject = subject ?? product.subject;
    product.semester = semester ?? product.semester;
    product.isTopper = isTopper ?? product.isTopper;
    product.isDigital = isDigital ?? product.isDigital;
    product.isFree = isFree ?? product.isFree;
    if (fileUrl !== undefined) product.fileUrl = fileUrl;
    if (demoFileUrl !== undefined) product.demoFileUrl = demoFileUrl;

    const updated = await product.save();
    const populated = await Product.findById(updated._id).populate('user', 'name');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'User not authorized' });
        return;
      }
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user products
// @route   GET /api/products/myproducts
// @access  Private
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
