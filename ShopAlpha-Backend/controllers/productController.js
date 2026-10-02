const db = require('../config/db');

// 1. Get All Products
exports.getAllProducts = async (req, res) => {
    try {
        const [products] = await db.execute('SELECT * FROM products ORDER BY id DESC');
        return res.status(200).json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching products.', error: error.message });
    }
};

// 2. Get Single Product
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);

        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        return res.status(200).json(products[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching product.', error: error.message });
    }
};

// 3. Add New Product (Admin / Seed)
exports.createProduct = async (req, res) => {
    try {
        const { title, description, price, image_url, stock_quantity } = req.body;

        if (!title || !price) {
            return res.status(400).json({ message: 'Title and Price are required.' });
        }

        const [result] = await db.execute(
            'INSERT INTO products (title, description, price, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?)',
            [title, description || '', price, image_url || '', stock_quantity || 0]
        );

        return res.status(201).json({ message: 'Product created successfully!', productId: result.insertId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating product.', error: error.message });
    }
};