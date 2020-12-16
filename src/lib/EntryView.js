export default class EntryView {
  constructor(viewConfig) {
    this.viewConfig = viewConfig;
    this.app = this.getElement('#root');
    this.form = this.createElement('form')
    this.inputs = [];
    this.ignoredEntryNames = [
      'id',
      'complete'
    ];

    let inputCount = 0;
    for (let configEntryPos in viewConfig.items) {
      this.inputs[inputCount] = this.createElement('input');
      this.inputs[inputCount].type = viewConfig.items[configEntryPos].type;
      this.inputs[inputCount].placeholder = viewConfig.items[configEntryPos].placeholder;
      this.inputs[inputCount].name = viewConfig.items[configEntryPos].name;

      // @TODO HERE IMPLEMENT A POSSIBILITY TO MERGE EXISTING ATTRIBUTES WITH USER SETTINGS
      if (viewConfig.items[configEntryPos].attributes) {
        viewConfig.items[configEntryPos].attributes.forEach(attributeData => {
          let attributeName = Object.keys(attributeData)[0];
          this.inputs[inputCount].setAttribute(attributeName, attributeData[attributeName]);
        });
      }
      this.form.append(this.inputs[inputCount]);
      ++inputCount;
    };

    this.submitButton = this.createElement('button')
    this.submitButton.textContent = 'Submit'
    this.form.append(
      this.submitButton
    );
    this.title = this.createElement('h1')
    this.title.textContent = 'Entries'
    this.entryList = this.createElement('ul', 'entry-list')
    this.app.append(this.title, this.form, this.entryList)

    this._temporaryData = {};

    this._initLocalListeners()
  }

  _resetInput() {
    this.inputs.forEach(function(input) {
      input.value = '';
    });
  }

  createElement(tag, className) {
    const element = document.createElement(tag);

    if (className) element.classList.add(className);

    return element;
  }

  getElement(selector) {
    const element = document.querySelector(selector);

    return element;
  }

  displayEntries(entries) {
    // delete all nodes
    while (this.entryList.firstChild) {
      this.entryList.removeChild(this.entryList.firstChild);
    }

    if (0 === entries.length) {
      const pElement = this.createElement('p');
      pElement.textContent = 'No entry found, create one!';
      this.entryList.append(pElement);
    } else {
      entries.forEach(entry => {
      const li = this.createElement('li');
      li.id = entry.id;

      const checkbox = this.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = entry.complete

      li.append(checkbox);

      for (let key in entry) {
        if (this.ignoredEntryNames.includes(key)) {
          continue;
        }
        let span = this.createElement('span');
        span.contentEditable = true;
        span.name=key;
        span.classList.add('editable');

        if (entry.complete) {
          let strike = this.createElement('s');
          strike.textContent = entry[key];
          span.append(strike);
        } else {
          span.textContent = entry[key];
        }
        li.append(span);
      }

      const deleteButton = this.createElement('button', 'delete');
      deleteButton.textContent = 'Delete';
      li.append(deleteButton);

      this.entryList.append(li);
      });

      // only debugging
      console.log(entries);
    }
  }

  _initLocalListeners() {
    this.entryList.addEventListener('input', event => {
      console.log(event);
      if ('name' === event.target.name
        && 'editable' === event.target.className
      ) {
        this._temporaryEntryName = event.target.innerText;
      } else if ('password' === event.target.name
        && 'editable' === event.target.className
      ) {
        this._temporaryEntryPassword = event.target.innerText;
      } else if ('email' === event.target.name
        && 'editable' === event.target.className
      ) {
        this._temporaryEntryEmail = event.target.innerText;
      } else if ('role' === event.target.name
        && 'editable' === event.target.className
      ) {
        this._temporaryEntryRole = event.target.innerText;
      }
    })
  }

  bindAddEntry(handler) {
    this.form.addEventListener('submit', event => {
      event.preventDefault();

      let viewConfigItems = this.viewConfig.items;
      let values = {};
      this.inputs.forEach(function(input, index) {
        if (input.value) {
          values[viewConfigItems[index].name] = input.value;
        }
      });

      if (Object.keys(values).length) {
        handler(values);
        this._resetInput();
      }
    });
  }

  bindDeleteEntry(handler) {
    this.entryList.addEventListener('click', event => {
      if ('delete' === event.target.className) {
      const id = parseInt(event.target.parentElement.id);

      handler(id);
      }
    });
  }

  bindEditEntry(handler) {
    this.entryList.addEventListener('focusout', event => {
      if (Object.keys(this._temporaryData).length) {
        const id = parseInt(event.target.parentElement.id);

        handler(id, this._temporaryData);

        this._temporaryData = {};
      } else {
      // Reset complete row (maybe here we can also show validation information)
      }
    });
  }

  bindToggleEntry(handler) {
    this.entryList.addEventListener('change', event => {
      if ('checkbox' === event.target.type) {
      const id = parseInt(event.target.parentElement.id);

      handler(id);
      }
    });
  }
}
