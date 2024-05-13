import { IProject, Project, ProjectStatus, UserRole } from "./classes/Project";
import { ProjectsManager as PM } from "./classes/ProjectsManager";
import { IToDo, ToDo, ToDoStates } from "./classes/ToDo";
import { TodoCreator } from './bim-components/TodoCreator';

// Default project
const projectsListUI = document.getElementById("projects-list") as HTMLElement;
const projectsManager = new PM(projectsListUI);

// Functions
function showModal(id: string) {
    const modal = document.getElementById(id);
    if (modal && modal instanceof HTMLDialogElement) {
        modal.showModal();
    } else {
        console.warn("The provided modal was not found. ID: ", id);
    }
}
function closeModal(id: string) {
    const modal = document.getElementById(id);
    if (modal && modal instanceof HTMLDialogElement) {
        modal.close();
    } else {
        console.warn("The provided modal was not found. ID: ", id);
    }
}
function toggleModal(id: string) {
    const modal = document.getElementById(id);
    if (modal && modal instanceof HTMLDialogElement) {
        if (modal.open) {
            modal.close();
        } else {
            modal.showModal();
        }
    } else {
        console.warn("Element id is not found!", id);
    }
}

// // CSS Grid with JavaScript
// const screen = {
//     small: 0,
//     medium: 768,
//     large: 1024
// };
// // Observe window resize
// window.addEventListener('resize', resizeHandler);
// // Initial call
// // resizeHandler();
// // Calculate size
// function resizeHandler() {
//     // get window width
//     const iw = window.innerWidth;
//     // determine named size
//     let size: any;
//     for (let s in screen) {
//         if (iw >= screen[s]) size = s;
//     }
//     if (size === 'small') {
//         document.body.style.gridTemplateAreas = '"sidebar" "content"';
//         document.body.style.gridTemplateColumns = '1fr';
//         header.style.display = "none"
//     }
//     else if (size === 'medium') {
//         document.body.style.gridTemplateColumns = '20rem 1fr';
//         document.body.style.gridTemplateAreas = '"sidebar header" "sidebar content"';
//         header.style.display = "flex"
//     }
//     console.log(size);
// }

// Start page
const startPage = document.getElementById("start-page")
const startImg = document.getElementById("img-start")
const startEnter = document.getElementById("start-enter")
const sidebar = document.getElementById("sidebar")
const main = document.getElementById("content")
const header = document.getElementById("main-header") as HTMLElement
const dropdownMenu = document.getElementById("dropdown-menu")
if (sidebar && main && startEnter && startPage && header && dropdownMenu) {
    startEnter.addEventListener("click", () => {
        //resizeHandler()
        dropdownMenu.style.display = "flex"
        if(window.innerWidth < 768) {
            header.style.display = "none"
        } else {
            header.style.display = "flex"
        }
        
        document.body.style.display = "grid"
        sidebar.style.display = "flex"
        main.style.display = "grid"
        startPage.style.display = "none"
    })
}

// Create project
const newProjectBtn = document.getElementById("new-project-btn");
    if (newProjectBtn) {
        // Esta función tiene dos argumentos
        // Un evento que tiene que "leer" y una función para realizar
        newProjectBtn.addEventListener("click", () =>
            showModal("new-project-modal")
        );
    } else {
        console.warn("New projects button was not found");
        // Podemos ver información por consola, para detectar errores
        console.log("New project btn value: ", newProjectBtn);
    }
// Form to create new project
const projectForm = document.getElementById("new-project-form") as HTMLFormElement;
if (projectForm && projectForm instanceof HTMLFormElement) {
    projectForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(projectForm);
        const projectData: IProject = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            status: formData.get("status") as ProjectStatus,
            userRole: formData.get("userRole") as UserRole,
            startDate: new Date(formData.get("startDate") as string),
            finishDate: new Date(formData.get("finishDate") as string),
        };
        try {
            const project = projectsManager.newProject(projectData);
            projectForm.reset();
            closeModal("new-project-modal");
        } catch (err) {
            const messageError: HTMLDialogElement = document.getElementById("popup-error") as HTMLDialogElement;
            const textError: HTMLParagraphElement = document.getElementById("text-error") as HTMLParagraphElement;
            textError.innerHTML = `${err}`
            showModal("popup-error")
            messageError.addEventListener('click', () => messageError.close());
        }
    });
} else {
    console.warn("The project form was not found. Check the ID!");
}
// Cancel button form create project
const cancelBtn = document.getElementById("cancel-project-btn")
cancelBtn?.addEventListener("click", () => {
    projectForm.reset();
    toggleModal("new-project-modal")
})

