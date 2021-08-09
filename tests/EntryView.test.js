import EntryView from '../src/lib/EntryView';
import ValidationError from '../src/lib/ValidationError';

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
});

let baseConfig = {
    header: [
      {
        name: "TestName",
        type: "text",
        placeholder: "Name:",
        class: "col-sm-2"
      },
      {
        name: "TestPassword",
        class: "col-sm-2 password"
      }
    ],
    data: [
      {
        TestName: "testName",
        TestPassword: "testPassword"
      },
      {
        TestName: "testName1",
        TestPassword: "testPassword1"
      },
      {
        TestName: "testName2",
        TestPassword: "testPassword2"
      }
    ]
};

describe("Test EntryView", () => {

  it("CTOR prevents processing if the header entry missing in config", () => {
    expect(() => {let view = new EntryView()}).toThrowError(new ValidationError('No Header-Information set!'));
  });

  it("CTOR prevents processing if root element missing because selector is wrong", () => {
    let config = {
      header: [
        {
          name: "TestName"
        },
        {
          name: "TestPassword"
        }
      ],
      selector: '.wrapper'
    }
    document.body.innerHTML = '<div id="root"></div>';
    expect(() => {let view = new EntryView(config)}).toThrowError(new ValidationError('Root Element not found!'));
  });

  it("CTOR prevents processing if root element missing because no root element exists", () => {
    let config = {
      header: [
        {
          name: "TestName"
        },
        {
          name: "TestPassword"
        }
      ]
    }
    document.body.innerHTML = '';
    expect(() => {let view = new EntryView(config)}).toThrowError(new ValidationError('Root Element not found!'));
  });

  it("specific element selector is working with CLASS", () => {
    let config = {
      header: [
        {
          name: "TestName"
        },
        {
          name: "TestPassword"
        }
      ],
      selector: '.wrapper'
    }
    document.body.innerHTML = '<div class="wrapper"></div>';
    expect(() => {let view = new EntryView(config)}).not.toThrowError(ValidationError);
  });

  it("specific element selector is working with ID", () => {
    let config = {
      header: [
        {
          name: "TestName"
        },
        {
          name: "TestPassword"
        }
      ],
      selector: '#user_list'
    }
    document.body.innerHTML = '<div id="user_list"></div>';
    expect(() => {let view = new EntryView(config)}).not.toThrowError(ValidationError);
  });

  it("Test elements are created like expected with unmodified baseConfig", () => {
      let view = new EntryView(baseConfig);

      view.displayEntries(baseConfig.data);

      assertHtmlByConfig(baseConfig);
  });

  it("Test elements are created like expected with additional style", () => {
    let config = baseConfig;
    config.header[0]['style'] = "background-color: #FFF";

    let view = new EntryView(config);

    view.displayEntries(baseConfig.data);

    assertHtmlByConfig(config);
  });

  it("Test elements are created like expected with additional attributes", () => {
    let config = baseConfig;
    let attributes = [];
    attributes.push({"data-orig": "122as"});
    config.header[0]['attributes'] = attributes;

    let view = new EntryView(config);

    view.displayEntries(baseConfig.data);

    assertHtmlByConfig(config);
  });

  it("Test elements are created like expected with additional attribute name", () => {
    let config = baseConfig;
    let attributes = [];
    attributes.push({name: "attribute_name"});
    config.header[0]['attributes'] = attributes;

    let view = new EntryView(config);

    view.displayEntries(baseConfig.data);

    // name is already set via attributes from config, set here only to make it testable with changed value
    config.header[0]['name'] = "attribute_name";

    assertHtmlByConfig(config);
  });

  it("Test generate empty warning by entries-list", () => {
    let view = new EntryView({header: [{name: 'test'}, {name: 'password'}]});

    view.displayEntries([]);
    let pTags = document.getElementsByTagName('p');
    expect(pTags.length).toEqual(1);
    expect(pTags[0].innerHTML).toMatch(/No entry found, create one!/);
  });
});
