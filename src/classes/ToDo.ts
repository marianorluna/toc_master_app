import { v4 as uuidv4 } from "uuid";
import { ProjectsManager as PM } from "./ProjectsManager";

export type ToDoStates = "Active" | "Pending" | "Finished" | "Discarded";

export interface IToDo {
    // Properties
    content: string;
    todoDate: Date;
    state: ToDoStates;
}

export class ToDo implements IToDo {
    // To satisfy IToDo
    content: string;
    todoDate: Date;
    state: ToDoStates;
    // class internals
    ui: HTMLDivElement;
    id: string;
    listStates: Object[] = [];
    color: string;
    icon: string;

    constructor(data: IToDo) {
        this.content = data.content;
        this.todoDate = data.todoDate;
        this.state = data.state;
        this.listStates = this.setListStates()
        this.icon = this.setIconTodo(this.state)
        this.color = this.setColorTodo(this.state)
        this.id = uuidv4();
        this.setUI();
    }

    // Creates the ToDo card UI
    setUI() {
        if (this.ui && this.ui instanceof HTMLElement) {
            return;
        }
        this.ui = document.createElement("div");
        this.ui.id = this.id;
        this.ui.className = "todo-class"
        this.ui.style.display = "flex";
        this.ui.style.flexDirection = "column";
        this.ui.style.padding = "10px 30px";
        this.ui.style.rowGap = "20px";
        this.ui.innerHTML = 
        `
        <div class="todo-item" style="background-color: ${this.color};">
            <div class="todo-item-1" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="todo-item-2" style="display: flex; column-gap: 15px; align-items: center;">
                    ${this.icon}
                    <p class="todo-item-3" data-project-info="todoContent">${this.content}</p>
                </div>
                <p class="todo-item-2" data-project-info="todoDate" style="text-wrap: nowrap; margin-left: 10px;">${this.todoDate instanceof Date ? this.todoDate.toLocaleDateString() : new Date(this.todoDate).toLocaleDateString()}</p>
                <div class="todo-item-2" data-project-info="todoState" style="display: none">${this.state}</div>
            </div>
        </div>
        `
    }

    // Create states list
    setListStates() {
        let listStates: Object[] = [];
        // Active
        listStates[0] = {'Active': '<span class="material-icons-outlined">arrow_circle_right</span>', 'color': '#ca8a3c'};
        // Pending
        listStates[1] = {'Pending': '<span class="material-icons-outlined">pending</span>', 'color': '#c4bd41'}
        // Finished
        listStates[2] = {'Finished': '<span class="material-icons-outlined">task_alt</span>', 'color': '#578c4b'}
        // Discarded
        listStates[3] = {'Discarded': '<span class="material-icons-outlined">highlight_off</span>', 'color': '#6278b9'}
        return listStates;
    }

    // Set ToDo state
    setIconTodo(state: string): string {
        if (state == 'Active') {
            return this.listStates[0][state]
        }
        else if (state == 'Pending') {
            return this.listStates[1][state]
        }
        else if (state == 'Finished') {
            return this.listStates[2][state]
        }
        else if (state == 'Discarded') {
            return this.listStates[3][state]
        } else {
            return "ICO-NO"
        }
    }

    // Set ToDo color
    setColorTodo(state: string): string {
        if (state == "Active") {
            return this.listStates[0]['color']
        }
        else if (state == "Pending") {
            return this.listStates[1]['color']
        }
        else if (state == "Finished") {
            return this.listStates[2]['color']
        }
        else if (state == "Discarded") {
            return this.listStates[3]['color']
        } else {
            return "blue"
        }
    }
}