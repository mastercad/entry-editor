global.assertHtmlByConfig = (config) => {
  let rootElement = document.querySelector(undefined !== config.selector ? config.selector : '#root');
  let rowList = rootElement.querySelectorAll('.entry-editor-row');
  expect(rowList.length).toEqual(config.data.length + 1);

  for (let columnPos in config.header) {
    let currentRow = rowList[columnPos];
    let inputList = currentRow.querySelectorAll('.entry-editor-item');
    expect(inputList.length).toEqual(config.header.length);
    let currentInput = inputList[columnPos];
    let configEntry = config.header[columnPos];

    for(let key in configEntry) {
      if ('class' === key) {
        let classParts = configEntry[key].split(' ');
        for (let classPart in classParts) {
          expect(currentInput.classList.contains(classPart)).toBeTruthy();
        }
      } else if ('style' === key) {
        expect(currentInput.getAttribute('style')).toEqual(configEntry[key]);
      } else if ('attributes' === key) {
        configEntry[key].forEach(attribute => {
          let attributeName = Object.keys(attribute)[0];
          expect(currentInput.getAttribute(attributeName)).toEqual(attribute[attributeName]);
        });
      } else {
        expect(currentInput[key]).toEqual(configEntry[key]);
      }
    }
  }
}