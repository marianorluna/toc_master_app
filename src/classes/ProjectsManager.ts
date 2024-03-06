import { IProject, Project } from "./Project";
import { IToDo, ToDo } from "./ToDo";

export class ProjectsManager {
    list: Project[] = [];
    ui: HTMLElement;
    
    constructor(container: HTMLElement) {
        this.ui = container;
        // Esto lo habilitamos si queremos un ejemplo al iniciar
        this.newProject({
            name: "BIM Proyect",
            description: "This is just a default app project",
            status: "Finished",
            userRole: "Engineer",
            startDate: new Date(),
            finishDate: new Date(new Date().getTime() + 2.628e+9) // 30 days
        });
    }

    newProject(data: IProject) {
        const projectNames = this.list.map((project) => {
            return project.name
        })
        const nameInUse = projectNames.includes(data.name)
        // Create or Import
        if (nameInUse) {
            throw new Error(`A project with the name ${data.name} already exists.`)
        }
        const project = new Project(data);
        // Evento que intercambia entre la página de proyectos y la de detalles
        project.ui.addEventListener("click", () => {
            const projectsPage = document.getElementById("projects-page")
            const detailsPage = document.getElementById("project-details")
            if (!projectsPage || !detailsPage) {return}
            projectsPage.style.display = "none"
            detailsPage.style.display = "flex"
            this.setDetailsPage(project)
            
            // console.log("ESTE ES UN CLIC CUANDO SE ENTRA AL PROYECTO")
            // console.log(project.id)
            // console.log(project.ui.id)
            // console.log(this.editToDo())
            
            // Clean HTML ToDo's and add project's ToDo's
            let todoList = document.getElementById("todo-list") as HTMLDivElement
            todoList.innerHTML = ""
            todoList.appendChild(project.toDoUI)

            // Select and edit ToDo
            this.getToDoSelected()
            // const idtodo = this.getToDoSelected()
            // console.log(idtodo)
        })
        // Agregar evento para mostrar página de proyectos
        const projectsButton = document.getElementById("projects-btn")
        if (projectsButton){
            projectsButton.addEventListener("click", () => {
                const projectsPage = document.getElementById("projects-page")
                const detailsPage = document.getElementById("project-details")
                if (!projectsPage || !detailsPage) {return}
                projectsPage.style.display = "flex"
                detailsPage.style.display = "none"
            })
        }
        this.ui.append(project.ui);
        this.list.push(project);
        
        // console.log(this.ui)
        // console.log(this.ui.children)
        // console.log(this.ui.children[0].id)
        // console.log(this.list)
        // console.log(this.list[0].id)
        // console.log(this.list[0].name)
        // console.log(document.getElementById(this.list[0].id))

        return project;
    }

    private setDetailsPage(project: Project) {
        // Project name
        const detailsPage = document.getElementById("project-details") as HTMLDivElement
        if (!detailsPage) { return console.warn("Page not found") }
        const name = detailsPage.querySelector("[data-project-info='name']")
        if (name) { name.textContent = project.name }
        
        // ID project, create html element 
        const idDiv = document.createElement("div") as HTMLDivElement
        idDiv.id = project.id
        idDiv.hidden = false
        detailsPage.appendChild(idDiv)
        // console.log(idDiv)
        // const lastDiv = detailsPage.lastChild as HTMLDivElement
        // console.log(lastDiv.id)

        // Project icon
        const icono = detailsPage.querySelector("[data-project-info='icono']") as HTMLParagraphElement
        if (icono) {
            icono.style.backgroundColor = project.color
            if (project.name == "") {
                icono.textContent = "ID"
            } else {
                icono.textContent = project.name.toUpperCase().substring(0,2)
            }
        }
        
        // Project info
        const description = detailsPage.querySelector("[data-project-info='description']")
        if (description) { description.textContent = project.description}
        const cardName = detailsPage.querySelector("[data-project-info='cardName']")
        if (cardName) { cardName.textContent = project.name}
        const cardDescription = detailsPage.querySelector("[data-project-info='cardDescription']")
        if (cardDescription) { cardDescription.textContent = project.description}
        const status = detailsPage.querySelector("[data-project-info='status']")
        if (status) { status.textContent = project.status }
        const userRole = detailsPage.querySelector("[data-project-info='userRole']")
        if (userRole) { userRole.textContent = project.userRole }
        
        // Get dates with functions
        // Default start date = today
        // Default finish date = start date + 30 days
        const startDate = detailsPage.querySelector("[data-project-info='startDate']")
        const dateStartGet = this.getDateStart(startDate as HTMLDivElement, project)
        const finishDate = detailsPage.querySelector("[data-project-info='finishDate']")
        const dateFinishGet = this.getDateFinish(finishDate as HTMLDivElement, project, dateStartGet)

        // Data project
        const cost = detailsPage.querySelector("[data-project-info='cost']")
        if (cost) { cost.textContent = `$${project.cost}` }
        const progress = detailsPage.querySelector("[data-project-info='progress']") as HTMLDivElement
        if (progress) { 
            progress.textContent = `${project.progress}%`
            progress.style.width = `${project.progress}%`;
        }
    }

