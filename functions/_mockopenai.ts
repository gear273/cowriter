const staticSuggestionList = [
  "is a very nice person",
  "This is a very good opportunity",
  "some weird stuff",
  "\n\nTest suggestion comes here",
  "\nThis is a sample suggestion here",
  " this starts with a space",
  "this ends with an exclamation mark!",
];

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
    });
    return { data };
  },
};

export default openai;
