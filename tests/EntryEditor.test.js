import { default as EntryController } from '../src/lib/EntryController';
import { default as EntryView } from '../src/lib/EntryView';
import { default as EntryModel } from '../src/lib/EntryModel';

import ValidationError from '../src/lib/ValidationError';

//jest.mock('../src/lib/EntryView');
//jest.mock('../src/lib/EntryModel');

// Integration Tests for Entry Editor
beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    /*
    EntryView.mockClear();

    EntryView.mockImplementation(() => {
        return {
            bindAddEntry: () => {
                console.log("BIND ADD ENTRY!!!!");
            },
            bindEditEntry: () => {
                console.log("BIND EDIT ENTRY!!!!");
            },
            bindDeleteEntry: () => {
                console.log("BIND DELETE ENTRY!!!!");
            },
            bindToggleEntry: () => {
                console.log("BIND TOGGLE ENTRY!!!!");
            },
            displayEntries: () => {
                console.log("DISPLAY ENTRIES!!!!");
            }
        }
    });

    EntryModel.mockClear();

    EntryModel.mockImplementation(() => {
        return {
            bindEntryListChanged: () => {
                console.log("BIND ENTRY LIST CHANGED!!!!");
            }
        }
    });
    */
    document.body.innerHTML = '<div id="root"></div>';
});

//const displayEntries = EntryView.mockName('displayEntries');
//const bindEntryListChanged = EntryModel.bindEntryListChanged.mockName('bindEntryListChanged');

describe("Test EntryEditor", () => {
    test("Test Controller reject work, if header definition is missing", () => {
        expect(() => { let controller = new EntryController(); }).toThrowError(new ValidationError('Config missing!'));
    });
    test("Test Controller reject work, if header definition is missing", () => {
        expect(() => { let controller = new EntryController({}); }).toThrowError(new ValidationError('No Header-Information set!'));
    });
    test("Test if the Controller initialized", () => {
        let controller = new EntryController({ header: [] });
        expect(controller).toBeInstanceOf(EntryController);
    });

    test("Test invalid config not accepted with one column", () => {
        let config = {
            header: [{}],
            data: [
                [
                    test
                ]
            ]
        }

        expect(() => { let controller = new EntryController(config); }).toThrowError(ValidationError, 'Every Column need name field!');
    });

    test("Test valid config accepted", () => {
        let config = {
            header: [{
                    name: "testName",
                    type: "text",
                    value: "test-name"
                },
                {
                    name: "password",
                    type: "password",
                    value: "test"
                }
            ],
            data: [
                [
                    "test-name1",
                    "test-password1"
                ],
                [
                    "test-name2",
                ]
            ]
        };
        const displayEntriesSyp = spyOn(EntryView.prototype, 'displayEntries');
        const bindAddEntrySpy = jest.spyOn(EntryView.prototype, 'bindAddEntry');
        const bindEditEntrySpy = jest.spyOn(EntryView.prototype, 'bindEditEntry');
        const bindEntryListChangedSpy = jest.spyOn(EntryModel.prototype, 'bindEntryListChanged');

        let controller = new EntryController(config);

        expect(displayEntriesSyp).toHaveBeenCalledTimes(1);
        expect(bindAddEntrySpy).toHaveBeenCalledTimes(1);
        expect(bindEditEntrySpy).toHaveBeenCalledTimes(1);
        expect(bindEntryListChangedSpy).toHaveBeenCalledTimes(1);
    });
});