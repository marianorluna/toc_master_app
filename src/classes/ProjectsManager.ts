import { IProject, Project } from "./Project";

export class ProjectsManager {
    list: Project[] = [];
    ui: HTMLElement;
    
    constructor(container: HTMLElement) {
        this.ui = container;
        // Esto lo habilitamos si queremos un ejemplo al iniciar
        // this.newProject({
        //     name: "BIM Proyect",
        //     description: "This is just a default app project",
        //     status: "Pending",
        //     userRole: "Architect",
        //     finishDate: new Date(),
        // });
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
        
        const description = detailsPage.querySelector("[data-project-info='description']")
        if (description) { description.textContent = project.description }
        const cardName = detailsPage.querySelector("[data-project-info='cardName']")
        if (cardName) { cardName.textContent = project.name }
        const cardDescription = detailsPage.querySelector("[data-project-info='cardDescription']")
        if (cardDescription) { cardDescription.textContent = project.description }
        const status = detailsPage.querySelector("[data-project-info='status']")
        if (status) { status.textContent = project.status }
        const userRole = detailsPage.querySelector("[data-project-info='userRole']")
        if (userRole) { userRole.textContent = project.userRole }
        const finishDate = detailsPage.querySelector("[data-project-info='finishDate']")
        if (finishDate) { 
            let dateString = project.finishDate
            let dateObj = new Date(dateString)
            finishDate.textContent = dateObj.toDateString() 
        }
        const cost = detailsPage.querySelector("[data-project-info='cost']")
        if (cost) { cost.textContent = `$${project.cost}` }
        const progress = detailsPage.querySelector("[data-project-info='progress']") as HTMLDivElement
        if (progress) { 
            progress.textContent = `${project.progress * 100}%`
            progress.style.width = `${project.progress * 100}%`;
        }
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
}