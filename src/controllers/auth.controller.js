import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not set in environment');
    }
    return secret;
}


export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log("req.body:", req.body);
        if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });


        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already in use' });


        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash });


        const token = jwt.sign({ id: user._id }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
        res.status(201).json({ user: { id: user._id, name: user.name, email: user.email }, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Missing fields' });


        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
        res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};