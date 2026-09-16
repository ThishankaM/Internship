export interface Todo {
    id : string;
    title : string;
    description : string;
    completed : boolean;
    createdAt : Date;
}

export interface TodoFormData {
    title : string;
    description?: string;
}
