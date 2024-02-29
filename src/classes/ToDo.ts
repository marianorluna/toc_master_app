import { v4 as uuidv4 } from 'uuid'

export interface IToDo {
    // Properties
    content: string
    todoDate: Date
}

export class ToDo implements IToDo {
    // To satisfy IToDo
    content: string
    todoDate: Date
    // class internals
    ui: HTMLDivElement
    id: string

    constructor (data: IToDo) {
        this.content = data.content
        this.todoDate = data.todoDate
        this.id = uuidv4()
        this.setUI()
    }

    // Creates the ToDo card UI
    setUI() {
        if (this.ui && this.ui instanceof HTMLElement) {return}
        this.ui = document.createElement("div")
        this.ui.id = this.id
        this.ui.style.display = "flex"
        this.ui.style.flexDirection = "column"
        this.ui.style.padding = "10px 30px"
        this.ui.style.rowGap = "20px"
        this.ui.innerHTML = `
        <div class="todo-item">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; column-gap: 15px; align-items: center;">
                <span class="material-icons-round" style="padding: 10px; background-color: #686868; border-radius: 10px;">construction</span>
                <p>${this.content}</p>
                </div>
                <p style="text-wrap: nowrap; margin-left: 10px;">${this.todoDate.toLocaleDateString()}</p>
            </div>
        </div>
        `
    }
}