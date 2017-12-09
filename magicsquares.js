const {compose, curry, equals, filter, findIndex, flatten, intersection, join, length, map, range, reverse, splitEvery, sum, transpose, update, zipWith} = require('ramda')
const genetic = require('./genetic')
const {log} = console
const _ = require('lodash')

const
SIZE = 3,

EXPECTED_SUM = 15,

geneset = range(1, SIZE * SIZE + 1),

Fitness = total => ({
  total,
  isbetter: other => total > other.total,
  isequal: other => total === other.total
}),

_fitness = curry((expectedsum, geneset) => {
  let
  rows = splitEvery(SIZE, geneset),
  columns = transpose(rows),
  rightdiagonal = zipWith(intersection, rows, columns),
  leftdiagonal = zipWith(intersection, rows, reverse(columns)),
  total = compose(length, filter(equals(expectedsum)), map(sum))(rows) +
    compose(length, filter(equals(expectedsum)), map(sum))(columns) +
    compose(n => n === expectedsum ? 1 : 0, sum, flatten)(rightdiagonal) +
    compose(n => n === expectedsum ? 1 : 0, sum, flatten)(leftdiagonal)

  return Fitness(total)
}),

_display = curry((start, genes, fitness) => {
  log(compose(join('\n'), map(row => row.join(', ')), splitEvery(SIZE))(genes))
  log(Date.now() - start, genes, fitness.total)
}),

_mutate = curry((geneset, genes) => {
  let
  // index = _.random(0, length(genes) - 1),
  // value = genes[index],
  // [newgene, alternate] = [_.sample(geneset), _.sample(geneset)],
  // newvalue = value === newgene ? alternate : newgene,
  // otherIndex = findIndex(equals(newvalue), genes)

  // return compose(
  //   update(otherIndex, value),
  //   update(index, newvalue)
  // )(genes)
  [indexA, indexB] = [_.random(length(genes) - 1), _.random(length(genes) - 1)],
  valueA = genes[indexA],
  valueB = genes[indexB]

  return compose(
    update(indexB, valueA),
    update(indexA, valueB)
  )(genes)
}),

display = _display(Date.now()),

engine = genetic(_fitness(15), length(geneset), Fitness(15), geneset, display, _mutate(geneset), undefined)

engine.getbest()

// log(_mutate(geneset, geneset))
