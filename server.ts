import express from "express";
import cors from "cors";
import { Task, TaskStatus } from "./types/task";
import {formatDate} from "./utils/date";

const app = express();
app.use(cors());
app.use(express.json());

const tasks: Task[] = [
    {
        id: "1",
        title: "Подготовиться к встрече с командой",
        description: "Составить список вопросов, подготовить презентацию по прогрессу проекта.",
        createdAt: new Date("2025-03-10T09:00:00Z").toISOString(),
        lastModifiedAt: new Date("2025-03-12T14:30:00Z").toISOString(),
        status: TaskStatus.InProgress,
        isArchived: false,
        tags: ["работа", "встреча", "подготовка"],
    },
    {
        id: "2",
        title: "Купить продукты",
        description: "Молоко, хлеб, яйца, овощи для ужина.",
        createdAt: new Date("2025-03-11T10:00:00Z").toISOString(),
        lastModifiedAt: new Date("2025-03-13T18:00:00Z").toISOString(),
        status: TaskStatus.InProgress,
        isArchived: false,
        tags: ["покупки", "дом"],
    },
    {
        id: "3",
        title: "Прочитать книгу по TypeScript",
        description: "Пройти главы 1-3, сделать заметки по типизации.",
        createdAt: new Date("2025-03-05T12:00:00Z").toISOString(),
        status: TaskStatus.Completed,
        isArchived: true,
        tags: ["обучение", "программирование"],
    },
    {
        id: "4",
        title: "Сходить на тренировку",
        description: "Силовая тренировка в зале: 1 час, акцент на ноги.",
        createdAt: new Date("2025-03-15T07:00:00Z").toISOString(),
        status: TaskStatus.InProgress,
        isArchived: false,
        tags: ["спорт", "здоровье"],
    },
    {
        id: "5",
        title: "Позвонить клиенту",
        description: "Обсудить детали проекта, уточнить сроки.",
        createdAt: new Date("2025-03-12T15:00:00Z").toISOString(),
        status: TaskStatus.Deleted,
        isArchived: true,
        tags: ["работа", "звонок"],
    },
];

const formatTaskDates = (task: Task): Task => ({
    ...task,
    createdAt: formatDate(task.createdAt),
    lastModifiedAt: task.lastModifiedAt ? formatDate(task.lastModifiedAt) : null,
    finalizedAt: task.finalizedAt ? formatDate(task.finalizedAt) : null,
});

app.get("/api/tasks", (req, res) => {
    const activeTasks: Task[] = tasks
        .filter((task) => !task.isArchived)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(formatTaskDates);
    res.json(activeTasks);
});

app.get("/api/tasks/archive", (req, res) => {
    const archivedTasks: Task[] = tasks
        .filter((task) => task.isArchived)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(formatTaskDates);
    res.json(archivedTasks);
});

app.post("/api/tasks", (req, res) => {
    const { title, description, tags } = req.body;

    const newTask: Task = {
        id: String(tasks.length + 1),
        title,
        description,
        createdAt: new Date().toISOString(),
        lastModifiedAt: null,
        status: TaskStatus.InProgress,
        isArchived: false,
        tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
    };

    tasks.push(newTask);
    res.status(201).json(formatTaskDates(newTask));
});

app.put("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, status, isArchived, tags } = req.body;

    const taskIndex: number = tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
        return res.status(404).json({ error: "Задача не найдена" });
    }

    let task: Task = tasks[taskIndex];

    const hasTitleChanged: boolean = title && title !== task.title;
    const hasDescriptionChanged: boolean = description && description !== task.description;
    const hasTagsChanged: boolean =
        tags && tags.split(",").map((tag: string) => tag.trim()).join(",") !== task.tags.join(",");

    const updatedTask: Task = {
        ...task,
        title: title || task.title,
        description: description || task.description,
        isArchived: isArchived !== undefined ? isArchived : task.isArchived,
        tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : task.tags,
    };

    if (hasTitleChanged || hasDescriptionChanged || hasTagsChanged) {
        updatedTask.lastModifiedAt = new Date().toISOString();
    }

    if (status && status !== task.status) {
        updatedTask.status = status;
        if (status === TaskStatus.Completed || status === TaskStatus.Deleted) {
            updatedTask.finalizedAt = new Date().toISOString();
        } else if (status === TaskStatus.InProgress) {
            updatedTask.finalizedAt = null;
        }
    }

    tasks[taskIndex] = updatedTask;
    res.json(formatTaskDates(updatedTask));
});

const PORT: number = 4000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
