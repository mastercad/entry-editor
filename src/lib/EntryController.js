import EntryModel from './EntryModel'
import EntryView from './EntryView'
import ValidationError from './ValidationError'

export default class EntryController {
  constructor (config) {
    this.validateConfig(config)

    this.model = new EntryModel(config.header, config.data)
    this.view = new EntryView(config || {})

    // explicit this binding
    this.model.bindEntryListChanged(this.onEntryListChanged)
    this.view.bindAddEntry(this.handleAddEntry)
    this.view.bindEditEntry(this.handleEditEntry)
    this.view.bindDeleteEntry(this.handleDeleteEntry)

    // display initial entries
    this.onEntryListChanged(this.model.entries)
  }

    /* istanbul ignore next */
    onEntryListChanged = (entries) => {
      this.view.displayEntries(entries)
    }

    /* istanbul ignore next */
    handleAddEntry = (data) => {
      this.model.addEntry(data)
    }

    /* istanbul ignore next */
    handleEditEntry = (id, data) => {
      this.model.editEntry(id, data)
    }

    /* istanbul ignore next */
    handleDeleteEntry = id => {
      this.model.deleteEntry(id)
    }

    validateConfig (config) {
      if (undefined === config) {
        throw new ValidationError('Config missing!')
      }
      if (undefined === config.header) {
        throw new ValidationError('No Header-Information set!')
      }
      this.validateHeader(config.header)
    }

    validateHeader (header) {
      for (const headerPos in header) {
        if (undefined === header[headerPos].name) {
          throw new ValidationError('Every Column need name field!')
        }
      }
    }
}
