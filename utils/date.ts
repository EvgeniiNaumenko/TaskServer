export const formatDate = (date: string): string => {
    return new Date().toISOString().split("T")[0];
};
