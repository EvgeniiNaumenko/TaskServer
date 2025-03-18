const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); 

let tasks = [
];

app.get("/tasks", (req, res) => {
    const activeTasks = tasks.filter(task => !task.isArchived);
    res.json(activeTasks);
});

app.get("/tasks/archive", (req, res) => {
    const archivedTasks = tasks.filter(task => task.isArchived);
    res.json(archivedTasks);
});

app.post("/tasks", (req, res) => {
    const { title, description, tags } = req.body;
    
    const newTask = {
        id: (tasks.length + 1).toString(),
        title,
        description,
        createdAt: new Date(),
        status: "Active",
        isArchived: false,
        tags: tags || [],
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
});

app.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, isArchived } = req.body;

    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
        return res.status(404).json({ error: "Задача не найдена" });
    }

    tasks[taskIndex] = {
        ...tasks[taskIndex],
        title: title || tasks[taskIndex].title,
        description: description || tasks[taskIndex].description,
        isArchived: isArchived !== undefined ? isArchived : tasks[taskIndex].isArchived,
    };

    res.json(tasks[taskIndex]);
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
