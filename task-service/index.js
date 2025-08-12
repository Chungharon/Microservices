const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3002;

app.use(bodyParser.json());

// Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/users', {})
//     .then(() => console.log("Connected to MongoDB"))
//     .catch(error => console.error("MongoDB connection error: ", error));


mongoose.connect('mongodb://mongo:27017/tasks', {})
    .then(() => console.log("Connected to MongoDB"))
    .catch(error => console.error("MongoDB connection error: ", error));

// Task schema
const TaskSchema = new mongoose.Schema({
    name: String,
    email: String
});
const Task = mongoose.model('Task', TaskSchema);

// Create Task
app.post('/tasks', async (req, res) => {
    const { title, description, userId } = req.body;
    try {
        const task = new Task({ title, description, userId });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error("Error saving: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get all tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching users: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Task Service is listening on port ${port}`);
});
