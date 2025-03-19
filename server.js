const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); 

let tasks = [];

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
      id: String(tasks.length + 1),
      title,
      description,
      createdAt: new Date(),
      lastModifiedAt: null,
      status: "В процессе",
      isArchived: false,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
    };
  
    tasks.push(newTask);
    res.status(201).json(newTask);
  });


 app.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, status, isArchived, tags } = req.body;
  
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Задача не найдена" });
    }
  
    let task = tasks[taskIndex];
  
    const hasTitleChanged = title && title !== task.title;
    const hasDescriptionChanged = description && description !== task.description;
    const hasTagsChanged = tags && tags.split(",").map(tag => tag.trim()).join(",") !== task.tags.join(",");
    
    const updatedTask = {
      ...task,
      title: title || task.title,
      description: description || task.description,
      isArchived: isArchived !== undefined ? isArchived : task.isArchived,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : task.tags,
    };
  
    if (hasTitleChanged || hasDescriptionChanged || hasTagsChanged) {
      updatedTask.lastModifiedAt = new Date();
    }
  

    if (status && status !== task.status) {
      updatedTask.status = status;
      if (status === "Выполнено" || status === "Удалено") {
        updatedTask.finalizedAt = new Date();
      } else if (status === "В процессе") {
        updatedTask.finalizedAt = null;
      }
    }
  
    tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
  });


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});


