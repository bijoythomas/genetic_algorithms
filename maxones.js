const {compose, curry, length, repeat, sum, zipWith} = require('ramda')
const genetic = require('./genetic')
const {log} = console

const
geneset = [0, 1],

target = repeat(1, 100),

_fitness = curry((target, genes) => compose(
  sum,
  zipWith((a, b) => a === b ? 1 : 0)
)(target, genes)),

_display = curry((start, chromosome) => {
  log(Date.now() - start, chromosome.genes.join(''), chromosome.fitness)
}),

fitness = _fitness(target),

display = _display(Date.now()),

engine = genetic(fitness, length(target), fitness(target), geneset, display)

engine.getbest()
