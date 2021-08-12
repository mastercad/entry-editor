import EntryController from '../src/lib/EntryController'

import ValidationError from '../src/lib/ValidationError'

jest.mock('../src/lib/EntryView')
jest.mock('../src/lib/EntryModel')

describe('Test EntryController', () => {
    it('Test Controller reject work, if header definition is missing', () => {
        expect(() => { const controller = new EntryController() }).toThrowError(new ValidationError('Config missing!'))
    })

    it('Test Controller reject work, if header definition is missing', () => {
        expect(() => { const controller = new EntryController({}) }).toThrowError(new ValidationError('No Header-Information set!'))
    })
    it('Test if the Controller initialized', () => {
        const controller = new EntryController({ header: [] })
        expect(controller).toBeInstanceOf(EntryController)
    })

    it('Test invalid config not accepted with one column', () => {
        const config = {
            header: [{}],
            data: [
                [
                    test
                ]
            ]
        }

        expect(() => { const controller = new EntryController(config) }).toThrowError(ValidationError, 'Every Column need name field!')
    })

    it('Test valid config accepted', () => {
        const config = {
            header: [{
                    name: 'testName',
                    type: 'text',
                    value: 'test-name'
                },
                {
                    name: 'password',
                    type: 'password',
                    value: 'test'
                }
            ],
            data: [
                [
                    'test-name1',
                    'test-password1'
                ],
                [
                    'test-name2'
                ]
            ]
        }
        const controller = new EntryController(config)
    })
})