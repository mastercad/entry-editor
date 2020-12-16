import EntryEditor from '../dist/EntryEditor.js'

describe("Test EntryModel are the expected Instance", () => {
    test("Test if the Model initialized", () => {
        expect(new EntryEditor.EntryModel).toBeInstanceOf(EntryModel);
    });
})
