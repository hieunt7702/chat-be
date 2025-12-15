import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import http from 'http';
import connectDB from './config/db.js';
import { initializeSocket } from './socket.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import messageRoutes from './routes/message.routes.js';


const app = express();
const httpServer = http.createServer(app);


// Middlewares
app.use(cors({
    origin: '*', // Allow all origins; change to specific domain in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));


// Connect DB
connectDB();

console.log("Database connected");

// Initialize Socket.IO
const io = initializeSocket(httpServer);


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/messages', messageRoutes);


app.get('/', (req, res) => res.send('API is running'));


const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));