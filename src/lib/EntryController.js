export default class EntryController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // explicit this binding
    this.model.bindEntryListChanged(this.onEntryListChanged);
    this.view.bindAddEntry(this.handleAddEntry);
    this.view.bindEditEntry(this.handleEditEntry);
    this.view.bindDeleteEntry(this.handleDeleteEntry);
    this.view.bindToggleEntry(this.handleToggleEntry);

    // display initial entries
    this.onEntryListChanged(this.model.entries);
  }

  onEntryListChanged = entries => {
    this.view.displayEntries(entries);
  }

  handleAddEntry = (data) => {
    this.model.addEntry(data);
  }

  handleEditEntry = (id, data) => {
    this.model.editEntry(id, data);
  }

  handleDeleteEntry = id => {
    this.model.deleteEntry(id);
  }

  handleToggleEntry = id => {
    this.model.toggleEntry(id);
  }
}
