import { IProject, Project } from "./Project";
import { IToDo, ToDo } from "./ToDo";

export class ProjectsManager {
    list: Project[] = [];
    ui: HTMLElement;
    #id: string;
    
    constructor(container: HTMLElement) {
        this.ui = container;
        // Esto lo habilitamos si queremos un ejemplo al iniciar
        // this.newProject({
        //     name: "BIM Proyect",
        //     description: "This is just a default app project",
        //     status: "Finished",
        //     userRole: "Engineer",
        //     startDate: new Date(),
        //     finishDate: new Date(new Date().getTime() + 2.628e+9) // 30 days
        // });
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
            
            

            // Clean HTML ToDo's and add project's ToDo's
            let todoList = document.getElementById("todo-list") as HTMLDivElement
            todoList.innerHTML = ""
            todoList.appendChild(project.toDoUI)

            
            // Select and edit ToDo nexto to create Project
            // this.getToDoSelected().then(selected => {
            //     console.log(selected);
            // });
            //this.editToDo()
            this.getToDoID()
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
    
    // newToDo(data: IToDo) {
    //     const projectToDo = this.getProjectSelected() as Project
    //     const projectUI = projectToDo.toDoUI as HTMLDivElement
    //     const projectListToDo = projectToDo.toDoList
        
    //     // Create ToDo
    //     if (data.content.length < 3) {
    //         throw new Error(`The content of the ToDo must be a minimum of 3 characters.`)
    //     }
    //     if (data.todoDate.toDateString() == "Invalid Date") {
    //         throw new Error(`You have not selected any dates yet.`)
    //     }
    //     const toDo = new ToDo(data)
    //     projectListToDo.push(toDo)

    //     for (let td = 0; td < projectListToDo.length; td++) {
    //         projectUI.append(projectListToDo[td].ui)
    //     }
        
    //     return toDo
    // }

    newToDo(data: IToDo) {
        const projectToDo = this.getProjectSelected() as Project
        const projectUI = projectToDo.toDoUI as HTMLDivElement
        const projectListToDo = projectToDo.toDoList
        
        // Validate ToDo data
        if (data.content.length < 3) {
            throw new Error(`The content of the ToDo must be a minimum of 3 characters.`)
        }
        if (isNaN(data.todoDate.getTime())) {
            throw new Error(`You have not selected any dates yet.`)
        }
    
        // Create and add ToDo to project
        const toDo = new ToDo(data)
        projectListToDo.push(toDo)
    
        // Add ToDo to project UI
        projectUI.innerHTML = toDo.ui.outerHTML + projectUI.innerHTML

        // Select and edit ToDo nexto to create ToDo
        //this.editToDo()
        //console.log(this.getToDoSelected())
        this.getToDoID()

        return toDo
    }

    editToDo(data: Object) {
        const projectToDo = this.getProjectSelected() as Project
        const thisToDo = this.getToDoSelected() as ToDo
        if (!thisToDo) { return console.warn("ToDo not found") }
        thisToDo.content = data["content"]
        thisToDo.todoDate = data["todoDate"]
        thisToDo.state = data["state"]
        console.log(thisToDo)
        // console.log(thisToDo.setIconTodo(thisToDo.state))
        // console.log(thisToDo.setColorTodo(thisToDo.state))
        thisToDo.icon = thisToDo.setIconTodo(thisToDo.state)
        thisToDo.color = thisToDo.setColorTodo(thisToDo.state)
        for(let i=0; i<projectToDo.toDoUI.children.length; i++) {
            if (projectToDo.toDoUI.children[i].id == thisToDo.id) {
                projectToDo.toDoUI.children[i].innerHTML = ""
                projectToDo.toDoUI.children[i].innerHTML =
                `
                <div class="todo-item" style="background-color: ${thisToDo.color};">
                    <div class="todo-item-1" style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="todo-item-2" style="display: flex; column-gap: 15px; align-items: center;">
                            ${thisToDo.icon}
                            <p class="todo-item-3" data-project-info="todoContent">${thisToDo.content}</p>
                        </div>
                        <p class="todo-item-2" data-project-info="todoDate" style="text-wrap: nowrap; margin-left: 10px;">${thisToDo.todoDate instanceof Date ? thisToDo.todoDate.toLocaleDateString() : new Date(thisToDo.todoDate).toLocaleDateString()}</p>
                        <div class="todo-item-2" data-project-info="todoState" style="display: none">${thisToDo.state}</div>
                    </div>
                </div>
                `
            }
        }

        console.log(projectToDo.toDoList)
        console.log(projectToDo.toDoUI)   
        return thisToDo  
    }

    getDataEditToDo() {
        // Select ToDo to extract data
        const thisToDo = this.getToDoSelected() as ToDo
        // Get all data of ToDo form
        // Data from Todo and form
        const listCards = document.getElementById("todo-list") as HTMLDivElement
        if (!listCards) { return console.warn("Page not found") }
        const editForm = document.getElementById("edit-todo-form") as HTMLFormElement
        if (!editForm) { return console.warn("Page not found") }
        // Content
        const descriptionEdit = document.getElementById("todo-edit-content") as HTMLInputElement
        if (descriptionEdit) { descriptionEdit.value = thisToDo.content }
        // ToDo date
        let thisDate = thisToDo.todoDate instanceof Date ? thisToDo.todoDate.toLocaleDateString() : new Date(thisToDo.todoDate).toLocaleDateString()
        let reverseThisDate = thisDate.split("/").reverse().join("/").replaceAll("/", "-") as string
        reverseThisDate = this.convertFormatDate(reverseThisDate) as string
        const todoDate = document.getElementById("todo-edit-date") as HTMLInputElement
        if (todoDate) { todoDate.value = reverseThisDate }
        // State
        const todoSate = document.getElementById("todo-edit-state") as HTMLInputElement
        if (todoSate) { todoSate.value = thisToDo.state }
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

    setToDoUIEdit(edited: ToDo) {
        edited.ui.innerHTML = 
        `
        <div class="todo-item" style="background-color: ${edited.color};">
            <div class="todo-item-1" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="todo-item-2" style="display: flex; column-gap: 15px; align-items: center;">
                    ${edited.icon}
                    <p class="todo-item-3" data-project-info="todoContent">${edited.content}</p>
                </div>
                <p class="todo-item-2" data-project-info="todoDate" style="text-wrap: nowrap; margin-left: 10px;">${edited.todoDate instanceof Date ? edited.todoDate.toLocaleDateString() : new Date(edited.todoDate).toLocaleDateString()}</p>
                <div class="todo-item-2" data-project-info="todoState" style="display: none">${edited.state}</div>
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

    getToDo(id: string) {
        const projectToDo = this.getProjectSelected() as Project
        const toDo = projectToDo.toDoList.find((todo) => {
            return todo.id === id;
        });
        return toDo;
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
    
    getToDoID() {
        const thisProject = this.getProjectSelected() as Project
        const todoList = thisProject.toDoUI.querySelectorAll("#todo-list .todo-cards .todo-class");
        if (!todoList) { return }
        todoList.forEach((toDoCard) => {
            toDoCard.addEventListener('click', (event) => {
                if (!event.currentTarget) { return; }
                this.#id = (event.currentTarget as HTMLDivElement).id;
            });
        });
    }

    getToDoSelected() {
        let thisToDo;
        const thisProject = this.getProjectSelected() as Project
        thisProject.toDoList.forEach((t) => {
            if (t.id == this.#id) {
                thisToDo = t
            }
        })
        return thisToDo
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

    deleteToDo(id: string) {
        const projectToDo = this.getProjectSelected() as Project
        const toDo = this.getToDo(id);
        if (!toDo) {
            return;
        }
        toDo.ui.remove();
        const remaining = projectToDo.toDoList.filter((todo) => {
            return todo.id !== id;
        });
        projectToDo.toDoList = remaining;
    }

    deleteToDoSelected() {
        const idDelete = this.getToDoSelected()
        if(idDelete) {
            this.deleteToDo(idDelete.id)
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

    

    // ESTO TAMPOCO FUNCIONA CORRECTAMENTE AUN
    importFromJSON() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        const reader = new FileReader()
        reader.addEventListener("load", () => {
            const json = reader.result
            
            

            if (!json) { return }
            const projects: Project[] = JSON.parse(json as string)
            console.log(projects[0])
            // console.log(projects[0].getColor(projects[0].id))
            console.log(typeof(projects[0]))
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

                    const toDoS: ToDo[] = readProject.toDoList
                    for (let t of toDoS) {
                        try {
                            //t = this.newToDo(t)
                            console.log(typeof(t))
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
                                <div class="todo-item-1" style="display: flex; justify-content: space-between; align-items: center;">
                                    <div class="todo-item-2" style="display: flex; column-gap: 15px; align-items: center;">
                                        ${t.icon}
                                        <p class="todo-item-3" data-project-info="todoContent">${t.content}</p>
                                    </div>
                                    <p class="todo-item-2" data-project-info="todoDate" style="text-wrap: nowrap; margin-left: 10px;">${new Date(t.todoDate).toLocaleDateString()}</p>
                                    <div class="todo-item-2" data-project-info="todoState" style="display: none">${t.state}</div>
                                </div>
                            </div>
                            `
                            readProject.toDoUI.append(t.ui)
                        } catch (error) {
                            console.log(error)
                        }
                    }
                    // for (let t of readProject.toDoList as ToDo[]) {
                    //     t.ui = document.createElement("div")
                    //     t.ui.id = t.id
                    //     t.ui.className = "todo-class"
                    //     t.ui.style.display = "flex"
                    //     t.ui.style.flexDirection = "column"
                    //     t.ui.style.padding = "10px 30px"
                    //     t.ui.style.rowGap = "20px"
                    //     t.ui.innerHTML =
                    //     `
                    //     <div class="todo-item" style="background-color: ${t.color};">
                    //         <div class="todo-item-1" style="display: flex; justify-content: space-between; align-items: center;">
                    //             <div class="todo-item-2" style="display: flex; column-gap: 15px; align-items: center;">
                    //                 ${t.icon}
                    //                 <p class="todo-item-3" data-project-info="todoContent">${t.content}</p>
                    //             </div>
                    //             <p class="todo-item-2" data-project-info="todoDate" style="text-wrap: nowrap; margin-left: 10px;">${new Date(t.todoDate).toLocaleDateString()}</p>
                    //             <div class="todo-item-2" data-project-info="todoState" style="display: none">${t.state}</div>
                    //         </div>
                    //     </div>
                    //     `
                    //     readProject.toDoUI.append(t.ui)
                    //     //console.log(t.ui)
                    // }

                    // console.log(this.list)
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

    // importFromJSON() {
    //     const input = document.createElement('input');
    //     input.type = 'file';
    //     input.accept = 'application/json';

    //     input.addEventListener('change', () => {
    //         const filesList = input.files;
    //         if (!filesList) { return }

    //         const reader = new FileReader();
    //         reader.readAsText(filesList[0]);

    //         reader.addEventListener("load", () => {
    //             const json = reader.result;
    //             if (!json) { return }

    //             const data = JSON.parse(json as string);
    //             if (!Array.isArray(data)) {
    //                 throw new Error("Invalid JSON format");
    //             }

    //             for (const projectData of data) {
    //                 const project = this.newProject(projectData);
    //                 this.list.push(project);

    //                 for (const t of projectData.toDoList) {
    //                     t
    //                     // t.ui = document.createElement("div")
    //                     // t.ui.id = t.id
    //                     // t.ui.className = "todo-class"
    //                     // t.ui.style.display = "flex"
    //                     // t.ui.style.flexDirection = "column"
    //                     // t.ui.style.padding = "10px 30px"
    //                     // t.ui.style.rowGap = "20px"
    //                     // t.ui.innerHTML =
    //                     // `
    //                     // <div class="todo-item" style="background-color: ${t.color};">
    //                     //     <div style="display: flex; justify-content: space-between; align-items: center;">
    //                     //         <div style="display: flex; column-gap: 15px; align-items: center;">
    //                     //             ${t.icon}
    //                     //             <p data-project-info="todoContent">${t.content}</p>
    //                     //         </div>
    //                     //         <p data-project-info="todoDate" style="text-wrap: nowrap; margin-left: 10px;">${new Date(t.todoDate).toLocaleDateString()}</p>
    //                     //         <div data-project-info="todoState" style="display: none">${t.state}</div>
    //                     //     </div>
    //                     // </div>
    //                     // `
    //                     project.toDoUI.append(t.ui)
                        
    //                     // const todoProject = new ToDo(todoData)
    //                     // projectData.toDoList = []
    //                     // project.toDoList.push(todoProject)

    //                     // const todo = this.newToDo(todoData);
    //                     // project.toDoList.push(t);

    //                     console.log(project.toDoUI)
    //                     console.log(t);
    //                     console.log(projectData.toDoList);
    //                     // console.log(todo);
    //                 }
    //             }
    //         });
    //     });

    //     input.click();
    // }

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

    // setColorTodo(state: string): string {
    //     if (state == "Active") {
    //         return this.listStates[0]['color']
    //     }
    //     else if (state == "Pending") {
    //         return this.listStates[1]['color']
    //     }
    //     else if (state == "Finished") {
    //         return this.listStates[2]['color']
    //     }
    //     else if (state == "Discarded") {
    //         return this.listStates[3]['color']
    //     } else {
    //         return "blue"
    //     }
    // }

}