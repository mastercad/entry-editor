global.assertHtmlByConfig = (config) => {
  const rootElement = document.querySelector(undefined !== config.selector ? config.selector : '#root')
  const rowList = rootElement.querySelectorAll('.entry-editor-row')
  expect(rowList.length).toEqual(config.data.length + 1)

  for (const columnPos in config.header) {
    const currentRow = rowList[columnPos]
    const inputList = currentRow.querySelectorAll('.entry-editor-item')
    expect(inputList.length).toEqual(config.header.length)
    const currentInput = inputList[columnPos]
    const configEntry = config.header[columnPos]

    for (const key in configEntry) {
      if (key === 'class') {
        const classParts = configEntry[key].split(' ')
        for (const classPart in classParts) {
          expect(currentInput.classList.contains(classPart)).toBeTruthy()
        }
      } else if (key === 'style') {
        expect(currentInput.getAttribute('style')).toEqual(configEntry[key])
      } else if (key === 'attributes') {
        configEntry[key].forEach(attribute => {
          const attributeName = Object.keys(attribute)[0]
          expect(currentInput.getAttribute(attributeName)).toEqual(attribute[attributeName])
        })
      } else {
        expect(currentInput[key]).toEqual(configEntry[key])
      }
    }
  }
}
