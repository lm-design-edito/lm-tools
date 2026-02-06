import { randomPick } from '../../arrays/random-pick/index.js'
import { randomInt } from '../../random/random/index.js'

export const words = [
  'a', 'ac', 'accumsan', 'adipiscing', 'aenean', 'aliquam', 'aliquet', 'amet', 'ante', 'arcu', 'at', 'auctor', 'augue',
  'bibendum', 'blandit',
  'condimentum', 'consectetur', 'consequat', 'convallis', 'cras', 'curabitur', 'cursus',
  'dapibus', 'diam', 'dictum', 'dictumst', 'dignissim', 'dolor', 'donec', 'dui', 'duis',
  'efficitur', 'egestas', 'eget', 'eleifend', 'elementum', 'elit', 'enim', 'erat', 'eros', 'est', 'et', 'eu', 'euismod', 'ex',
  'facilisis', 'faucibus', 'felis', 'feugiat', 'finibus', 'fringilla', 'fusce',
  'gravida',
  'habitasse', 'hac', 'hendrerit',
  'iaculis', 'id', 'imperdiet', 'in', 'integer', 'interdum', 'ipsum',
  'justo',
  'lacinia', 'lacus', 'laoreet', 'lectus', 'leo', 'libero', 'ligula', 'lobortis', 'lorem', 'luctus',
  'maecenas', 'magna', 'malesuada', 'massa', 'mattis', 'mauris', 'maximus', 'metus', 'mi', 'molestie', 'mollis', 'morbi',
  'nam', 'nec', 'neque', 'nibh', 'nisi', 'nisl', 'non', 'nulla', 'nullam', 'nunc',
  'odio', 'orci', 'ornare',
  'pellentesque', 'pharetra', 'phasellus', 'placerat', 'platea', 'porta', 'porttitor', 'posuere', 'praesent', 'pulvinar', 'purus',
  'quam', 'quis', 'quisque',
  'risus', 'rutrum',
  'sagittis', 'sapien', 'sed', 'sem', 'semper', 'sit', 'sodales', 'sollicitudin', 'suscipit', 'suspendisse',
  'tellus', 'tempor', 'tempus', 'tincidunt', 'tortor', 'tristique', 'turpis',
  'ultrices', 'ultricies', 'urna', 'ut',
  'vehicula', 'vel', 'velit', 'venenatis', 'vestibulum', 'vitae', 'vivamus', 'viverra', 'volutpat', 'vulputate'
]

export const generateSentence = (wordCount: number): string => {
  const resultArr: string[] = []
  let currentWordCound = wordCount
  for (let i = 0; i < currentWordCound; i++) {
    const picked = randomPick(words)
    if (typeof picked === 'string') resultArr.push(picked)
    else { currentWordCound += 1 }
  }
  const [firstWord, ...otherWords] = resultArr
  if (firstWord === undefined) return ''
  const capFirstLetter = firstWord?.charAt(0).toUpperCase()
  const restOfFirstWord = firstWord?.slice(1)
  const sentence = [
    `${capFirstLetter}${restOfFirstWord}`,
    ...otherWords
  ].join(' ')
  return `${sentence}.`
}

export const generateSentences = (
  sentencesCount: number,
  maxSentenceLength: number = 12,
  minSentenceLength: number = 4): string [] => {
  const sentences: string[] = []
  for (let i = 0; i < sentencesCount; i++) {
    const length = randomInt(maxSentenceLength, minSentenceLength) ?? 8
    sentences.push(generateSentence(length))
  }
  return sentences
}
