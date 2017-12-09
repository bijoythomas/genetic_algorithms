const {compose, curry, flatten, identity, join, length, map, range, repeat, tap, unfold, uniqBy, update} = require('ramda')
const genetic = require('./genetic')
const {log} = console
const _ = require('lodash')


const
ROWS = 10,

COLS = 10,

EXPECTEDKNIGHTS = 22,

callN = (fn, n) => unfold(i => i >= n ? false : [fn(), i + 1], 0),


Position = (row, col) => ({row, col}),

getRandomPosition = () => Position(
  _.random(ROWS - 1),
  _.random(COLS - 1)
),

_Board = curry((height, width, genes) => {
  let board = map(() => repeat('.', width), range(0, height))
  for (let i = 0; i < length(genes); i++) {
    board[genes[i].row][genes[i].col] = 'N'
  }
  return ({
    board: board,
    get: (row, col) => board[row][col],
    toString: () => compose(
      join('\n'),
      map(arr => '|' + map(identity, arr).join('|') + '|')
    )(board)
  })
}),

getAttacks = curry((height, width, {row, col}) => {
  let attackedpositions = []
  for (let x of [-2, -1, 1, 2]) {
    if ((0 <= (x + row)) && ((x + row) < height)) {
      for (let y of [-2, -1, 1, 2]) {
        if ((0 <= (y + col)) && ((y + col) < width)) {
          if (Math.abs(x) !== Math.abs(y)) {
            attackedpositions.push(Position(x + row, y + col))
          }
        }
      }
    }
  }
  return attackedpositions
 }),

Fitness = total => ({
  total,
  isbetter: other => total > other.total,
  isequal: other => total === other.total
}),

_fitness = curry((height, width, genes) => compose(
  Fitness,
  length,
  uniqBy(({row, col}) => String(row) + '-' + String(col)),
  // tap(log),
  flatten,
  map(getAttacks(height, width))
)(genes)),

Board = _Board(ROWS, COLS),

fitness = _fitness(ROWS, COLS),

_display = curry((start, genes, fitness) => {
  log(Board(genes).toString())
  log(Date.now() - start, genes.map(x => [x.row, x.col]), fitness.total)
}),

display = _display(Date.now()),

create = () => callN(getRandomPosition, EXPECTEDKNIGHTS),

mutate = geneset => {
  let index = _.random(length(geneset) - 1)
  let [newgene, alternate] = [getRandomPosition(), getRandomPosition()]
  return geneset[index].row === alternate.row && geneset[index].col === alternate.col
      ? update(index, newgene, geneset)
      : update(index, alternate, geneset)
},


engine = genetic(fitness, 0, Fitness(ROWS * COLS), undefined, display, mutate, create)


// log(fitness([Position(0,0)]))
engine.getbest()

// for (let i of [ [ 1, 3 ], [ 2, 2 ], [ 0, 1 ], [ 2, 0 ], [ 0, 2 ], [ 1, 1 ] ]) {
//   log(getAttacks(ROWS, COLS, Position(i[0], i[1])))
// }


