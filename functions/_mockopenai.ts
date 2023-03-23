const staticSuggestionList = [
  'has an infectious smile',
  "The timing couldn't be better for this opportunity",
  'I found a treasure trove of oddities',
  '\n\nA suggestion so brilliant, it shines like the sun',
  '\nA revolutionary idea, brought to life through suggestion',
  'leading with grace and humility',
  'this will blow your mind!',
  'a suggestion that spans the ages, and reaches across the universe',
  'a suggestion so powerful, it will leave you speechless',
  'Behold! A suggestion that will change your life forever!',
  "Life is too short to waste time on things that don't matter, so make every moment count.",
  "In the end, we only regret the chances we didn't take, the relationships we were afraid to have, and the decisions we waited too long to make.",
  "Don't let yesterday take up too much of today. Live in the moment and make it count.",
  'The road to success and the road to failure are almost exactly the same. The only difference is that one leads to regret, and the other leads to fulfillment.',
  'If you want to achieve greatness, stop asking for permission. Take the reins and make it happen!',
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
