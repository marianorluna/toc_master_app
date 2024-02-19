import { v4 as uuidv4 } from 'uuid'

export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"

export interface IProject {
    // Properties
    name: string
    description: string
    status: ProjectStatus
    userRole: UserRole
    startDate: Date
    finishDate: Date
}

export class Project implements IProject {
    // To satisfy IProjects
    name: string
    description: string
    status: ProjectStatus
    userRole: UserRole
    startDate: Date
    finishDate: Date

    // Class internals
    ui: HTMLDivElement
    cost: number = 100000
    progress: number = 0.6
    id: string
    listIdColor: Object = {}
    color: string

    constructor(data: IProject){
        // Project data definition
        for (const key in data) {
            this[key] = data[key]
        }
        // Loop replace:
        // this.name = data.name
        // this.description = data.description
        // this.status = data.status
        // this.userRole = data.userRole
        // this.finishDate = data.finishDate
        this.id = uuidv4()
        this.color = this.getColor(this.id)
        this.setUI()
    }

    // creates the project card UI
    setUI() {
        this.dateValidation()
        if (this.ui && this.ui instanceof HTMLElement) {return}
        this.ui = document.createElement("div")
        this.ui.className = "project-card"
        this.ui.id = this.id
        this.ui.innerHTML = `
        <div class="card-header">
            <p style="background-color: ${this.color}; padding: 10px; border-radius: 8px; aspect-ratio: 1;">${this.name == "" ? "ID" : this.name.toUpperCase().substring(0,2)}</p>
            <div>
                <h5>${this.nameValidation(this.name)}</h5>
                <p>${this.description}</p>
            </div>
        </div>
        <div class="card-content">
            <div class="card-property">
                <p style="color: #969696;">Status</p>
                <p>${this.status}</p>
            </div>
            <div class="card-property">
                <p style="color: #969696;">Role</p>
                <p>${this.userRole}</p>
            </div>
            <div class="card-property">
                <p style="color: #969696;">Cost</p>
                <p>$${this.cost}</p>
            </div>
            <div class="card-property">
                <p style="color: #969696;">Estimated Progress</p>
                <p>${this.progress * 100}%</p>
            </div>
        </div>
        `
    }

    colorIcon(id: string) {
        const COLORS = ["#CC6252", "#CC8C52", "#CCB652", "#B8CC52", "#79CC52", "#52CC54"]
        const colorRandom = COLORS[Math.floor(Math.random() * COLORS.length)]
        if (Object.keys(this.listIdColor).length == 0) {
            this.listIdColor[id] = colorRandom;
        }
        return this.listIdColor
    }

    getColor(id: string) {
        this.colorIcon(id)
        let color = ""
        const select = Object.keys(this.listIdColor)
        if (select.includes(id)) {
            color = this.listIdColor[id]
        }
        return color
    }

    nameValidation(name: string) {
        if (name.length < 5) {
            throw new Error(`The project with the name ${this.name} is too short. The name must be more of 5 characters.`)
        } else {
            return name
        }
    }

    dateValidation() {
        const start = this.startDate.toLocaleDateString()
        const finish = this.finishDate.toLocaleDateString()
        const time = Date.now()
        const dateNow = new Date(time)
        if (start == "Invalid Date") { 
            if (finish == "Invalid Date") {
                return
            }
            else {
                throw new Error(`Finish date cannot to be bigger than start date.`)
            } 
        }
        else if (start !== "Invalid Date" && this.startDate.getTime() > this.finishDate.getTime()) {
            throw new Error(`Finish date cannot to be bigger than start date.`)
        }
        else { 
            return 
        }
    }
}