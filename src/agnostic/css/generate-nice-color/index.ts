/**
 * Array of aesthetically pleasing CSS named colors.
 */
export const niceColors = [
  'fuchsia',           'teal',               'aliceblue',      'bisque',             'blueviolet',
  'burlywood',         'chocolate',          'coral',          'cornflowerblue',     'crimson',
  'darkblue',          'darkgoldenrod',      'darkkhaki',      'darkmagenta',        'darkolivegreen',
  'darkorange',        'darkorchid',         'darkred',        'darksalmon',         'darkslateblue',
  'darkslategray',     'darkviolet',         'deeppink',       'deepskyblue',        'dodgerblue',
  'firebrick',         'floralwhite',        'gainsboro',      'gold',               'hotpink',
  'indianred',         'indigo',             'khaki',          'lavender',           'lightcoral',
  'lightgreen',        'lightsalmon',        'lightsteelblue', 'limegreen',          'magenta',
  'mediumseagreen',    'mediumspringgreen',  'mediumvioletred','moccasin',           'orangered',
  'orchid',            'palegoldenrod',      'palevioletred',  'peachpuff',          'peru',
  'plum',              'royalblue',          'sandybrown',     'springgreen',        'tan',
  'thistle',           'tomato',             'violet',         'wheat',              'yellowgreen'
] as const

/**
 * Generates a random aesthetically pleasing CSS named color.
 */
export const generateNiceColor = (): typeof niceColors[number] => {
  const pos = Math.floor(Math.random() * niceColors.length)
  const found = niceColors[pos]
  return found!
}
