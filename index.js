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

      onToggleTodo(event) {
        let el = event.target;
        while (el && el.nodeType !== 1) el = el.parentNode;
        if (!el) return;
        const container = el.closest && el.closest('[data-id]') ? el.closest('[data-id]') : null;
        const id = container ? Number(container.getAttribute('data-id')) : null;
        if (id == null) return;
        const todo = this.state.todos.find(t => t.id === id);
        if (!todo) return;
        const checked = event.target.checked !== undefined ? event.target.checked : !todo.completed;
        todo.completed = !!checked;
        this.update();
      }

      onDeleteTodo(event) {
        let el = event.target;
        while (el && el.nodeType !== 1) el = el.parentNode;
        if (!el) return;
        const container = el.closest && el.closest('[data-id]') ? el.closest('[data-id]') : null;
        const id = container ? Number(container.getAttribute('data-id')) : null;
        if (id == null) return;
        this.state.todos = this.state.todos.filter(t => t.id !== id);
        this.update();
      }

    render() {
            const todoItems = this.state.todos.map((todo) =>
              createElement("li", { 'data-id': todo.id }, [
                createElement("input", todo.completed ? { type: "checkbox", checked: "checked" } : { type: "checkbox" }, null, { change: "onToggleTodo" }),
                createElement("label", todo.completed ? { style: "color: gray" } : {}, todo.text),
                createElement("button", {}, "🗑️", { click: "onDeleteTodo" })
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
