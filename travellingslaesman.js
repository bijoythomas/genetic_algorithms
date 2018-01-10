const {append, apply, compose, concat, curry, find, head, identity, init, length, lift, map, o, omit, sum, tail, toPairs, update, values, zip} = require('ramda')
const genetic = require('./genetic')
const {log} = console
const _ = require('lodash')

const
idtolocation = {
  'A': [4, 7],
  'B': [2, 6],
  'C': [0, 5],
  'D': [1, 3],
  'E': [3, 0],
  'F': [5, 1],
  'G': [7, 2],
  'H': [6, 4]
},

locationtoid = idtolocation => {
  let keyvaluepairs = toPairs(idtolocation)
  return function([x, y]) {
    return compose(
      head,
      find(([key, [a, b]]) => a === x && b === y)
    )(keyvaluepairs)
  }
},

optimalSequence = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],

Fitness = total => ({
  total,
  isbetter: other => total < other.total,
  isequal: other => total === other.total
}),

getdistance = ([x1, y1], [x2, y2]) => Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)),

_fitness = genes => compose(
  o(Fitness, Math.round),
  sum,
  map(apply(getdistance)),
  lift(zip)(init)(tail),
  lift(append)(head)(identity) // add starting point to the end to calculate distance back to start
)(genes),

_display = curry((start, genes, fitness) => {
  log(Date.now() - start, genes.map(locationtoid(idtolocation)), fitness.total)
}),

display = _display(Date.now()),

create = (idtolocation, location) => compose(
  concat([idtolocation[location]]),
  _.shuffle,
  values,
  omit(location)
)(idtolocation),

mutate = geneset => {
  let [head, ...rest] = geneset // preserve the starting location & mutate the rest
  let [indexA, indexB] = [_.random(length(rest) - 1), _.random(length(rest) - 1)]
  let [genesA, genesB] = [rest[indexA], rest[indexB]]

  return compose(
    concat([head]),
    update(indexA, genesB),
    update(indexB, genesA)
  )(rest)
},

geneset = values(idtolocation),

optimalfitness = _fitness(optimalSequence.map(key => idtolocation[key])),

engine = genetic(
  _fitness,
  length(geneset),
  optimalfitness,
  geneset,
  display,
  mutate,
  () => create(idtolocation, 'A'),
  50
)

engine.getbest()
