const showModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
        modal.showModal();
    } else {
        console.warn("The provided modal was not found. ID: ", id);
    }
};

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

const projectForm = document.getElementById("new-project-form");
if (projectForm) {
    projectForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(projectForm);
        const project = {
            name: formData.get("name"),
            description: formData.get("description"),
            status: formData.get("status"),
            userRole: formData.get("userRole"),
            finishDate: formData.get("finishDate"),
        };
        console.log(project);
    });
} else {
    console.warn("The project form was not found. Check the ID!");
}
