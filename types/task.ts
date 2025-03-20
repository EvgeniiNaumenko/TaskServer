export type Task = {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    lastModifiedAt?: string | null;
    status: TaskStatus;
    finalizedAt?: string | null;
    isArchived: boolean;
    tags: string[];
    // options?: TaskAppearanceOptions;
};

export enum TaskStatus {
    InProgress = "В процессе",
    Completed = "Выполнено",
    Deleted = "Удалено",
}
