import * as OBC from "openbim-components";
import * as THREE from "three";
import { TodoCard } from "./src/TodoCard";

type ToDoPriority = "Low" | "Normal" | "High";

interface Todo {
    description: string;
    date: Date;
    fragmentMap: OBC.FragmentIdMap;
    camera: {position: THREE.Vector3, target: THREE.Vector3};
    priority: ToDoPriority;
}

export class TodoCreator extends OBC.Component<Todo[]> implements OBC.UI {
    static uuid = "d6ecdc6d-94a9-4800-97f8-6886d415b8ef";
    enabled: true;
    uiElement = new OBC.UIElement<{
        activationButton: OBC.Button;
        todoList: OBC.FloatingWindow;
    }>();
    private _components: OBC.Components;
    private _list: Todo[] = [];

    constructor(components: OBC.Components) {
        super(components);
        this._components = components;
        components.tools.add(TodoCreator.uuid, this);
        this.setUI();
    }

    // Metod setup
    async setup() {
        const highlighter = await this._components.tools.get(OBC.FragmentHighlighter);
        highlighter.add(`${TodoCreator.uuid}-priority-Low`, [new THREE.MeshStandardMaterial({color: 0x59bc59})]);
        highlighter.add(`${TodoCreator.uuid}-priority-Normal`, [new THREE.MeshStandardMaterial({color: 0x597cff})]);
        highlighter.add(`${TodoCreator.uuid}-priority-High`, [new THREE.MeshStandardMaterial({color: 0xff7676})]);
    }

    // Metod for create new ToDo
    async addTodo(description: string, priority: ToDoPriority) {
        const camera = this._components.camera;
        if (!(camera instanceof OBC.OrthoPerspectiveCamera)) {
            throw new Error("TodoCreater needs the OrthoPerspectiveCamera in order to work.");
        }

        // Camera position and target
        const position = new THREE.Vector3()
        camera.controls.getPosition(position);
        const target = new THREE.Vector3()
        camera.controls.getTarget(target);
        const todoCamera = {position, target};
        
        const highlighter = await this._components.tools.get(OBC.FragmentHighlighter);
        const todo: Todo = {
            camera: todoCamera,
            description,
            date: new Date(),
            fragmentMap: highlighter.selection.select,
            priority
        };

        this._list.push(todo);

        // Add new ToDo to the list
        const todoCard = new TodoCard(this._components);
        todoCard.description = todo.description;
        todoCard.date = todo.date;
        todoCard.onCardClick.add(() => {
            camera.controls.setLookAt(
                todo.camera.position.x,
                todo.camera.position.y,
                todo.camera.position.z,
                todo.camera.target.x,
                todo.camera.target.y,
                todo.camera.target.z,
                true
            )
            const fragmentMapLength = Object.keys(todo.fragmentMap).length;
            if (fragmentMapLength === 0) {
                return;
            }
            highlighter.highlightByID('select', todo.fragmentMap)
        });
        const todoList = this.uiElement.get('todoList');
        todoList.addChild(todoCard);
    }

    private async setUI() {
        const activationButton = new OBC.Button(this._components);
        activationButton.materialIcon = "construction";

        // Nested menu ToDo
        const newTodoBtn = new OBC.Button(this._components, { name: 'Create' });
        activationButton.addChild(newTodoBtn);

        // Create modal form window
        const form = new OBC.Modal(this._components);
        this._components.ui.add(form);
        form.title = "Create New To-Do";
        newTodoBtn.onClick.add(() => form.visible = true);
        // Logic of the buttons in the form
        form.onCancel.add(() => form.visible = false);
        form.onAccept.add(() => {
            this.addTodo(descriptionInput.value, priorityDropdown.value as ToDoPriority);
            descriptionInput.value = "";
            form.visible = false;
        });

        // Create inputs in the form
        const descriptionInput = new OBC.TextArea(this._components);
        descriptionInput.label = "Description";
        form.slots.content.addChild(descriptionInput);
        
        // Create dropdown in the form
        const priorityDropdown = new OBC.Dropdown(this._components);
        priorityDropdown.label = "Priority";
        priorityDropdown.addOption("Low", "Normal", "High");
        priorityDropdown.value = "Normal";
        form.slots.content.addChild(priorityDropdown);
        
        // Styles for the input and label
        form.slots.content.get().style.padding = "20px";
        form.slots.content.get().style.display = "flex";
        form.slots.content.get().style.flexDirection = "column";
        form.slots.content.get().style.rowGap = "20px";
        
        const todoList = new OBC.FloatingWindow(this._components);
        this._components.ui.add(todoList);
        todoList.visible = false;
        todoList.title = "To-Do List";

        // Toolbar for the list
        const todoListToolbar = new OBC.SimpleUIComponent(this._components);
        todoList.addChild(todoListToolbar);

        const colorizeBtn = new OBC.Button(this._components);
        colorizeBtn.materialIcon = "format_color_fill";
        todoListToolbar.addChild(colorizeBtn);

        const highlighter = await this._components.tools.get(OBC.FragmentHighlighter);
        colorizeBtn.onClick.add(() => {
            colorizeBtn.active = !colorizeBtn.active;
            if (colorizeBtn.active) {
                for (const todo of this._list) {
                    const fragmentMapLength = Object.keys(todo.fragmentMap).length;
                    if (fragmentMapLength === 0) {
                        return;
                    }
                    highlighter.highlightByID(`${TodoCreator.uuid}-priority-${todo.priority}`, todo.fragmentMap)
                }
            } else {
                highlighter.clear(`${TodoCreator.uuid}-priority-Low`);
                highlighter.clear(`${TodoCreator.uuid}-priority-Normal`);
                highlighter.clear(`${TodoCreator.uuid}-priority-High`);
            }
        })

        // Nested menu List
        const todoListBtn = new OBC.Button(this._components, { name: 'List' });
        activationButton.addChild(todoListBtn);
        todoListBtn.onClick.add(() => todoList.visible = !todoList.visible)

        this.uiElement.set({ activationButton, todoList });
    }

    get(): Todo[] {
        return this._list;
    }
}
