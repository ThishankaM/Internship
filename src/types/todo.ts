export type TodoStatus = "todo" | "in-progress" | "done";

export interface Todo {
    id : string;
    title : string;
    description : string;
    status : TodoStatus;
    completed : boolean;
    createdAt : Date | string;
}

export interface TodoFormData {
    title : string;
    description?: string;
}
