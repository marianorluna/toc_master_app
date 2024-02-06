import { v4 as uuidv4 } from 'uuid'
import { ProjectsManager as PM } from './ProjectsManager'

export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"

export interface IProject {
    // Properties
    name: string
    description: string
    status: ProjectStatus
    userRole: UserRole
    finishDate: Date
}

export class Project implements IProject {
    // To satisfy IProjects
    name: string
    description: string
    status: ProjectStatus
    userRole: UserRole
    finishDate: Date

    // Class internals
    ui: HTMLDivElement
    cost: number = 100000
    progress: number = 0.6
    id: string

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
        this.setUI()
    }

    // creates the project card UI
    setUI() {
        const color = PM.iconExportColor
        if (this.ui && this.ui instanceof HTMLElement) {return}
        this.ui = document.createElement("div")
        this.ui.className = "project-card"
        this.ui.innerHTML = `
        <div class="card-header">
            <p style="background-color: ${(Object.keys(color)).includes(this.id) ? color[this.id] : "#CC8C52"}; padding: 10px; border-radius: 8px; aspect-ratio: 1;">${this.name == "" ? "ID" : this.name.toUpperCase().substring(0,2)}</p>
            <div>
                <h5>${this.name}</h5>
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
        console.log(Object.keys(PM.iconExportColor))
    }
}