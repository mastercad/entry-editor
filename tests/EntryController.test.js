import { default as EntryController } from '../src/lib/EntryController';

import ValidationError from '../src/lib/ValidationError';

jest.mock('../src/lib/EntryView');
jest.mock('../src/lib/EntryModel');

describe("Test EntryController", () => {


    it("Test Controller reject work, if header definition is missing", () => {
        expect(() => {let controller = new EntryController();}).toThrowError(new ValidationError('Config missing!'));
    });

    it("Test Controller reject work, if header definition is missing", () => {
        expect(() => {let controller = new EntryController({});}).toThrowError(new ValidationError('No Header-Information set!'));
    });
    it("Test if the Controller initialized", () => {
        let controller = new EntryController({header: []});
        expect(controller).toBeInstanceOf(EntryController);
    });

    it("Test invalid config not accepted with one column", () => {
        let config = {
            header: [
                {
                }
            ],
            data: [
                [
                    test
                ]
            ]
        }

        expect(() => {let controller = new EntryController(config);}).toThrowError(ValidationError, 'Every Column need name field!');
    });

    it("Test valid config accepted", () => {
        let config = {
            header: [
                {
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
        let controller = new EntryController(config);
    });
});
