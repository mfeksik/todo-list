function createElement(tag, attributes, children, events) {
    const element = document.createElement(tag);

    if (attributes) {
        Object.keys(attributes).forEach((key) => {
            element.setAttribute(key, attributes[key]);
        });
    }

    if (events) {
        Object.keys(events).forEach((eventName) => {
            const handlerName = events[eventName];
            element.setAttribute(`data-${eventName}`, handlerName);
        });
    }

    if (Array.isArray(children)) {
        children.forEach((child) => {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    } else if (typeof children === "string") {
        element.appendChild(document.createTextNode(children));
    } else if (children instanceof HTMLElement) {
        element.appendChild(children);
    }

    return element;
}

class Component {
    constructor() {
        this.onEvent = this.onEvent.bind(this);
    }

    getDomNode() {
        this._domNode = this.render();
        this.attachEvents();
        return this._domNode;
    }

    attachEvents() {
        this._domNode.addEventListener("input", this.onEvent);
        this._domNode.addEventListener("click", this.onEvent);
        this._domNode.addEventListener("change", this.onEvent);
    }

    update() {
        const newDomNode = this.render();
        this._domNode.replaceWith(newDomNode);
        this._domNode = newDomNode;
        this.attachEvents();
    }

    onEvent(event) {
        const attrName = `data-${event.type}`;
        let el = event.target;
        while (el && el !== this._domNode) {
            if (el.nodeType === 1) {
                const handlerName = el.getAttribute(attrName);
                if (handlerName && typeof this[handlerName] === 'function') {
                    this[handlerName](event);
                    return;
                }
            }
            el = el.parentNode;
        }
    }
}

class AddTask extends Component {
    constructor(onAdd) {
        super();
        this.onAdd = onAdd;
        this.state = { inputValue: "" };
    }

    onInputChange(event) {
        this.state.inputValue = event.target.value;
    }

    onAddTask(event) {
        const text = this.state.inputValue && this.state.inputValue.trim();
        if (text) {
            this.onAdd(text);
            this.state.inputValue = "";
            this.update();
        }
    }

    render() {
        return createElement("div", { class: "add-todo" }, [
            createElement("input", {
                id: "new-todo",
                type: "text",
                placeholder: "Задание",
                value: this.state.inputValue
            }, null, {
                input: "onInputChange"
            }),
            createElement("button", { id: "add-btn" }, "+", {
                click: "onAddTask"
            }),
        ]);
    }
}

class Task extends Component {
    constructor(todo, onToggle, onDelete) {
        super();
        this.todo = todo;
        this.onToggleCallback = onToggle;
        this.onDeleteCallback = onDelete;
        this.state = { };
    }

    onToggle(event) {
        const checked = event.target.checked !== undefined ? event.target.checked : !this.todo.completed;
        this.onToggleCallback(this.todo.id, !!checked);
    }

    onDelete(event) {
        this.onDeleteCallback(this.todo.id);
    }

    render() {
        return createElement("li", { 'data-id': this.todo.id }, [
            createElement("input", this.todo.completed ? { type: "checkbox", checked: "checked" } : { type: "checkbox" }, null, { change: "onToggle" }),
            createElement("label", this.todo.completed ? { style: "color: gray" } : {}, this.todo.text),
            createElement("button", {}, "🗑", { click: "onDelete" })
        ]);
    }
}


class TodoList extends Component {
    constructor() {
        super();
        this.state = {
            todos: [
                { id: 1, text: "Сделать домашку", completed: false },
                { id: 2, text: "Сделать практику", completed: false },
                { id: 3, text: "Пойти домой", completed: false },
            ],
            inputValue: ""
        };
    }

    addTask(text) {
        if (!text || !text.trim()) return;
        const newTodo = { id: Date.now(), text: text.trim(), completed: false };
        this.state.todos.push(newTodo);
        this.update();
    }

    toggleTodo(id, completed) {
        const todo = this.state.todos.find(t => t.id === id);
        if (!todo) return;
        todo.completed = !!completed;
        this.update();
    }

    deleteTodo(id) {
        this.state.todos = this.state.todos.filter(t => t.id !== id);
        this.update();
    }

    render() {
        const addComponent = new AddTask(this.addTask.bind(this));
        const addNode = addComponent.getDomNode();

        const taskNodes = this.state.todos.map(todo => {
            const taskComp = new Task(todo, this.toggleTodo.bind(this), this.deleteTodo.bind(this));
            return taskComp.getDomNode();
        });

        return createElement("div", { class: "todo-list" }, [
            createElement("h1", {}, "TODO List"),
            addNode,
            createElement("ul", { id: "todos" }, taskNodes),
        ]);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const todoList = new TodoList();
    document.body.appendChild(todoList.getDomNode());
});
