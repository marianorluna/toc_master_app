import { v4 as uuidv4 } from "uuid";

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
        this.ui.innerHTML = `
        <div class="todo-item" style="background-color: ${this.color};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; column-gap: 15px; align-items: center;">
                    ${this.icon}
                    <p data-project-info="todoContent">${this.content}</p>
                </div>
                <p data-project-info="todoDate" style="text-wrap: nowrap; margin-left: 10px;">${this.todoDate.toLocaleDateString()}</p>
                <div data-project-info="todoState" style="display: none">${this.state}</div>
            </div>
        </div>
        `;
    }

    // Create states list
    setListStates() {
        let listStates: Object[] = [];
        // Active
        listStates[0] = {'Active': '<span class="material-icons-outlined">arrow_circle_right</span>', 'color': 'green'};
        // Pending
        listStates[1] = {'Pending': '<span class="material-icons-outlined">pending</span>', 'color': 'yellow'}
        // Finished
        listStates[2] = {'Finished': '<span class="material-icons-outlined">task_alt</span>', 'color': 'red'}
        // Discarded
        listStates[3] = {'Discarded': '<span class="material-icons-outlined">highlight_off</span>', 'color': 'gray'}
        return listStates;
    }

    // // Create states list
    // setListStates() {
    //     let listStates: Array<string>[] = [];
    //     // Active
    //     listStates[0] = ['Active', '<span class="material-icons-outlined">arrow_circle_right</span>', 'green'];
    //     // Pending
    //     listStates[1] = ['Pending', '<span class="material-icons-outlined">pending</span>', 'yellow']
    //     // Finished
    //     listStates[2] = ['Finished', '<span class="material-icons-outlined">task_alt</span>', 'red']
    //     // Discarded
    //     listStates[3] = ['Discarded', '<span class="material-icons-outlined">highlight_off</span>', 'gray']
    //     return listStates;
    // }

    // Set ToDo state
    setIconTodo(state: ToDoStates) {
        const icon: string = state
        if (icon == 'Active') {
            return this.listStates[0][state]
        }
        else if (icon == 'Pending') {
            return this.listStates[1][state]
        }
        else if (icon == 'Finished') {
            return this.listStates[2][state]
        }
        else if (icon == 'Discarded') {
            return this.listStates[3][state]
        } else {
            return "ICO-NO"
        }
    }

    // // Set ToDo state
    // setIconTodo(state: ToDoStates) {
    //     const icon: string = state
    //     if (icon == this.listStates[0][0]) {
    //         return this.listStates[0][1]
    //     }
    //     else if (icon == this.listStates[1][0]) {
    //         return this.listStates[1][1]
    //     }
    //     else if (icon == this.listStates[2][0]) {
    //         return this.listStates[2][1]
    //     }
    //     else if (icon == this.listStates[3][0]) {
    //         return this.listStates[3][1]
    //     } else {
    //         return "ICO-NO"
    //     }
    // }

    // Set ToDo color
    setColorTodo(state: ToDoStates) {
        const color: string = state
        if (color == "Active") {
            return this.listStates[0]['color']
        }
        else if (color == "Pending") {
            return this.listStates[1]['color']
        }
        else if (color == "Finished") {
            return this.listStates[2]['color']
        }
        else if (color == "Discarded") {
            return this.listStates[3]['color']
        } else {
            return "blue"
        }
    }

    // // Set ToDo color
    // setColorTodo(state: ToDoStates) {
    //     const color: string = state
    //     if (color == "Active") {
    //         return this.listStates[0][2]
    //     }
    //     else if (color == "Pending") {
    //         return this.listStates[1][2]
    //     }
    //     else if (color == "Finished") {
    //         return this.listStates[2][2]
    //     }
    //     else if (color == "Discarded") {
    //         return this.listStates[3][2]
    //     } else {
    //         return "blue"
    //     }
    // }
}
