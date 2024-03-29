import ValidationError from './ValidationError'

export default class EntryView {
    constructor(config) {
        this.config = config
        this.app = null

        if (config &&
            undefined !== config.selector
        ) {
            this.app = this.getElement(config.selector)
        } else {
            this.app = this.getElement('#root')
        }

        if (!(this.app instanceof HTMLDivElement)) {
            throw new ValidationError('Root Element not found!')
        }

        this.form = this.createElement('form')
        this.inputs = []
        this.ignoredEntryNames = [
            'id',
            'internalIdentifier'
        ]

        if (undefined === config ||
            undefined === config.header
        ) {
            throw new ValidationError('No Header-Information set!')
        }

        this.header = config.header

        const inputRow = this.createInputRow(config.header)

        this.form.append(inputRow)

        this.submitButton = this.createElement('button')
        this.submitButton.textContent = 'Submit'
        this.form.append(
            this.submitButton
        )
        this.title = this.createElement('h1')
        this.title.textContent = undefined !== config.title ? config.title : 'Entries'
        this.entryList = this.createElement('ul', 'entry-editor-list')
        this.app.append(this.title, this.form, this.entryList)

        this._temporaryData = {}

        this._initLocalListeners()
    }

    _resetInput() {
        this.inputs.forEach(function(input) {
            input.value = ''
        })
    }

    createEntryList(data) {
        for (const dataPos in data) {
            this.form.append(this.createEntryRow(data[dataPos]))
        };
    }

    createEntryRow(rowData) {
        let inputCount = 0
        const wrapper = this.createWrapper()
        for (const entryPos in rowData) {
            const input = this.createEntry(entryPos, rowData[entryPos])
            wrapper.append(input)
            this.inputs[inputCount] = input
                ++inputCount
        }

        return wrapper
    }

    createEntry(headerPos, data) {
        let entry = this.createElement('span')
        const headerColumn = this.config.header[headerPos]
        entry.classList.add('entry-editor-item')

        for (const key in headerColumn) {
            if (key === 'class') {
                entry = this._extendElementWithClass(entry, headerColumn[key])
            } else if (key === 'style') {
                entry = this._extendElementWithStyle(entry, headerColumn[key])
            } else if (key === 'attributes') {
                entry = this._extendElementWithAttributes(entry, headerColumn[key])
            } else {
                entry[key] = headerColumn[key]
            }
        }

        entry.textContent = data

        return entry
    }

    createInputRow(rowData) {
        let inputCount = 0
        const wrapper = this.createWrapper()
        wrapper.classList.add('entry-editor-input-row')

        for (const entryPos in rowData) {
            const input = this.createInput(entryPos)
            wrapper.append(input)
            this.inputs[inputCount] = input
                ++inputCount
        }

        return wrapper
    }

    createWrapper() {
        const wrapper = this.createElement('div')
        wrapper.classList.add('entry-editor-row')

        return wrapper
    }

    createInput(headerPos) {
        let input = this.createElement('input')
        const headerColumn = this.config.header[headerPos]
        input.classList.add('entry-editor-item')

        for (const key in headerColumn) {
            if (key === 'class') {
                input = this._extendElementWithClass(input, headerColumn[key])
            } else if (key === 'style') {
                input = this._extendElementWithStyle(input, headerColumn[key])
            } else if (key === 'attributes') {
                input = this._extendElementWithAttributes(input, headerColumn[key])
            } else {
                input[key] = headerColumn[key]
            }
        }

        return input
    }

    _extendElementWithClass(element, classString) {
        const classParts = classString.split(' ')
        for (const classPart in classParts) {
            element.classList.add(classPart)
        }

        return element
    }

    _extendElementWithAttributes(element, attributes) {
        attributes.forEach(attributeData => {
            const attributeName = Object.keys(attributeData)[0]
            const attribute = document.createAttribute(attributeName)
            attribute.value = attributeData[attributeName]
            element.attributes.setNamedItem(attribute)
        })

        return element
    }