    editProject(data: Object) {      
        const projectEdit = this.getProjectSelected() as Project
        // Convert object data in project data
        for (let key in data) {
            projectEdit[key] = data[key]
        }
        // Set changes
        const projectId = this.setEditProject(projectEdit)
        return projectId
    }

    private setEditProject(edited: Project) {
        this.setDetailsPage(edited)
        this.setUIEdit(edited)
    }

    getDataEditPage() {
        // Get all data of project form
        // Data from project and form
        const detailsPage = document.getElementById("project-details") as HTMLDivElement
        if (!detailsPage) { return console.warn("Page not found") }
        const editForm = document.getElementById("edit-project-form") as HTMLFormElement
        if (!editForm) { return console.warn("Page not found") }
        // Name
        const name = detailsPage.querySelector("[data-project-info='name']") as HTMLDivElement
        const nameEdit = document.getElementById("edit-form-name") as HTMLInputElement
        if (name.textContent) { nameEdit.value = name.textContent }
        // Description
        const description = detailsPage.querySelector("[data-project-info='description']") as HTMLDivElement
        const descriptionEdit = document.getElementById("edit-form-description") as HTMLInputElement
        if (description.textContent) { descriptionEdit.value = description.textContent }
        // Role
        const role = detailsPage.querySelector("[data-project-info='userRole']") as HTMLDivElement
        const roleEdit = document.getElementById("edit-form-role") as HTMLInputElement
        if (role.textContent) { roleEdit.value = role.textContent }
        // Status
        const status = detailsPage.querySelector("[data-project-info='status']") as HTMLDivElement
        const statusEdit = document.getElementById("edit-form-status") as HTMLInputElement
        if (status.textContent) { statusEdit.value = status.textContent }
        // Start date
        const start = detailsPage.querySelector("[data-project-info='startDate']") as HTMLDivElement
        let startEdit = document.getElementById("edit-form-start") as HTMLInputElement
        let startValue = start.textContent?.split("/").reverse().join("/").replaceAll("/", "-") as string
        startValue = this.convertFormatDate(startValue) as string
        if (start.textContent) { startEdit.value = startValue }
        // Finish date
        const finish = detailsPage.querySelector("[data-project-info='finishDate']") as HTMLDivElement
        let finishEdit = document.getElementById("edit-form-finish") as HTMLInputElement
        let finishValue = finish.textContent?.split("/").reverse().join("/").replaceAll("/", "-") as string
        finishValue = this.convertFormatDate(finishValue) as string
        if (finish.textContent) { finishEdit.value = finishValue }
        // Cost
        const cost = detailsPage.querySelector("[data-project-info='cost'") as HTMLDivElement
        let costEdit = document.getElementById("edit-form-cost") as HTMLInputElement
        if (cost.textContent) { costEdit.value = cost.textContent.slice(1) }
        // Progress
        const progress = detailsPage.querySelector("[data-project-info='progress'") as HTMLDivElement
        let progressEdit = document.getElementById("edit-form-progress") as HTMLInputElement
        if (progress.textContent) { progressEdit.value = progress.textContent.slice(0, -1) }
    }
    
