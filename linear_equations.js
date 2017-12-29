const {always, curry, range} = require('ramda')
const genetic = require('./genetic_with_annealing')
const {log} = console
const _ = require('lodash')

const
Fitness = diff => ({
  diff: always(diff),
  isbetter: another => diff < another.diff(),
  isequal: another => diff === another.diff()
}),

fitness = genes => {
  let [x, y] = genes
  return Fitness(Math.abs(x + (2 * y) - 4) + Math.abs((4 * x) + (4 * y) - 12))
},

optimalfitness = Fitness(0),

geneset = range(1, 11),

_display = curry((start, genes, fitness) => {
  log(
    Date.now() - start,
    genes[0],
    genes[1],
    fitness.diff()
  )
}),

display = _display(Date.now()),

engine = genetic(fitness, 2, optimalfitness, geneset, display, undefined, undefined, 50)

engine.getbest()
