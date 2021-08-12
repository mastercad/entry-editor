import makeId from './makeId'

export default class EntryModel {
  constructor (header, data) {
    // user defined data from database
    this.header = []
    this.entries = []
    this.identifier = []
    this.ignoredKeysForMerge = []

    if (undefined !== header) {
      this.header = header
      this._consumeHeader(header)
    }

    if (undefined !== data) {
      this._consumeData(data)
    }

    // data from localStorage, most not successfully saved in backend
    if (undefined !== localStorage.getItem('entries')) {
      this._consumeLocalStorage()
    }
  }

  // consume header data and set needed information
  // maybe extract this logic to service to prepare the model information regarding
  // the current data
  _consumeHeader (header) {
    for (const headerPos in header) {
      const columnData = header[headerPos]
      for (const key in columnData) {
        if (key === 'identifier') {
          this.identifier.push(header[headerPos].name)
        }
      }
    }
  }

  // current this function only copy data from parameter to currentData, in the future it is possible here also
  // to maybe validate or adjust data or something else (but the better way for that should be the controller)
  _consumeData (data) {
    for (const rowPos in data) {
      const row = data[rowPos]
      for (const entryPos in row) {
        if (undefined === this.entries[rowPos]) {
          this.entries[rowPos] = {}
        }
        this.entries[rowPos][entryPos] = row[entryPos]
      }
      if (this.identifier.length === 0) {
        this.entries[rowPos].internalIdentifier = makeId(12)
      }
    }
  }

  _consumeLocalStorage () {
    const localStorageEntries = (localStorage.getItem('entries') !== null ? JSON.parse(localStorage.getItem('entries')) : {})
    if (undefined !== localStorageEntries.header) {
      const localHeaderHash = this._createHeaderHash(localStorageEntries.header)
      const headerHash = this._createHeaderHash(this.header)

      // ignore header data because header columns are changed
      if (headerHash &&
                localHeaderHash &&
                localHeaderHash !== headerHash
      ) {
        return
      }
      this._consumeHeaderFromLocalStorage(localStorageEntries.header)
    }

    if (undefined !== localStorageEntries.data) {
      this._consumeEntryDataFromLocalStorage(localStorageEntries.data)
    }
  }

  // i think here it should compare the current header with the stored header (signature for stored data structure)
  _consumeHeaderFromLocalStorage (headerData) {
    for (const localStorageEntryPos in headerData) {
      const headerEntry = headerData[localStorageEntryPos]
      this.header.push(headerEntry)
      if (undefined !== headerEntry.identifier) {
        this.identifier.push(headerEntry.name)
      }
    }
  }

  _consumeEntryDataFromLocalStorage (entryData) {
    for (const localStorageEntryPos in entryData) {
      const targetPos = this._searchIdentifier(this._createIdentifier(entryData[localStorageEntryPos]), this.entries)
      if (targetPos !== false) {
        this._mergeEntries(this.entries[targetPos], entryData[localStorageEntryPos])
      } else {
        if (undefined === entryData[localStorageEntryPos].internalIdentifier) {
          entryData[localStorageEntryPos].internalIdentifier = makeId(12)
        }
        this.entries.push(entryData[localStorageEntryPos])
      }
    }
  }

  _createHeaderHash (header) {
    const columns = []
    for (const headerPos in header) {
      columns.push(header[headerPos].name.toLowerCase())
    }
    return columns.join('_')
  }

  _mergeEntries (targetEntry, sourceEntry) {
    for (const sourceKey in sourceEntry) {
      if (this.ignoredKeysForMerge.includes(sourceKey) === false) {
        targetEntry[sourceKey] = sourceEntry[sourceKey]
      }
    }
    return targetEntry
  }

  _commit () {
    this.onEntryListChanged(this.entries)
    localStorage.setItem('entries', JSON.stringify({ header: this.header, data: this.entries }))
  }

  // check if the given identifier exists in given target collection
  _checkIdentifierExists (identifierKey, target) {
    if (undefined === identifierKey ||
            identifierKey.length === 0
    ) {
      return false
    }

    for (const targetPos in target) {
      if (identifierKey === target[targetPos].internalIdentifier) {
        return true
      }
      const targetIdentifier = this._createIdentifier(target[targetPos])
      if (targetIdentifier === identifierKey) {
        return true
      }
    }
    return false
  }

  _searchIdentifier (identifierKey, target) {
    if (undefined === identifierKey ||
            identifierKey.length === 0
    ) {
      return false
    }
    for (const targetPos in target) {
      if (identifierKey === target[targetPos].internalIdentifier) {
        return targetPos
      }
      const targetIdentifier = this._createIdentifier(target[targetPos])
      if (targetIdentifier === identifierKey) {
        return targetPos
      }
    }
    return false
  }

  // creates values key from given pos
  _createIdentifier (source) {
    let identifierKey = ''
    for (const key in this.identifier) {
      identifierKey = identifierKey + '_' + source[this.identifier[key]]
    }
    if (identifierKey.length === 0 &&
            undefined !== source.internalIdentifier
    ) {
      return source.internalIdentifier
    }
    return identifierKey
  }

  bindEntryListChanged (callback) {
    this.onEntryListChanged = callback
  }

  addEntry (data) {
    const entry = { id: this.entries.length > 0 && undefined !== this.entries[this.entries.length - 1].id ? parseInt(this.entries[this.entries.length - 1].id) + 1 : this.entries.length + 1 }
    for (const key in data) {
      entry[key] = data[key]
    };
    entry.internalIdentifier = makeId(12)

    this.entries.push(entry)
    this._commit()
  }

  editEntry (internalIdentifier, data) {
    this.entries.forEach(function (entry) {
      if (internalIdentifier === entry.internalIdentifier) {
        for (const key in data) {
          entry[key] = data[key]
        };
      }
    })
    this._commit()
  }

  deleteEntry (internalIdentifier) {
    this.entries = this.entries.filter(entry => entry.internalIdentifier !== internalIdentifier)
    this._commit()
  }
}