    newToDo(data: IToDo) {
        const projectToDo = this.getProjectSelected() as Project
        const projectUI = projectToDo.toDoUI
        const projectListToDo = projectToDo.toDoList
        
        // Create ToDo
        if (data.content.length < 3) {
            throw new Error(`The content of the ToDo must be a minimum of 3 characters.`)
        }
        if (data.todoDate.toDateString() == "Invalid Date") {
            throw new Error(`You have not selected any dates yet.`)
        }
        const toDo = new ToDo(data)
        projectListToDo.push(toDo)
        
        // console.log(projectToDo.toDoUI)
        // console.log(toDo.ui)
        // console.log(toDo.content.length)

        for (let td = 0; td < projectListToDo.length; td++) {
            projectUI.append(projectListToDo[td].ui)
        }

        // console.log(toDo)
        // console.log(projectUI)
        // console.log(projectListToDo)
        
        // console.log(projectToDo)

        //this.editToDo()
        
        return toDo
    }

    editToDo() {
        // const projectCurrent = this.getProjectSelected() as Project
        // if(!projectCurrent) { return }
        // const toDoS = projectCurrent.toDoList

        // const formEditToDo = document.getElementById("")

        // for (let i=0;i < toDoS.length;i++){
        //     toDoS[i].ui.addEventListener("click", () => {
        //         console.log(toDoS[i].color)
        //         console.log(toDoS[i])
        //         return toDoS[i]
        //     })
        // }
        

        // FALTAAAAAAAAAAAA
        // this.getDataEditTodo()
        // const toDoConsole = this.getToDoSelected()
        // console.log(typeof(toDoConsole))


        // const todoEdit = this.getProjectSelected()
        // if (this.list.length != 0 && todoEdit) {
        //     const toDoS = todoEdit.toDoList
        //     for (let i=0;i < todoEdit.toDoList.length;i++){
        //         toDoS[i].ui.addEventListener("click", () => {
        //             // console.log(toDoS[i].color)
        //             // console.log(toDoS[i])
        //             // console.log(toDoS[i].id)
        //             // console.log(toDoS[i].ui.id)
                    
        //             showModal("edit-todo-modal")
        //             // projectsManager.editToDo()
        //             projectsManager.getToDoSelected()
        //             console.log(todoEdit.toDoList)
        //         })
        //     }
        // } else {
        //     console.log("There is an error")
        // }




    }

    // RELLENA EL FORMULARIO, PERO FALTA QUE RELLENE LA TASK CORRECTA
    // FALTA BOTON CANCEL
    // FALTA BOTON ACEPTAR PARA MODIFICAR
    // FALTA BOTON ELIMINAR


    getDataEditTodo() {
        // Get all data of ToDo form
        // Data from Todo and form
        const listCards = document.getElementById("todo-list") as HTMLDivElement
        if (!listCards) { return console.warn("Page not found") }
        const editForm = document.getElementById("edit-todo-form") as HTMLFormElement
        if (!editForm) { return console.warn("Page not found") }
        // Content
        const description = listCards.querySelector("[data-project-info='todoContent']") as HTMLDivElement
        const descriptionEdit = document.getElementById("todo-edit-content") as HTMLInputElement
        if (description.textContent) { descriptionEdit.value = description.textContent }
        // ToDo date
        const dateToDoForm = listCards.querySelector("[data-project-info='todoDate']") as HTMLDivElement
        let todoDate = document.getElementById("todo-edit-date") as HTMLInputElement
        let todoDateValue = dateToDoForm.textContent?.split("/").reverse().join("/").replaceAll("/", "-") as string
        todoDateValue = this.convertFormatDate(todoDateValue) as string
        if (dateToDoForm.textContent) { todoDate.value = todoDateValue }
        // State
        const state = listCards.querySelector("[data-project-info='todoState']") as HTMLDivElement
        const todoSate = document.getElementById("todo-edit-state") as HTMLInputElement
        if (state.textContent) { todoSate.value = state.textContent }
    }

