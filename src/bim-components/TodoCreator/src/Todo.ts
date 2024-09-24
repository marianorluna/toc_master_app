import * as OBC from 'openbim-components';

export class Todo extends OBC.Component<null> {
    enabled = true;
    uiElement = new OBC.UIElement<{
        activationButton: OBC.Button
        todoList: OBC.FloatingWindow
    }>();
    private _components: OBC.Components;
    
    constructor(components: OBC.Components) {
        super(components);
        this._components = components;
        this.setUI();
    }

    private setUI(){
        const activationButton = new OBC.Button(this._components)
        activationButton.materialIcon = "note_add";

        const todoList = new OBC.FloatingWindow(this._components);
        this._components.ui.add(todoList);
        todoList.visible = false
        todoList.title = "Todo List";

        this.uiElement.set({
            activationButton,
            todoList
        });
    }

    get(): null {
        return null;
    }
    
}