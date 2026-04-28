const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('dev'));
app.use(cookieParser());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/courses', require('./routes/courses'));
app.use('/api/v1/enrollments', require('./routes/enrollments'));
app.use('/api/v1/quizzes', require('./routes/quizzes'));
app.use('/api/v1/admin', require('./routes/admin'));
app.use('/api/v1/payments', require('./routes/payment'));
app.use('/api/v1/coupons', require('./routes/coupons'));
app.use('/api/v1/notifications', require('./routes/notifications'));
app.use('/api/v1/reviews', require('./routes/reviews'));
app.use('/api/v1/support', require('./routes/support'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1/live-classes', require('./routes/liveClasses'));
app.use('/api/v1/student', require('./routes/student'));
app.use('/api/v1/parent', require('./routes/parent'));
app.use('/api/v1/instructors', require('./routes/instructors'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/communication', require('./routes/communication'));
app.use('/api/v1/performance', require('./routes/performance'));
app.use('/api/v1/instructor-settings', require('./routes/instructorSettings'));
app.use('/api/v1/instructor-applications', require('./routes/instructorApplications'));

app.get('/', (req, res) => {
    res.json({ message: 'LMS API is running' });
});

const errorHandler = require('./middleware/error');
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Socket.io Setup
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join-admin', () => {
        socket.join('admin-room');
        console.log('Admin joined room');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Make io accessible in routes
app.set('io', io);
