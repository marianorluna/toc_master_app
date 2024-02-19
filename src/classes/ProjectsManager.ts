import { IProject, Project } from "./Project";

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

            ////////////////////////////
            // console.log("TEXTO CADA VEZ QUE PRESIONO UI CARD")
            // console.log(project.id)
            // console.log(this.ui)
            // console.log(typeof(this.ui))
            // console.log(this.list[0])
            // console.log(this.list)
            // puedo usar el mismo listener para obtener el id
            // this.ui.addEventListener("click", (e) => {
            //     const selection = e.currentTarget as HTMLElement
            //     const cardId = selection.firstChild
            //     console.log(cardId)
            // })
            ///////////////////////////
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
        
        console.log(this.ui)
        console.log(this.list)

        return project;
    }

    private setDetailsPage(project: Project) {
        // Project name
        const detailsPage = document.getElementById("project-details") as HTMLDivElement
        if (!detailsPage) { return console.warn("Page not found") }
        const name = detailsPage.querySelector("[data-project-info='name']")
        if (name) { name.textContent = project.name }

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
            progress.textContent = `${project.progress * 100}%`
            progress.style.width = `${project.progress * 100}%`;
        }
    }

    // FALTA DESARROLLAR ESTOOOOOOOOO
    editProject(data: Object) {
        //let projectPropEdited = new Object()
        const propEdit = Object.keys(data)
        const propListEdit = this.list.map((projectEdited) => {
            for (let key in data) {
                // console.log(projectEdited[key])
                projectEdited[key] = data[key]
                // console.log(data[key])
            }
            this.setEditProject(projectEdited)
            
            
            
            // console.log(projectEdited)
            // console.log(typeof(projectEdited))
            // console.log(projectEdited.name)
            return projectEdited
        })
        // console.log(projectEdited)
        // console.log(typeof(projectPropEdited))
        // console.log(this.ui)
    }

    private setEditProject(edited: Project) {
        // Project name
        const detailsPage = document.getElementById("project-details") as HTMLDivElement
        if (!detailsPage) { return console.warn("Page not found") }
        const name = detailsPage.querySelector("[data-project-info='name']")
        if (name) { name.textContent = edited.name }

        // Project icon
        const icono = detailsPage.querySelector("[data-project-info='icono']") as HTMLParagraphElement
        if (icono) {
            icono.style.backgroundColor = edited.color
            if (edited.name == "") {
                icono.textContent = "ID"
            } else {
                icono.textContent = edited.name.toUpperCase().substring(0,2)
            }
        }
        
        // Project info
        const description = detailsPage.querySelector("[data-project-info='description']")
        if (description) { description.textContent = edited.description}
        const cardName = detailsPage.querySelector("[data-project-info='cardName']")
        if (cardName) { cardName.textContent = edited.name}
        const cardDescription = detailsPage.querySelector("[data-project-info='cardDescription']")
        if (cardDescription) { cardDescription.textContent = edited.description}
        const status = detailsPage.querySelector("[data-project-info='status']")
        if (status) { status.textContent = edited.status }
        const userRole = detailsPage.querySelector("[data-project-info='userRole']")
        if (userRole) { userRole.textContent = edited.userRole }
        
        // Get dates with functions
        // Default start date = today
        // Default finish date = start date + 30 days
        const startDate = detailsPage.querySelector("[data-project-info='startDate']")
        const dateStartGet = this.getDateStart(startDate as HTMLDivElement, edited)
        const finishDate = detailsPage.querySelector("[data-project-info='finishDate']")
        const dateFinishGet = this.getDateFinish(finishDate as HTMLDivElement, edited, dateStartGet)

        // Data project
        const cost = detailsPage.querySelector("[data-project-info='cost']")
        if (cost) { cost.textContent = `$${edited.cost}` }
        const progress = detailsPage.querySelector("[data-project-info='progress']") as HTMLDivElement
        if (progress) { 
            progress.textContent = `${edited.progress * 100}%`
            progress.style.width = `${edited.progress * 100}%`;
        }
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
        startValue = this.convertFormatDate(startValue)
        if (start.textContent) { startEdit.value = startValue }
        // Finish date
        const finish = detailsPage.querySelector("[data-project-info='finishDate']") as HTMLDivElement
        let finishEdit = document.getElementById("edit-form-finish") as HTMLInputElement
        let finishValue = finish.textContent?.split("/").reverse().join("/").replaceAll("/", "-") as string
        finishValue = this.convertFormatDate(finishValue)
        if (finish.textContent) { finishEdit.value = finishValue }
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

    getTotalCost() {
        const totalCost: number = this.list.reduce(
            (sumOfCost, currentProject) => sumOfCost + currentProject.cost,
            0
        );
        return totalCost;
    }

    exportToJSON(filename: string = "projects.json") {
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
            const projects: IProject[] = JSON.parse(json as string)
            for (const project of projects) {
                try {
                    this.newProject(project)
                } catch (error) {
                    
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
        let dateString: Date, dateObj: Date, dateStart: string
        if (project.startDate.toLocaleDateString() !== "Invalid Date") {
            dateString = project.startDate
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
        let dateString: Date, dateObj: Date, time: number
        if (project.finishDate.toLocaleDateString() !== "Invalid Date") {
            dateString = project.finishDate
            dateObj = new Date(dateString)
            date.textContent = dateObj.toLocaleDateString()
        } else {
            time = start.getTime() + 2.628e+9 // 30 days
            dateObj = new Date(time)
            date.textContent = dateObj.toLocaleDateString()
        }
        return dateObj
    }

    // Hay que arreglar la función en el caso que length==9 y 8
    convertFormatDate (dateString: string) {
        // Convert Start Date to format yyyy-mm-dd
        if (dateString.length == 10) {
            return dateString
        } else {
            const startArray = dateString.split("-")
            let month = startArray[1]
            month = "0" + month
            startArray[1] = month
            dateString = startArray.join("-")
            return dateString
        } 
        // else {
        //     const startArray = dateString.split("-")
        //     let day = startArray[0]
        //     let month = startArray[1]
        //     day = "0" + day
        //     month = "0" + month
        //     startArray[0] = day
        //     startArray[1] = month
        //     dateString = startArray.join("-")
        //     return dateString
        // }
    }
}