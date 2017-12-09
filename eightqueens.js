const {compose, curry, identity, join, length, map, range, repeat, uniq, uniqBy} = require('ramda')
const genetic = require('./genetic')
const {log} = console

const
geneset = range(0, 8),

Board = genes => {
  let size = length(genes) / 2
  let board = map(() => repeat('.', size), range(0, size))
  for (let i = 0; i < length(genes); i += 2) {
    board[genes[i]][genes[i + 1]] = 'Q'
  }
  return ({
    board: board,
    get: (row, col) => board[row][col],
    toString: () => compose(
      join('\n'),
      map(arr => '|' + map(identity, arr).join('|') + '|')
    )(board)
  })
},

Fitness = total => ({
  total,
  isbetter: other => total < other.total,
  isequal: other => total === other.total
}),

_fitness = curry(genes => {
  let size = length(genes) / 2
  let rowsWithQueens = []
  let colsWithQueens = []
  let northEastDiagonalsWithQueens = []
  let southEastDiagonalsWithQueens = []

  for (let i = 0; i < genes.length; i += 2) {
    let row = genes[i]
    let col = genes[i + 1]
    rowsWithQueens.push(row)
    colsWithQueens.push(col)
    northEastDiagonalsWithQueens.push(row + col)
    southEastDiagonalsWithQueens.push(size - 1 - row + col)
  }
  rowsWithQueens = uniq(rowsWithQueens)
  colsWithQueens = uniq(colsWithQueens)
  northEastDiagonalsWithQueens = uniq(northEastDiagonalsWithQueens)
  southEastDiagonalsWithQueens = uniq(southEastDiagonalsWithQueens)

  let total = size - rowsWithQueens.length +
              size - colsWithQueens.length +
              size - northEastDiagonalsWithQueens.length +
              size - southEastDiagonalsWithQueens.length

  return Fitness(total)
}),

_display = curry((start, genes, fitness) => {
  log(Board(genes).toString())
  log(Date.now() - start, genes, fitness.total)
}),

display = _display(Date.now()),

engine = genetic(_fitness, length(geneset) * 2, Fitness(0), geneset, display)

engine.getbest()

/*
let solutions = []
for (let i = 0; i < 500; i++) {
  let ret = engine.getbest()
  solutions.push(ret)
}

let uniqSolutions = compose(
  uniqBy(b => b.toString()),
  map(s => Board(s.genes))
)(solutions)

log(uniqSolutions.length)
uniqSolutions.forEach(board => log(board.toString() + '\n-----------------\n'))
*/
