import express from 'express';
import cors from 'cors';
import 'dotenv/config'
const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

let tasks = [];

// Middleware for validating task content
function validateTaskContent(req, res, next) {
  const { content } = req.body;

  if (typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'Content must be a non-empty string' });
  }

  next();
}

// Middleware for validating task update input
function validateTaskUpdate(req, res, next) {
  const { content, completed } = req.body;

  if (content && (typeof content !== 'string' || content.trim() === '')) {
    return res.status(400).json({ error: 'Content must be a non-empty string if provided' });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean value if provided' });
  }

  next();
}
// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the "To-Do API!" This is the root route of the backend. Navigate to the API routes to interact with the server.');
});

// Create
app.post('/tasks', validateTaskContent, (req, res) => {
  const { content } = req.body;

  const newTask = {
    id: tasks.length + 1,
    content,
    completed: false,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Read
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// Update
app.put('/tasks/:id', validateTaskUpdate, (req, res) => {
  const { id } = req.params;
  const { content, completed } = req.body;

  const task = tasks.find(t => t.id === parseInt(id));

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (content) task.content = content;
  if (completed !== undefined) task.completed = completed;

  res.json(task);
});

// Delete
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === parseInt(id));

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
