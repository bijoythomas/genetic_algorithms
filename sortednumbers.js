const {apply, compose, converge, curry, filter, init, length, lift, map, range, subtract, sum, tail, zip} = require('ramda')
const genetic = require('./genetic')
const {log} = console

const
geneset = range(0, 100),

target = range(0, 40),

fitness = genes => converge(
  (numbersinseq, totalgap) => ({
    numbersinseq,
    totalgap,
    isbetter: other =>
      numbersinseq === other.numbersinseq
      ? totalgap < other.totalgap
      : numbersinseq > other.numbersinseq,
    isequal: other => numbersinseq === other.numbersinseq && totalgap === other.totalgap
  }),
  [
    compose(length, filter(([a, b]) => a <= b), lift(zip)(init)(tail)),
    compose(sum, map(apply(subtract)), filter(([a, b]) => a > b), lift(zip)(init)(tail))
  ]
)(genes),

_display = curry((start, genes, fitness) => {
  log(Date.now() - start, genes.join(' '), fitness.numbersinseq, fitness.totalgap)
}),


display = _display(Date.now()),

engine = genetic(fitness, length(target), fitness(target), geneset, display)

engine.getbest()