    setUIEdit(edited: Project) {
        edited.dateValidation()
        edited.ui.innerHTML = `
        <div class="card-header">
            <p style="background-color: ${edited.color}; padding: 10px; border-radius: 8px; aspect-ratio: 1;">${edited.name == "" ? "ID" : edited.name.toUpperCase().substring(0,2)}</p>
            <div>
                <h5>${edited.nameValidation(edited.name)}</h5>
                <p>${edited.description}</p>
            </div>
        </div>
        <div class="card-content">
            <div class="card-property">
                <p style="color: #969696;">Status</p>
                <p>${edited.status}</p>
            </div>
            <div class="card-property">
                <p style="color: #969696;">Role</p>
                <p>${edited.userRole}</p>
            </div>
            <div class="card-property">
                <p style="color: #969696;">Cost</p>
                <p>$${edited.cost}</p>
            </div>
            <div class="card-property">
                <p style="color: #969696;">Estimated Progress</p>
                <p>${edited.progress}%</p>
            </div>
        </div>
        `
    }

    getProject(id: string) {
        const project = this.list.find((project) => {
            return project.id === id;
        });
        return project;
    }

    getProjectByName(name: string) {
        const project = this.list.find((project) => {
            return project.name == name;
        });
        return project;
    }

    getProjectSelected() {
        // Get ID from html card
        const detailsPage = document.getElementById("project-details") as HTMLDivElement
        if (!detailsPage) { return console.warn("Page not found") }
        const lastDiv = detailsPage.lastChild as HTMLDivElement
        // Get project that matches with the id
        const listProjectEdit: Project[] = []
        const listProjects = this.list.map((project) => {
            if (lastDiv.id == project.id) { return project } })
        listProjects.forEach((p) => {
            if (p != undefined) { 
                listProjectEdit.push(p)
                return listProjectEdit 
            }
        })        
        return listProjectEdit[0]
    }

    getToDoSelected() {
        let idToDo 
        const toDosUI = document.querySelectorAll(".todo-class")
        toDosUI.forEach((toDoCard) => {
            toDoCard.addEventListener('click', () => {
                // Select ToDo's ID
                console.log(toDoCard.id);
                console.log(toDoCard);
                idToDo =  toDoCard.id
            });
        });
        console.log(toDosUI)
        return idToDo
    }

    deleteProject(id: string) {
        const project = this.getProject(id);
        if (!project) {
            return;
        }
        project.ui.remove();
        const remaining = this.list.filter((project) => {
            return project.id !== id;
        });
        this.list = remaining;
    }

    deleteProjectSelected() {
        const idDelete = this.getProjectSelected() as Project
        if(idDelete) {
            this.deleteProject(idDelete.id)
        }
    }

    getTotalCost() {
        const totalCost: number = this.list.reduce(
            (sumOfCost, currentProject) => sumOfCost + currentProject.cost,
            0
        );
        return totalCost;
    }

