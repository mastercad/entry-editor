jest.mock('../src/lib/makeId');

import { default as makeId } from '../src/lib/makeId';
import { default as EntryModel } from '../src/lib/EntryModel';

makeId.mockReturnValue("12345abcde");

afterEach(() => {
    makeId.mockClear();
});

describe("Test EntryModel", () => {
    test("Test if the Model initialized", () => {
        expect(new EntryModel()).toBeInstanceOf(EntryModel);
    });

    test("Test localStorage is used during instantiating without user defined data", () => {
        let config = {
            header: [{
                    name: "name",
                    type: "text",
                    value: "test-name"
                },
                {
                    name: "password",
                    type: "password",
                    value: "test"
                }
            ],
            data: [{
                    name: "test-name1",
                    password: "test-password1"
                },
                {
                    name: "test-name2",
                }
            ]
        };

        localStorage.setItem('entries', JSON.stringify(config));
        let model = new EntryModel();
        expect(model.header).toEqual(config.header);
        let result = [];
        for (let entryPos in model.entries) {
            let newEntry = {};
            for (let key in model.entries[entryPos]) {
                if ("internalIdentifier" != key) {
                    newEntry[key] = model.entries[entryPos][key];
                }
            }
            result[entryPos] = newEntry;
        }
        expect(result).toEqual(config.data);
        localStorage.clear();
    });

    test("Test consumeHeader function works without identifiers", () => {
        let headerData = [{
                name: "testName"
            },
            {
                name: "testPassword"
            }
        ];
        let model = new EntryModel(headerData);
        expect(model.header).toEqual(headerData);
        expect(model.identifier).toEqual([]);
    });

    test("Test consumerHeader works with single identifier", () => {
        let headerData = [{
                name: "testName",
                identifier: true
            },
            {
                name: "testPassword"
            }
        ];

        let model = new EntryModel(headerData);
        expect(model.header).toEqual(headerData);
        expect(model.identifier).toEqual(["testName"]);
    });

    test("Test consumerHeader works with multiple identifier", () => {
        let headerData = [{
                name: "testName",
                identifier: true
            },
            {
                name: "testPassword"
            },
            {
                name: "id",
                identifier: true
            }
        ];

        let model = new EntryModel(headerData);
        expect(model.header).toEqual(headerData);
        expect(model.identifier).toEqual(["testName", "id"]);
    });

    test("Test there is no problem without defined identifier", () => {
        let model = new EntryModel();
        let source = { name: "test", id: 1, content: "testContent" };
        expect(model._createIdentifier(source)).toEqual('');
    });

    test("Test there is no problem without defined identifier and internal identifier set", () => {
        let model = new EntryModel();
        let source = { name: "test", id: 1, content: "testContent", internalIdentifier: "12345abcde" };
        expect(model._createIdentifier(source)).toEqual('12345abcde');
    });

    test("Test identifier build with simple primary", () => {
        let model = new EntryModel();
        model.identifier = ["name"];
        let source = { name: "test", id: 1, content: "testContent" };
        expect(model._createIdentifier(source)).toEqual('_test');
    });

    test("Test identifier build with multiple primary", () => {
        let model = new EntryModel();
        model.identifier = ["name", "content"];
        let source = { name: "test", id: 1, content: "testContent" };
        expect(model._createIdentifier(source)).toEqual('_test_testContent');
    });

    test("Test createIdentifier with prio on header identifier", () => {
        let model = new EntryModel();
        model.identifier = ["name", "content"];
        let source = { name: "test", id: 1, content: "testContent", internalIdentifier: "12345abcde" };
        expect(model._createIdentifier(source)).toEqual('_test_testContent');
    });

    test("Test consumeData copies the given collection like expected", () => {
        let model = new EntryModel();
        let data = [{ name: "test", id: 1, content: "testContent" }];
        let referenceData = [{ name: "test", id: 1, content: "testContent", internalIdentifier: "12345abcde" }];

        model._consumeData(data);

        expect(model.entries).toEqual(referenceData);
    });

    test("Test consumeData copies creates identifier", () => {
        let model = new EntryModel();

        let data = [{ name: "test", id: 1, content: "testContent" }];
        let referenceData = [{ name: "test", id: 1, content: "testContent", internalIdentifier: "12345abcde" }];

        model._consumeData(data);

        expect(model.entries).toEqual(referenceData);
    });

    test("Test if existing identifier found", () => {
        let model = new EntryModel();
        model.identifier = ["name"];
        let target = [{ name: "test", id: 1, content: "testContent" }];
        expect(model._checkIdentifierExists("_test", target)).toBeTruthy();
    });

    test("Test if internal identifier found", () => {
        let model = new EntryModel();
        model.identifier = ["name"];
        let target = [{ name: "test", id: 1, content: "testContent", internalIdentifier: "12345abcde" }];
        expect(model._checkIdentifierExists("12345abcde", target)).toBeTruthy();
    });

    test("Test if not existing identifier not found", () => {
        let model = new EntryModel();
        model.identifier = ["name"];
        let target = [{ name: "test", id: 1, content: "testContent" }];
        expect(model._checkIdentifierExists("_test1", target)).toBeFalsy();
    });

    test("Test checkIdentifierExists exits if no identifier is passed", () => {
        let model = new EntryModel();
        expect(model._checkIdentifierExists()).toBeFalsy();
    });

    test("Test existing entry edited", () => {
        let model = new EntryModel;
        const commitMock = jest.fn();
        model._commit = commitMock;
        model.entries = [
            { id: 1, name: "testName1", content: "testContent1", another: "absd", internalIdentifier: "_internal_identifier_1" },
            { id: 2, name: "testName2", content: "testContent2", another: "asdasd", internalIdentifier: "_internal_identifier_2" },
            { id: 3, name: "testName3", content: "testContent3", another: "sd23", internalIdentifier: "_internal_identifier_3" },
            { id: 4, name: "testName4", content: "testContent4", another: "asdgfn", internalIdentifier: "_internal_identifier_4" }
        ];

        let newEntry = { id: 3, name: "testName", content: "testContent" };
        model.editEntry("_internal_identifier_3", newEntry);

        let referenceEntries = [
            { id: 1, name: "testName1", content: "testContent1", another: "absd", internalIdentifier: "_internal_identifier_1" },
            { id: 2, name: "testName2", content: "testContent2", another: "asdasd", internalIdentifier: "_internal_identifier_2" },
            { id: 3, name: "testName", content: "testContent", another: "sd23", internalIdentifier: "_internal_identifier_3" },
            { id: 4, name: "testName4", content: "testContent4", another: "asdgfn", internalIdentifier: "_internal_identifier_4" }
        ];

        expect(commitMock).toHaveBeenCalledTimes(1);
        expect(model.entries.length).toEqual(4);
        expect(model.entries).toEqual(referenceEntries);
    });

    test("Test not existing entry edited", () => {
        let model = new EntryModel;
        const commitMock = jest.fn();
        model._commit = commitMock;
        model.entries = [
            { id: 1, name: "testName1", content: "testContent1", another: "absd" },
            { id: 2, name: "testName2", content: "testContent2", another: "asdasd" },
            { id: 3, name: "testName3", content: "testContent3", another: "sd23" },
            { id: 4, name: "testName4", content: "testContent4", another: "asdgfn" }
        ];

        let newEntry = { id: 5, name: "testName5", content: "testContent5" };
        model.editEntry(5, newEntry);

        let referenceEntries = [
            { id: 1, name: "testName1", content: "testContent1", another: "absd" },
            { id: 2, name: "testName2", content: "testContent2", another: "asdasd" },
            { id: 3, name: "testName3", content: "testContent3", another: "sd23" },
            { id: 4, name: "testName4", content: "testContent4", another: "asdgfn" }
        ];

        expect(commitMock).toHaveBeenCalledTimes(1);
        expect(model.entries.length).toEqual(4);
        expect(model.entries).toEqual(referenceEntries);
    });

    test("Test delete existing entry", () => {
        let model = new EntryModel;
        const commitMock = jest.fn();

        model._commit = commitMock;
        model.entries = [
            { id: 1, name: "testName1", content: "testContent1", another: "absd", internalIdentifier: "_internal_identifier_1" },
            { id: 2, name: "testName2", content: "testContent2", another: "asdasd", internalIdentifier: "_internal_identifier_2" },
            { id: 3, name: "testName3", content: "testContent3", another: "sd23", internalIdentifier: "_internal_identifier_3" },
            { id: 4, name: "testName4", content: "testContent4", another: "asdgfn", internalIdentifier: "_internal_identifier_4" }
        ];

        model.deleteEntry("_internal_identifier_3");

        let referenceEntries = [
            { id: 1, name: "testName1", content: "testContent1", another: "absd", internalIdentifier: "_internal_identifier_1" },
            { id: 2, name: "testName2", content: "testContent2", another: "asdasd", internalIdentifier: "_internal_identifier_2" },
            { id: 4, name: "testName4", content: "testContent4", another: "asdgfn", internalIdentifier: "_internal_identifier_4" }
        ];

        expect(model.entries.length).toEqual(3);
        expect(model.entries).toEqual(referenceEntries);
        expect(commitMock).toHaveBeenCalledTimes(1);
    });

    test("Test delete existing entry", () => {
        let model = new EntryModel;
        const commitMock = jest.fn();
        model._commit = commitMock;
        model.entries = [
            { id: 1, name: "testName1", content: "testContent1", another: "absd" },
            { id: 2, name: "testName2", content: "testContent2", another: "asdasd" },
            { id: 3, name: "testName3", content: "testContent3", another: "sd23" },
            { id: 4, name: "testName4", content: "testContent4", another: "asdgfn" }
        ];

        model.deleteEntry(6);

        let referenceEntries = [
            { id: 1, name: "testName1", content: "testContent1", another: "absd" },
            { id: 2, name: "testName2", content: "testContent2", another: "asdasd" },
            { id: 3, name: "testName3", content: "testContent3", another: "sd23" },
            { id: 4, name: "testName4", content: "testContent4", another: "asdgfn" }
        ];
        expect(model.entries.length).toEqual(4);
        expect(model.entries).toEqual(referenceEntries);
        expect(commitMock).toHaveBeenCalledTimes(1);
    });

    test("Test merge entries with existing doubles", () => {
        let model = new EntryModel;
        let targetEntry = {
            name: "targetTestName",
            id: "targetId"
        };

        let sourceEntry = {
            name: "sourceTestName",
            content: "sourceContent"
        };

        let referenceEntry = {
            name: "sourceTestName",
            id: "targetId",
            content: "sourceContent"
        };

        let resultEntry = model._mergeEntries(targetEntry, sourceEntry);

        expect(resultEntry).toEqual(referenceEntry);
    });

    test("Test merge entries without existing doubles", () => {
        let model = new EntryModel;
        let targetEntry = {
            name: "targetTestName",
            id: "targetId"
        };

        let sourceEntry = {
            content: "sourceContent"
        };

        let referenceEntry = {
            name: "targetTestName",
            id: "targetId",
            content: "sourceContent"
        };

        let resultEntry = model._mergeEntries(targetEntry, sourceEntry);

        expect(resultEntry).toEqual(referenceEntry);
    });

    test("Test merge entries with ignored items", () => {
        let model = new EntryModel;
        model.ignoredKeysForMerge = ['id'];

        let targetEntry = {
            name: "targetTestName",
            id: "targetId"
        };

        let sourceEntry = {
            name: "sourceTestName",
            id: "sourceId",
            content: "sourceContent"
        };

        let referenceEntry = {
            name: "sourceTestName",
            id: "targetId",
            content: "sourceContent"
        };

        let resultEntry = model._mergeEntries(targetEntry, sourceEntry);

        expect(resultEntry).toEqual(referenceEntry);
    });

    test("Test search existing entry in collection", () => {
        let model = new EntryModel;
        model.identifier = ["name", "id"];
        let target = [{
                name: "testName",
                id: 1
            },
            {
                name: "testName1",
                id: "testId"
            },
            {
                name: "testName2",
                id: "testId"
            }
        ];

        let result = model._searchIdentifier('_testName1_testId', target);
        expect(result).toEqual("1");
    });

    test("Test search existing entry in collection", () => {
        let model = new EntryModel;
        model.identifier = ["name", "id"];
        let target = [{
                name: "testName",
                id: 1
            },
            {
                name: "testName1",
                id: "testId"
            },
            {
                name: "testName2",
                id: "testId",
                internalIdentifier: "12345abcde"
            }
        ];

        let result = model._searchIdentifier("12345abcde", target);
        expect(result).toEqual("2");
    });

    test("Test search not existing entry in collection", () => {
        let model = new EntryModel;
        model.identifier = ["name", "id"];
        let identifier = '_testName_testId';
        let target = [{
                name: "testName",
                id: 1
            },
            {
                name: "testName1",
                id: "testId"
            },
            {
                name: "testName2",
                id: "testId"
            }
        ];

        let result = model._searchIdentifier(identifier, target);
        expect(result).toBeFalsy();
    });

    test("Test multiple commit without user-defined data works without doubled header", () => {
        let entryListChangedMock = jest.fn();
        let model = new EntryModel;

        model.bindEntryListChanged(entryListChangedMock);
        model.header = [{
                name: "id"
            },
            {
                name: "name"
            },
            {
                name: "content"
            },
            {
                name: "another"
            }
        ];
        model.entries = [
            { id: 1, name: "testName1", content: "testContent1", another: "absd", internalIdentifier: "_internal_identifier_1" },
            { id: 2, name: "testName2", content: "testContent2", another: "asdasd", internalIdentifier: "_internal_identifier_2" },
            { id: 3, name: "testName3", content: "testContent3", another: "sd23", internalIdentifier: "_internal_identifier_3" },
            { id: 4, name: "testName4", content: "testContent4", another: "asdgfn", internalIdentifier: "_internal_identifier_4" }
        ];

        let referenceLocalStorage = {
            header: [{
                    name: "id"
                },
                {
                    name: "name"
                },
                {
                    name: "content"
                },
                {
                    name: "another"
                }
            ],
            data: [
                { id: 1, name: "testName1", content: "testContent1", another: "absd", internalIdentifier: "_internal_identifier_1" },
                { id: 2, name: "testName2", content: "testContent2", another: "asdasd", internalIdentifier: "_internal_identifier_2" },
                { id: 3, name: "testName3", content: "testContent3", another: "sd23", internalIdentifier: "_internal_identifier_3" },
                { id: 4, name: "testName4", content: "testContent4", another: "asdgfn", internalIdentifier: "_internal_identifier_4" }
            ]
        };

        // force double commit to check the data are not doubled, unregardless how often the data are commited
        model._commit();
        model._commit();

        expect(entryListChangedMock).toHaveBeenCalledTimes(2);
        expect(JSON.parse(localStorage.getItem('entries'))).toEqual(referenceLocalStorage);
    });

    test("Test multiple commit with user-defined data works without doubled header", () => {
        let localStorageContent = {
            header: [],
            data: [
                { id: 1, name: "testName1", content: "testContent1", another: "absd", internalIdentifier: "_internal_identifier_1" },
                { id: 2, name: "testName2", content: "testContent2", another: "asdasd", internalIdentifier: "_internal_identifier_2" },
                { id: 3, name: "testName3", content: "testContent3", another: "sd23", internalIdentifier: "_internal_identifier_3" },
                { id: 4, name: "testName4", content: "testContent4", another: "asdgfn", internalIdentifier: "_internal_identifier_4" }
            ]
        };
        localStorage.setItem('entries', JSON.stringify(localStorageContent));
        let config = {
            header: [{
                    name: "id"
                },
                {
                    name: "name"
                },
                {
                    name: "content"
                },
                {
                    name: "another"
                }
            ],
            data: [{
                id: 5,
                name: "testName5",
                content: "testContent5",
                another: "asasa"
            }]
        };

        let model = new EntryModel(config.header, config.data);
        let entryListChangedMock = jest.fn();

        model.bindEntryListChanged(entryListChangedMock);

        model._commit();
        model._commit();

        let referenceLocalStorage = {
            header: [{
                    name: "id"
                },
                {
                    name: "name"
                },
                {
                    name: "content"
                },
                {
                    name: "another"
                }
            ],
            data: [
                { id: 5, name: "testName5", content: "testContent5", another: "asasa", internalIdentifier: "12345abcde" },
                { id: 1, name: "testName1", content: "testContent1", another: "absd", internalIdentifier: "_internal_identifier_1" },
                { id: 2, name: "testName2", content: "testContent2", another: "asdasd", internalIdentifier: "_internal_identifier_2" },
                { id: 3, name: "testName3", content: "testContent3", another: "sd23", internalIdentifier: "_internal_identifier_3" },
                { id: 4, name: "testName4", content: "testContent4", another: "asdgfn", internalIdentifier: "_internal_identifier_4" }
            ]
        };

        expect(entryListChangedMock).toHaveBeenCalledTimes(2);
        expect(JSON.parse(localStorage.getItem('entries'))).toEqual(referenceLocalStorage);

        localStorage.clear();
    });

    test("Test consumeLocalStorage without header and without data entries", () => {
        let model = new EntryModel;
        let _consumeHeaderFromLocalStorageMock = jest.fn();
        let _consumeEntryDataFromLocalStorageMock = jest.fn();
        model._consumeHeaderFromLocalStorage = _consumeHeaderFromLocalStorageMock;
        model._consumeEntryDataFromLocalStorage = _consumeEntryDataFromLocalStorageMock;
        localStorage.setItem('entries', JSON.stringify({}));

        model._consumeData();

        expect(_consumeHeaderFromLocalStorageMock).toHaveBeenCalledTimes(0);
        expect(_consumeEntryDataFromLocalStorageMock).toHaveBeenCalledTimes(0);

        localStorage.clear();
    });

    test("Test consumeLocalStorage with header and without data entries", () => {
        let model = new EntryModel;
        let _consumeHeaderFromLocalStorageMock = jest.fn();
        let _consumeEntryDataFromLocalStorageMock = jest.fn();
        model._consumeHeaderFromLocalStorage = _consumeHeaderFromLocalStorageMock;
        model._consumeEntryDataFromLocalStorage = _consumeEntryDataFromLocalStorageMock;

        let header = [{
                name: "testName"
            },
            {
                name: "testName1"
            }
        ]
        localStorage.setItem('entries', JSON.stringify({ header: header }));

        model._consumeLocalStorage();

        expect(_consumeHeaderFromLocalStorageMock).toHaveBeenCalledTimes(1);
        expect(_consumeHeaderFromLocalStorageMock).toHaveBeenCalledWith(header);
        expect(_consumeEntryDataFromLocalStorageMock).toHaveBeenCalledTimes(0);

        localStorage.clear();
    });

    test("Test consumeLocalStorage with header and user defined header data and without data entries", () => {
        let userDefinedHeader = [{
                name: "TestHeader"
            },
            {
                name: "testName1"
            },
            {
                name: "userDefinedTestName1"
            }
        ];

        let model = new EntryModel(userDefinedHeader);
        let _consumeHeaderFromLocalStorageMock = jest.fn();
        let _consumeEntryDataFromLocalStorageMock = jest.fn();
        model._consumeHeaderFromLocalStorage = _consumeHeaderFromLocalStorageMock;
        model._consumeEntryDataFromLocalStorage = _consumeEntryDataFromLocalStorageMock;

        let header = [{
                name: "testName"
            },
            {
                name: "testName2"
            },
            {
                name: "testName1"
            }
        ]
        localStorage.setItem('entries', JSON.stringify({ header: header }));

        model._consumeLocalStorage();

        expect(_consumeHeaderFromLocalStorageMock).toHaveBeenCalledTimes(0);
        expect(_consumeEntryDataFromLocalStorageMock).toHaveBeenCalledTimes(0);
        expect(model.header).toEqual(userDefinedHeader);

        localStorage.clear();
    });

    test("Test create header hash", () => {
        let model = new EntryModel();
        let header = [{
                name: "testName"
            },
            {
                name: "testName2"
            },
            {
                name: "testName1"
            }
        ]
        let hash = model._createHeaderHash(header);
        expect(hash).toEqual('testname_testname2_testname1');
    });

    test("Test consumeLocalStorage without header and with data entries", () => {
        let model = new EntryModel;
        let _consumeHeaderFromLocalStorageMock = jest.fn();
        let _consumeEntryDataFromLocalStorageMock = jest.fn();
        model._consumeHeaderFromLocalStorage = _consumeHeaderFromLocalStorageMock;
        model._consumeEntryDataFromLocalStorage = _consumeEntryDataFromLocalStorageMock;

        let data = [{
                name: "testName"
            },
            {
                name: "testName1"
            }
        ]
        localStorage.setItem('entries', JSON.stringify({ data: data }));

        model._consumeLocalStorage();

        expect(_consumeHeaderFromLocalStorageMock).toHaveBeenCalledTimes(0);
        expect(_consumeEntryDataFromLocalStorageMock).toHaveBeenCalledTimes(1);
        expect(_consumeEntryDataFromLocalStorageMock).toHaveBeenCalledWith(data);

        localStorage.clear();
    });

    test("Test consumeLocalStorage with header and with data entries", () => {
        let model = new EntryModel;
        let _consumeHeaderFromLocalStorageMock = jest.fn();
        let _consumeEntryDataFromLocalStorageMock = jest.fn();
        model._consumeHeaderFromLocalStorage = _consumeHeaderFromLocalStorageMock;
        model._consumeEntryDataFromLocalStorage = _consumeEntryDataFromLocalStorageMock;

        let header = [{
                name: "name"
            },
            {
                name: "password"
            }
        ];

        let data = [{
                name: "testName"
            },
            {
                name: "testName1"
            }
        ];

        localStorage.setItem('entries', JSON.stringify({ header: header, data: data }));

        model._consumeLocalStorage();

        expect(_consumeHeaderFromLocalStorageMock).toHaveBeenCalledTimes(1);
        expect(_consumeHeaderFromLocalStorageMock).toHaveBeenCalledWith(header);
        expect(_consumeEntryDataFromLocalStorageMock).toHaveBeenCalledTimes(1);
        expect(_consumeEntryDataFromLocalStorageMock).toHaveBeenCalledWith(data);

        localStorage.clear();
    });

    test("Test consumeHeaderDataFromLocalStorage without identifier", () => {
        let model = new EntryModel;

        let header = [{
                name: "name"
            },
            {
                name: "password"
            }
        ];

        model._consumeHeaderFromLocalStorage(header);
        expect(model.header).toEqual(header);
        expect(model.identifier).toEqual([]);
    });


    test("Test consumeHeaderDataFromLocalStorage with identifier", () => {
        let model = new EntryModel;

        let header = [{
                name: "name",
                identifier: true
            },
            {
                name: "password"
            }
        ];

        model._consumeHeaderFromLocalStorage(header);
        expect(model.header).toEqual(header);
        expect(model.identifier).toEqual(["name"]);
    });

    test("Test consumeEntryDataFromLocalStorage without doubles", () => {
        let model = new EntryModel;

        let searchIdentifierMock = jest.fn()
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(false);

        let mergeEntriesMock = jest.fn();
        model._searchIdentifier = searchIdentifierMock;
        model._mergeEntries = mergeEntriesMock;

        model.entries = [{
                name: "testName1",
                id: 1
            },
            {
                name: "testName2",
                id: 2
            }
        ];

        let data = [{
                name: "testName1",
                id: 1
            },
            {
                name: "testName4",
                id: 4
            }
        ];

        let referenceEntries = [{
                name: "testName1",
                id: 1,
            },
            {
                name: "testName2",
                id: 2,
            },
            {
                name: "testName1",
                id: 1,
                internalIdentifier: "12345abcde"
            },
            {
                name: "testName4",
                id: 4,
                internalIdentifier: "12345abcde"
            }
        ];

        model._consumeEntryDataFromLocalStorage(data);

        expect(searchIdentifierMock).toHaveBeenCalledTimes(2);
        expect(mergeEntriesMock).toHaveBeenCalledTimes(0);
        expect(makeId).toHaveBeenCalledTimes(2);
        expect(model.entries).toEqual(referenceEntries);
    });

    test("Test consumeEntryDataFromLocalStorage with doubles", () => {
        let model = new EntryModel;

        let searchIdentifierMock = jest.fn()
            .mockReturnValueOnce(1)
            .mockReturnValueOnce(false);

        let mergeEntriesMock = jest.fn();
        model._searchIdentifier = searchIdentifierMock;
        model._mergeEntries = mergeEntriesMock;

        model.entries = [{
                name: "testName1",
                id: 1
            },
            {
                name: "testName2",
                id: 2
            }
        ];

        let data = [{
                name: "testName1",
                id: 1
            },
            {
                name: "testName4",
                id: 4
            }
        ];

        let referenceEntries = [{
                name: "testName1",
                id: 1,
            },
            {
                name: "testName2",
                id: 2,
            },
            {
                name: "testName4",
                id: 4,
                internalIdentifier: "12345abcde"
            }
        ];

        model._consumeEntryDataFromLocalStorage(data);

        expect(searchIdentifierMock).toHaveBeenCalledTimes(2);
        expect(mergeEntriesMock).toHaveBeenCalledTimes(1);
        expect(makeId).toHaveBeenCalledTimes(1);
        expect(model.entries).toEqual(referenceEntries);
    });

    test("Test mergeEntries without ignored key", () => {
        let model = new EntryModel;
        let targetEntry = {
            name: "TestName",
            id: 1
        };
        let sourceEntry = {
            name: "testName1",
            content: "testContent1"
        };
        let referenceResult = {
            name: "testName1",
            id: 1,
            content: "testContent1"
        };

        let result = model._mergeEntries(targetEntry, sourceEntry);
        expect(result).toEqual(referenceResult);
    });

    test("Test mergeEntries with ignored key", () => {
        let model = new EntryModel;
        model.ignoredKeysForMerge = ["name"];
        let targetEntry = {
            name: "TestName",
            id: 1
        };
        let sourceEntry = {
            name: "testName1",
            content: "testContent1"
        };
        let referenceResult = {
            name: "TestName",
            id: 1,
            content: "testContent1"
        };

        let result = model._mergeEntries(targetEntry, sourceEntry);
        expect(result).toEqual(referenceResult);
    });

    test("Test addEntry without existing entries", () => {
        let model = new EntryModel;
        let data = { name: "testName", id: 1 };
        let commitMock = jest.fn();

        model._commit = commitMock;

        model.addEntry(data);

        let referenceEntries = [{
            name: "testName",
            id: 1,
            internalIdentifier: "12345abcde"
        }]

        expect(commitMock).toHaveBeenCalledTimes(1);
        expect(makeId).toHaveBeenCalledTimes(1);
        expect(model.entries).toEqual(referenceEntries);
    });

    test("Test addEntry with existing entries", () => {
        let model = new EntryModel;
        let data = { name: "testName" };
        let commitMock = jest.fn();
        let entries = [{
                name: "testName1"
            },
            {
                name: "testName2"
            },
            {
                name: "testName3"
            }
        ];

        model.entries = entries;
        model._commit = commitMock;

        model.addEntry(data);

        let referenceEntries = [{
                name: "testName1"
            },
            {
                name: "testName2"
            },
            {
                name: "testName3"
            },
            {
                id: 4,
                name: "testName",
                internalIdentifier: "12345abcde"
            }
        ]

        expect(commitMock).toHaveBeenCalledTimes(1);
        expect(makeId).toHaveBeenCalledTimes(1);
        expect(model.entries).toEqual(referenceEntries);
    });
});