import { default as makeId } from './makeId'

export default class EntryModel {
    constructor(header, data) {
        // user defined data from database
        this.header = [];
        this.entries = [];
        this.identifier = [];
        this.ignoredKeysForMerge = [];

        if (undefined !== header) {
            this.header = header;
            this._consumeHeader(header);
        }

        if (undefined !== data) {
            this._consumeData(data);
        }

        // data from localStorage, most not successfully saved in backend
        if (undefined !== localStorage.getItem('entries')) {
            this._consumeLocalStorage();
        }
    }

    // consume header data and set needed information
    // maybe extract this logic to service to prepare the model information regarding
    // the current data
    _consumeHeader(header) {
        for (let headerPos in header) {
            let columnData = header[headerPos];
            for (let key in columnData) {
                if ('identifier' === key) {
                    this.identifier.push(header[headerPos]["name"]);
                }
            }
        }
    }

    // current this function only copy data from parameter to currentData, in the future it is possible here also
    // to maybe validate or adjust data or something else (but the better way for that should be the controller)
    _consumeData(data) {
        for (let rowPos in data) {
            let row = data[rowPos];
            for (let entryPos in row) {
                if (undefined === this.entries[rowPos]) {
                    this.entries[rowPos] = {};
                }
                this.entries[rowPos][entryPos] = row[entryPos];
            }
            if (0 === this.identifier.length) {
                this.entries[rowPos]['internalIdentifier'] = makeId(12);
            }
        }
    }

    _consumeLocalStorage() {
        let localStorageEntries = (null !== localStorage.getItem('entries') ? JSON.parse(localStorage.getItem('entries')) : {});
        if (undefined !== localStorageEntries['header']) {
            let localHeaderHash = this._createHeaderHash(localStorageEntries['header']);
            let headerHash = this._createHeaderHash(this.header);

            // ignore header data because header columns are changed
            if (headerHash &&
                localHeaderHash &&
                localHeaderHash !== headerHash
            ) {
                return;
            }
            this._consumeHeaderFromLocalStorage(localStorageEntries['header']);
        }

        if (undefined !== localStorageEntries['data']) {
            this._consumeEntryDataFromLocalStorage(localStorageEntries['data']);
        }
    }

    // i think here it should compare the current header with the stored header (signature for stored data structure)
    _consumeHeaderFromLocalStorage(headerData) {
        for (let localStorageEntryPos in headerData) {
            let headerEntry = headerData[localStorageEntryPos];
            this.header.push(headerEntry);
            if (undefined !== headerEntry['identifier']) {
                this.identifier.push(headerEntry['name']);
            }
        }
    }

    _consumeEntryDataFromLocalStorage(entryData) {
        for (let localStorageEntryPos in entryData) {
            let targetPos = this._searchIdentifier(this._createIdentifier(entryData[localStorageEntryPos]), this.entries);
            if (false !== targetPos) {
                this._mergeEntries(this.entries[targetPos], entryData[localStorageEntryPos]);
            } else {
                if (undefined === entryData[localStorageEntryPos]["internalIdentifier"]) {
                    entryData[localStorageEntryPos]["internalIdentifier"] = makeId(12);
                }
                this.entries.push(entryData[localStorageEntryPos]);
            }
        }
    }

    _createHeaderHash(header) {
        let columns = [];
        for (let headerPos in header) {
            columns.push(header[headerPos]['name'].toLowerCase());
        }
        return columns.join('_');
    }

    _mergeEntries(targetEntry, sourceEntry) {
        for (let sourceKey in sourceEntry) {
            if (false === this.ignoredKeysForMerge.includes(sourceKey)) {
                targetEntry[sourceKey] = sourceEntry[sourceKey];
            }
        }
        return targetEntry;
    }

    _commit() {
        this.onEntryListChanged(this.entries);
        localStorage.setItem('entries', JSON.stringify({ header: this.header, data: this.entries }));
    }

    // check if the given identifier exists in given target collection
    _checkIdentifierExists(identifierKey, target) {
        if (undefined === identifierKey ||
            0 === identifierKey.length
        ) {
            return false;
        }

        for (let targetPos in target) {
            if (identifierKey === target[targetPos]["internalIdentifier"]) {
                return true;
            }
            let targetIdentifier = this._createIdentifier(target[targetPos]);
            if (targetIdentifier === identifierKey) {
                return true;
            }
        }
        return false;
    }

    _searchIdentifier(identifierKey, target) {
        if (undefined === identifierKey ||
            0 === identifierKey.length
        ) {
            return false;
        }
        for (let targetPos in target) {
            if (identifierKey === target[targetPos]["internalIdentifier"]) {
                return targetPos;
            }
            let targetIdentifier = this._createIdentifier(target[targetPos]);
            if (targetIdentifier === identifierKey) {
                return targetPos;
            }
        }
        return false;
    }

    // creates values key from given pos
    _createIdentifier(source) {
        let identifierKey = '';
        for (let key in this.identifier) {
            identifierKey = identifierKey + "_" + source[this.identifier[key]];
        }
        if (0 === identifierKey.length &&
            undefined !== source['internalIdentifier']
        ) {
            return source['internalIdentifier'];
        }
        return identifierKey;
    }

    bindEntryListChanged(callback) {
        this.onEntryListChanged = callback;
    }

    addEntry(data) {
        let entry = { id: this.entries.length > 0 && undefined !== this.entries[this.entries.length - 1].id ? parseInt(this.entries[this.entries.length - 1].id) + 1 : this.entries.length + 1 }
        for (let key in data) {
            entry[key] = data[key];
        };
        entry["internalIdentifier"] = makeId(12);

        this.entries.push(entry);
        this._commit();
    }

    editEntry(internalIdentifier, data) {
        this.entries.forEach(function(entry) {
            if (internalIdentifier === entry.internalIdentifier) {
                for (let key in data) {
                    entry[key] = data[key];
                };
            }
        });
        this._commit();
    }

    deleteEntry(internalIdentifier) {
        this.entries = this.entries.filter(entry => entry.internalIdentifier !== internalIdentifier);
        this._commit();
    }
}