    exportToJSON(filename: string = "arqfi_projects.json") {
        function removeUI(key, value) {
            if (key === "ui") {
                return undefined;
            }
            return value;
        }
        const json = JSON.stringify(this.list, removeUI, 2)
        const blob = new Blob([json], { type: 'aplication/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    importFromJSON() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        const reader = new FileReader()
        reader.addEventListener("load", () => {
            const json = reader.result
            if (!json) { return }
            const projects: Project[] = JSON.parse(json as string)
            for (const project of projects) {
                try {
                    const readProject = this.newProject(project)
                    readProject.color = project.color
                    readProject.id = project.id
                    readProject.ui.id = project.id
                    if (readProject.startDate == null) {
                        readProject.startDate = new Date(Date.now())
                    }
                    if (readProject.finishDate == null) {
                        readProject.finishDate = new Date(Date.now())
                    }
                    readProject.ui.innerHTML = 
                    `
                    <div class="card-header">
                        <p style="background-color: ${readProject.color}; padding: 10px; border-radius: 8px; aspect-ratio: 1;">${readProject.name == "" ? "ID" : readProject.name.toUpperCase().substring(0,2)}</p>
                        <div>
                            <h5>${readProject.name}</h5>
                            <p>${readProject.description}</p>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="card-property">
                            <p style="color: #969696;">Status</p>
                            <p>${readProject.status}</p>
                        </div>
                        <div class="card-property">
                            <p style="color: #969696;">Role</p>
                            <p>${readProject.userRole}</p>
                        </div>
                        <div class="card-property">
                            <p style="color: #969696;">Cost</p>
                            <p>$${readProject.cost}</p>
                        </div>
                        <div class="card-property">
                            <p style="color: #969696;">Estimated Progress</p>
                            <p>${readProject.progress}%</p>
                        </div>
                    </div>
                    `
                    readProject.toDoUI.innerHTML = ""
                    for (let t of readProject.toDoList) {
                        t.ui = document.createElement("div")
                        t.ui.id = t.id
                        t.ui.className = "todo-class"
                        t.ui.style.display = "flex"
                        t.ui.style.flexDirection = "column"
                        t.ui.style.padding = "10px 30px"
                        t.ui.style.rowGap = "20px"
                        t.ui.innerHTML =
                        `
                        <div class="todo-item" style="background-color: ${t.color};">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; column-gap: 15px; align-items: center;">
                                    ${t.icon}
                                    <p data-project-info="todoContent">${t.content}</p>
                                </div>
                                <p data-project-info="todoDate" style="text-wrap: nowrap; margin-left: 10px;">${new Date(t.todoDate).toLocaleDateString()}</p>
                                <div data-project-info="todoState" style="display: none">${t.state}</div>
                            </div>
                        </div>
                        `
                        readProject.toDoUI.append(t.ui)
                    }
                    console.log(this.list)
                    console.log(readProject)
                    // console.log(project)
                    // console.log(project.color)
                    // console.log(readProject)
                    // console.log(readProject.toDoUI)
                    console.log(readProject.toDoList)
                } catch (error) {
                    console.log(error)
                }
            }
        })
        input.addEventListener('change', () => {
            const filesList = input.files
            if (!filesList) { return }
            reader.readAsText(filesList[0])
        })
        input.click()
    }

    getDateStart(date: HTMLDivElement, project: Project) {
        let dateString: Date, dateObj: Date, dateStart: string, start: any
        if (project.startDate instanceof Date) {
            start = project.startDate
        } else {
            // If isn't Date is String
            start = new Date(project.startDate)
        }
        if (start.toLocaleDateString() !== "Invalid Date") {
            dateString = start
            dateObj = new Date(dateString)
            date.textContent = dateObj.toLocaleDateString()
        } else {
            let time = Date.now()
            dateObj = new Date(time)
            date.textContent = dateObj.toLocaleDateString()
        }
        return dateObj
    }

    getDateFinish(date: HTMLDivElement, project: Project, start: Date) {
        let dateString: Date, dateObj: Date, time: number, finish: any
        if (project.finishDate instanceof Date) {
            finish = project.finishDate
        } else {
            // If isn't Date is String
            finish = new Date(project.finishDate)
        }
        if (finish.toLocaleDateString() !== "Invalid Date") {
            dateString = finish
            dateObj = new Date(dateString)
            date.textContent = dateObj.toLocaleDateString()
        } else {
            time = start.getTime() + 2.628e+9 // 30 days
            dateObj = new Date(time)
            date.textContent = dateObj.toLocaleDateString()
        }
        return dateObj
    }

    convertFormatDate (dateString: string) {
        const startArray = dateString.split("-")
        let day = startArray[2]
        let month = startArray[1]
        let year = startArray[0]
        // Convert Start Date to format yyyy-mm-dd (10)
        if (dateString.length == 10) {
            return dateString
        }
        // Convert from format yyyy-m-dd (9)
        else if (dateString.length == 9 && dateString[4] == "-" && dateString[6] == "-") {
            startArray[0] = year
            month = "0" + month
            startArray[1] = month
            startArray[2] = day
            dateString = startArray.join("-")
            return dateString
        } 
        // Convert from format yyyy-mm-d (9)
        else if (dateString.length == 9 && dateString[4] == "-" && dateString[7] == "-") {
            startArray[0] = year
            startArray[1] = month
            day = "0" + day
            startArray[2] = day
            dateString = startArray.join("-")
            return dateString
        }
        // Convert from format yyyy-m-d (8)
        else if (dateString.length == 8 && dateString[4] == "-" && dateString[6] == "-") {
            startArray[0] = year
            month = "0" + month
            startArray[1] = month
            day = "0" + day
            startArray[2] = day
            dateString = startArray.join("-")
            return dateString
        } 
        // Defeult value
        else {
            dateString = "2000-01-01"
            return dateString
        }
    }
}