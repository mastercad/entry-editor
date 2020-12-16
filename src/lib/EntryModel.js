export default class EntryModel {
 constructor() {
   this.entries = JSON.parse(localStorage.getItem('entries')) || [];
 }

 bindEntryListChanged(callback) {
   this.onEntryListChanged = callback;
 }

 _commit(entries) {
   this.onEntryListChanged(entries);
   localStorage.setItem('entries', JSON.stringify(entries));
 }

 addEntry(data) {
   let entry = {id: this.entries.length > 0 ? this.entries[this.entries.length - 1].id + 1 : 1,}
   for(let key in data) {
     entry[key] = data[key];
   };
   entry['complete'] = false;

  this.entries.push(entry);
  this._commit(this.entries);
 }

 editEntry(id, data) {
   this.entries.forEach(function(entry, index) {
      if (id === entry.id) {
        for(let key in data) {
          entry[key] = data[key];
        };
      }
   });
   this._commit(this.entries);
 }

 deleteEntry(id) {
   this.entries = this.entries.filter(entry => entry.id !== id);

   this._commit(this.entries);
 }

 toggleEntry(id) {
  this.entries.forEach(function(entry, index) {
     if (id === entry.id) {
       entry['complete'] = !entry['complete'];
     }
  });
  this._commit(this.entries);
 }
}
