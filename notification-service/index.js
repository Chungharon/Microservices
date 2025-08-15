const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const amqp = require('amqplib')


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

let channel, connection;

async function connectiRabbitMQWithRetry(retries = 5, delay = 3000) {
    while (retires) {
        try {
            connection = await amqp.connect("amqp://rabbitmq_node")
            channel = await connection.createChannel
            await channel.assertQueue("task_created");
            console.log("Connected to RabbitMQ")
            return

        } catch (error) {
           console.error("RabbitMQ Connection Error : " , error.message);
           retries--;
            console.error("Retrying again: " , retries);
            await new Promise(res => setTimeout(res, delay)); 
        }
    }
}

// Create Task
app.post('/tasks', async (req, res) => {
    const { title, description, userId } = req.body;
    try {
        const task = new Task({ title, description, userId });
        await task.save();


        const message = {
            taskId: task._id, userId, title
        }

        if (!channel) {
           return res.status(503).json({error: "RabbitMQ not connected"}) 
        }

        channel.sendToQueue("task_created", Buffer.from(
            JSON.stringify(message)
        ));

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
    connectiRabbitMQWithRetry();
});