// Edit project
const editBtn = document.getElementById("edit-btn")
if (editBtn) {
    editBtn.addEventListener("click", () => {
        projectsManager.getDataEditPage()
        showModal("edit-project-modal")
    })
} else {
    console.warn("Edit projects button was not found");
    console.log("Edit project btn value: ", editBtn);
}

// Form to edit project
const editProjectForm = document.getElementById("edit-project-form") as HTMLFormElement;
if (editProjectForm && editProjectForm instanceof HTMLFormElement) {
    editProjectForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(editProjectForm);
        const editProjectData = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            status: formData.get("status") as ProjectStatus,
            userRole: formData.get("userRole") as UserRole,
            startDate: new Date(formData.get("startDate") as string),
            finishDate: new Date(formData.get("finishDate") as string),
            cost: formData.get("costProject") as string,
            progress: formData.get("progressProject") as string,
        };
        try {
            const project = projectsManager.editProject(editProjectData);
            editProjectForm.reset();
            closeModal("edit-project-modal");
        } catch (err) {
            const messageError: HTMLDialogElement = document.getElementById("popup-error") as HTMLDialogElement;
            const textError: HTMLParagraphElement = document.getElementById("text-error") as HTMLParagraphElement;
            textError.innerHTML = `${err}`
            showModal("popup-error")
            messageError.addEventListener('click', () => messageError.close());
        }
    });
} else {
    console.warn("The project form was not found. Check the ID!");
}
// Cancel button form edit project
const cancelEditBtn = document.getElementById("cancel-edit-btn")
cancelEditBtn?.addEventListener("click", () => {
    editProjectForm.reset();
    toggleModal("edit-project-modal")
})

// Delete project
const deleteBtn = document.getElementById("delete-edit-btn")
const confirmFormBtn = document.getElementById("accept-popup-btn")
const cancelFormBtn = document.getElementById("cancel-popup-btn")
deleteBtn?.addEventListener("click", () => {
    // console.log(projectsManager.ui)
    // console.log(projectsManager.list)
    const textError: HTMLParagraphElement = document.getElementById("text-choice") as HTMLParagraphElement;
    showModal("popup-choice")
    textError.innerText = "Are you sure you want to\ndelete the project?"
    confirmFormBtn?.addEventListener("click", () => {
        projectsManager.deleteProjectSelected()
        closeModal("popup-choice")
        closeModal("edit-project-modal")
        const projectsPage = document.getElementById("projects-page")
        const detailsPage = document.getElementById("project-details")
        if (!projectsPage || !detailsPage) {return}
        projectsPage.style.display = "flex"
        detailsPage.style.display = "none"
        // console.log(projectsManager.ui)
        // console.log(projectsManager.list)
    })
    cancelFormBtn?.addEventListener("click", () => {
        closeModal("popup-choice")
    })
})

// Create to-do
const toDoBtn = document.getElementById("todo-btn")
if (toDoBtn) {
    toDoBtn.addEventListener("click", () => {
        showModal("create-todo-modal")
    })
} else {
    console.warn("Create ToDo button was not found");
    console.log("Create ToDo btn value: ", toDoBtn);
}
// Form to create to-do
const createToDoForm = document.getElementById("create-todo-form") as HTMLFormElement;
if (createToDoForm && createToDoForm instanceof HTMLFormElement) {
    createToDoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(createToDoForm);
        const createToDoData: IToDo = {
            content: formData.get("content") as string,
            todoDate: new Date(formData.get("todoDate") as string),
            state: formData.get("state") as ToDoStates,
        };
        try {
            const toDo = projectsManager.newToDo(createToDoData) as ToDo;
            createToDoForm.reset();
            closeModal("create-todo-modal");
        } catch (err) {
            const messageError: HTMLDialogElement = document.getElementById("popup-error") as HTMLDialogElement;
            const textError: HTMLParagraphElement = document.getElementById("text-error") as HTMLParagraphElement;
            textError.innerHTML = `${err}`
            showModal("popup-error")
            messageError.addEventListener('click', () => messageError.close());
        }
    });
} else {
    console.warn("The create ToDo form was not found. Check the ID!");
}
// Cancel button form create to-do
const cancelCreateToDoBtn = document.getElementById("cancel-create-todo-btn")
cancelCreateToDoBtn?.addEventListener("click", () => {
    createToDoForm.reset();
    toggleModal("create-todo-modal")
})

