const {compose, curry, equals, filter, flatten, intersection, join, length, map, o, range, reverse, splitEvery, subtract, sum, transpose, update, zipWith} = require('ramda')
const genetic = require('./genetic_with_annealing')
const {log} = console
const _ = require('lodash')

const
SIZE = 3,

EXPECTED_SUM = 15,

geneset = range(1, SIZE * SIZE + 1),

Fitness = total => ({
  total,
  isbetter: other => total < other.total,
  isequal: other => total === other.total
}),

_fitness = curry((expectedsum, geneset) => {
  let
  partialFitness = arr => compose(
    sum,
    map(o(Math.abs, subtract(EXPECTED_SUM))),
    map(sum)
  )(arr),
  rows = splitEvery(SIZE, geneset),
  columns = transpose(rows),
  rightdiagonal = compose(Array.of, flatten, zipWith(intersection, rows))(columns),
  leftdiagonal = compose(Array.of, flatten, zipWith(intersection, rows))(reverse(columns)),
  total = o(sum, map(partialFitness))([rows, columns, rightdiagonal, leftdiagonal])
  return Fitness(total)
}),

_display = curry((start, genes, fitness) => {
  log(compose(join('\n'), map(row => row.join(', ')), splitEvery(SIZE))(genes))
  log(Date.now() - start, genes, fitness.total)
}),

_mutate = curry((geneset, genes) => {
  let
  [indexA, indexB] = [_.random(length(genes) - 1), _.random(length(genes) - 1)],
  valueA = genes[indexA],
  valueB = genes[indexB]

  return compose(
    update(indexB, valueA),
    update(indexA, valueB)
  )(genes)
}),

display = _display(Date.now()),

engine = genetic(_fitness(15), length(geneset), Fitness(0), geneset, display, _mutate(geneset), undefined)

engine.getbest()
