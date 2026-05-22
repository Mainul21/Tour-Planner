const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); //allows frontend requests from different origin
app.use(express.json()); //parses incoming JSON requests and puts the parsed data in req.body

//Import models
const User = require('./models/User');
const Trip = require('./models/Trip');
const Activity = require('./models/Activity');
const ActivityChangeRequest = require('./models/ActivityChangeRequest');

//mongodb connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));


// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});