// Edit ToDo
const toDoList = document.getElementById("todo-list") as HTMLDivElement
if(!toDoList){console.warn("ToDo List not found")}
toDoList.addEventListener('click', () => {
    projectsManager.getDataEditToDo()
    showModal("edit-todo-modal")
});

// Form to edit ToDo
const editToDoForm = document.getElementById("edit-todo-form") as HTMLFormElement;
if (editToDoForm && editToDoForm instanceof HTMLFormElement) {
    editToDoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(editToDoForm);
        const editToDoData = {
            content: formData.get("content") as string,
            todoDate: new Date(formData.get("todoDate") as string),
            state: formData.get("state") as ToDoStates,
        };
        try {
            const toDo = projectsManager.editToDo(editToDoData);
            editToDoForm.reset();
            closeModal("edit-todo-modal");
        } catch (err) {
            const messageError: HTMLDialogElement = document.getElementById("popup-error") as HTMLDialogElement;
            const textError: HTMLParagraphElement = document.getElementById("text-error") as HTMLParagraphElement;
            textError.innerHTML = `${err}`
            showModal("popup-error")
            messageError.addEventListener('click', () => messageError.close());
        }
    });
} else {
    console.warn("The ToDo form was not found. Check the ID!");
}
// Cancel button form edit ToDo
const cancelEditTodoBtn = document.getElementById("cancel-todo-btn")
cancelEditTodoBtn?.addEventListener("click", () => {
    editToDoForm.reset();
    toggleModal("edit-todo-modal")
})

// Delete ToDo
const deleteToDoBtn = document.getElementById("delete-todo-btn")
deleteToDoBtn?.addEventListener("click", () => {
    const textError: HTMLParagraphElement = document.getElementById("text-choice") as HTMLParagraphElement;
    showModal("popup-choice")
    textError.innerText = "Are you sure you want to\ndelete the ToDo?"
    confirmFormBtn?.addEventListener("click", () => {
        projectsManager.deleteToDoSelected()
        closeModal("popup-choice")
        closeModal("edit-todo-modal")
    })
    cancelFormBtn?.addEventListener("click", () => {
        closeModal("popup-choice")
    })
})

// Export project button
const exportProjectBtn = document.getElementById("export-projects-btn")
if (exportProjectBtn) {
    exportProjectBtn.addEventListener("click", () => {
        projectsManager.exportToJSON()
    })
}

// Import project button
const importProjectBtn = document.getElementById("import-projects-btn")
if (importProjectBtn) {
    importProjectBtn.addEventListener("click", () => {
        projectsManager.importFromJSON()
    })
}

// Popup error
const errorPopupBtn = document.getElementById("error-popup-btn")
errorPopupBtn?.addEventListener("click", () => {
    closeModal("popup-error")
})

// Dropdown menu
// selector
const menuHamb = document.querySelector('.hamburger') as HTMLElement;
const menuList = document.querySelector('.menuppal') as HTMLElement; 
// method
function toggleMenu (event) {
    this.classList.toggle('is-active');
    document.querySelector( ".menuppal" )?.classList.toggle("is_active")
    event.preventDefault();
}
// event
menuHamb.addEventListener('click', toggleMenu, false);

// Menu options 1, 2 and 3
const menuOp1 = document.getElementById("menu-op1") as HTMLElement
const menuOp2 = document.getElementById("menu-op2") as HTMLElement
const menuOp3 = document.getElementById("menu-op3") as HTMLElement
menuOp1.onclick = functionCreateProjects
function functionCreateProjects(event: Event){
    menuHamb.click()
    showModal("new-project-modal")
}
menuOp2.onclick = functionImportProjects
function functionImportProjects(event: Event){
    menuHamb.click()
    projectsManager.importFromJSON()
}
menuOp3.onclick = functionExportProjects
function functionExportProjects(event: Event){
    menuHamb.click()
    projectsManager.exportToJSON()
}
