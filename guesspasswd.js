const {compose, curry, length, range, sum, zipWith} = require('ramda')
const genetic = require('./genetic')
const {log} = console

const
alpharange = (start, end) =>
  range(start.charCodeAt(0), end.charCodeAt(0) + 1)
  .map(n => String.fromCharCode(n)),

geneset = alpharange('a', 'z')
  .concat(alpharange('A', 'Z'))
  .concat([' ', '!']),

target = 'For I am fearfully and wonderfully made!',

_fitness = curry((target, genes) => compose(
  sum,
  zipWith((a, b) => a === b ? 1 : 0)
)(target, genes)),

_display = curry((start, chromosome) => {
  log(Date.now() - start, chromosome.genes.join(''), chromosome.fitness)
}),

fitness = _fitness(target.split('')),

display = _display(Date.now()),

engine = genetic(fitness, length(target), fitness(target.split('')), geneset, display)

engine.getbest()