    // @TODO HERE IMPLEMENT A POSSIBILITY TO MERGE EXISTING ATTRIBUTES WITH USER SETTINGS
    _extendElementWithStyle(element, style) {
        const attribute = document.createAttribute('style')
        attribute.value = style
        element.attributes.setNamedItem(attribute)

        return element
    }

    createElement(tag, className) {
        const element = document.createElement(tag)

        if (className) element.classList.add(className)

        return element
    }

    getElement(selector) {
        const element = document.querySelector(selector)

        return element
    }

    displayEntries(entriesCollection) {
        // delete all nodes
        while (this.entryList.firstChild) {
            this.entryList.removeChild(this.entryList.firstChild)
        }

        if (entriesCollection.length === 0) {
            const pElement = this.createElement('p')
            pElement.textContent = 'No entry found, create one!'
            this.entryList.append(pElement)
        } else {
            for (const entriesPos in entriesCollection) {
                const entryRow = entriesCollection[entriesPos]
                const li = this.createElement('li', 'entry-editor-row')
                    //        li.id = entry.internalIdentifier;

                for (const headerPos in this.header) {
                    const span = this.createElement('span', 'entry-editor-item')
                    const headerEntry = this.header[headerPos]
                    const columnName = this.header[headerPos].name

                    if (this.ignoredEntryNames.includes(columnName)) {
                        continue
                    }

                    span.contentEditable = true
                    span.classList.add('editable')
                    span.id = columnName

                    if (undefined !== entryRow[columnName]) {
                        span.textContent = entryRow[columnName]
                            //            span.id = entryRow[columnName]['internalIdentifier'];
                    }

                    for (const key in headerEntry) {
                        if (key === 'attributes' ||
                            key === 'style' ||
                            key === 'class'
                        ) {
                            continue
                        }
                        span[key] = headerEntry[key]
                    }
                    if (undefined !== headerEntry.attributes) {
                        this._extendElementWithAttributes(span, headerEntry.attributes)
                    }

                    if (undefined !== headerEntry.class) {
                        this._extendElementWithClass(span, headerEntry.class)
                    }

                    if (undefined !== headerEntry.style) {
                        this._extendElementWithStyle(span, headerEntry.style)
                    }
                    li.append(span)
                }

                const deleteButton = this.createElement('button', 'delete')
                deleteButton.textContent = 'Delete'
                li.append(deleteButton)

                this.entryList.append(li)
            }
        }
    }

    /* istanbul ignore next */
    _initLocalListeners() {
        this.entryList.addEventListener('input', event => {
            console.log(event)
            if (event.target.name === 'name' &&
                event.target.className === 'editable'
            ) {
                this._temporaryEntryName = event.target.innerText
            } else if (event.target.name === 'password' &&
                event.target.className === 'editable'
            ) {
                this._temporaryEntryPassword = event.target.innerText
            } else if (event.target.name === 'email' &&
                event.target.className === 'editable'
            ) {
                this._temporaryEntryEmail = event.target.innerText
            } else if (event.target.name === 'role' &&
                event.target.className === 'editable'
            ) {
                this._temporaryEntryRole = event.target.innerText
            }
        })
    }

    /* istanbul ignore next */
    bindAddEntry(handler) {
        this.form.addEventListener('submit', event => {
            event.preventDefault()

            const configItems = this.config.items
            const values = {}
            this.inputs.forEach(function(input, index) {
                if (input.value) {
                    values[configItems[index].name] = input.value
                }
            })

            if (Object.keys(values).length) {
                handler(values)
                this._resetInput()
            }
        })
    }

    /* istanbul ignore next */
    bindDeleteEntry(handler) {
        this.entryList.addEventListener('click', event => {
            if (event.target.className === 'delete') {
                const id = parseInt(event.target.parentElement.id)

                handler(id)
            }
        })
    }

    /* istanbul ignore next */
    bindEditEntry(handler) {
        this.entryList.addEventListener('focusout', event => {
            if (Object.keys(this._temporaryData).length) {
                const id = parseInt(event.target.parentElement.id)

                handler(id, this._temporaryData)

                this._temporaryData = {}
            } else {
                // Reset complete row (maybe here we can also show validation information)
            }
        })
    }
}