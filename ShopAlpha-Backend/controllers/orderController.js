const db = require('../config/db');

// Create Order
exports.createOrder = async (req, res) => {
    try {
        const { user_id, total_price, items } = req.body;

        if (!user_id || !total_price || !items || items.length === 0) {
            return res.status(400).json({ message: 'Invalid order payload.' });
        }

        // 1. Insert Order
        const [orderResult] = await db.execute(
            'INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)',
            [user_id, total_price, 'Pending']
        );

        const orderId = orderResult.insertId;

        // 2. Insert Order Items
        for (const item of items) {
            await db.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        return res.status(201).json({ message: 'Order placed successfully!', orderId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error placing order.', error: error.message });
    }
};

// Get User Orders
exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const [orders] = await db.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);

        return res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching orders.', error: error.message });
    }
};