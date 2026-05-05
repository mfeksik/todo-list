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
    }

    update() {
        const newDomNode = this.render();
        this._domNode.replaceWith(newDomNode);
        this._domNode = newDomNode;
        this.attachEvents();
    }

    onEvent(event) {
        const attrName = `data-${event.type}`;
        // Поднимаемся от event.target вверх по дереву, чтобы найти элемент с нужным data-атрибутом.
        let el = event.target;
        while (el && el !== this._domNode) {
            if (el.nodeType === 1) { // элемент
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

    onAddInputChange(event) {
        this.state.inputValue = event.target.value;
    }

    onAddTask(event) {
        if (this.state.inputValue.trim()) {
            const newTodo = {
                id: Date.now(),
                text: this.state.inputValue,
                completed: false
            };
            this.state.todos.push(newTodo);
            this.state.inputValue = "";
            this.update();
        }
    }

    render() {
        const todoItems = this.state.todos.map((todo) =>
            createElement("li", {}, [
                createElement("input", { type: "checkbox" }),
                createElement("label", {}, todo.text),
                createElement("button", {}, "🗑")
            ])
        );

        return createElement("div", { class: "todo-list" }, [
            createElement("h1", {}, "TODO List"),
            createElement("div", { class: "add-todo" }, [
                createElement("input", {
                    id: "new-todo",
                    type: "text",
                    placeholder: "Задание",
                }, null, {
                    input: "onAddInputChange"
                }),
                createElement("button", { id: "add-btn" }, "+", {
                    click: "onAddTask"
                }),
            ]),
            createElement("ul", { id: "todos" }, todoItems),
        ]);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const todoList = new TodoList();
    document.body.appendChild(todoList.getDomNode());
});
