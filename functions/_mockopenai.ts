const staticSuggestionList = [
  'is a very nice person',
  'This is a very good opportunity',
  'some weird stuff',
  '\n\nTest suggestion comes here',
  '\nThis is a sample suggestion here',
  ' this starts with a space',
  'this ends with an exclamation mark!',
  'this is a very long suggestion that will be a bit annoying to read\n\nbut it is a good test',
  'this is another very long suggestion that will be a bit annoying to read',
  'This is a lorem ipsum suggestion. This should be another very long suggestion that will be a bit annoying to read',
]

const openai = {
  createCompletion: async (_params: any) => {
    const { data } = await Promise.resolve({
      data: {
        choices: [
          {
            text: staticSuggestionList[
              Math.floor(Math.random() * staticSuggestionList.length)
            ],
          },
        ],
      },
    })
    return { data }
  },
}

export default openai
