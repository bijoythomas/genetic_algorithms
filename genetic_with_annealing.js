const {always, compose, curry, head, isNil, length, min, prop, sort, splitWhen, update} = require('ramda')
const _ = require('lodash')

module.exports = (_fitness, targetLen, optimalfitness, geneset, _display, customMutate, customCreate) => {

  const

  MAX_MUTATIONS = 1000,

  /*
   * Wrap a geneset and its fitness
   * @param {Array} genes
   * @ return {Object}
   */
  chromosome = function chromosome(genes, fitness = _fitness(genes), _age = 0) {
    return {
      genes: always(genes),
      fitness: always(fitness),
      age: always(_age),
      older: () => chromosome(genes, fitness, _age + 1),
      copy: () => chromosome(genes, fitness, _age)
    }
  },

  _mutate = curry((geneset, parentchromosome) => {
    let genes = parentchromosome.genes()
    let index = _.random(length(genes) - 1)
    let [newgene, alternate] = [_.sample(geneset), _.sample(geneset)]
    let child = genes[index] === alternate
      ? update(index, newgene, genes)
      : update(index, alternate, genes)
    return chromosome(child)
  }),


  _generateParent = curry((geneset, len) => {
    let genes = []
    while (length(genes) < len) {
      let sampleSize = min(len - length(genes), length(geneset))
      genes = genes.concat(_.sampleSize(geneset, sampleSize))
    }
    return chromosome(genes)
  }),

  fitnesssorter = (f1, f2) => f1.isequal(f2) ? 0 : f1.isbetter(f2) ? 1 : -1,

  getImprovement = function *(_mutate, _generate, maxAge) {
    let
    numMutations = 0,
    parent = _generate(),
    bestparent = parent.copy(),
    historicalfitnesses = [bestparent.fitness()]

    yield parent

    while (true) {
      let child = _mutate(parent)

      numMutations++

      if (parent.fitness().isbetter(child.fitness())) {
        if (isNil(maxAge)) {
          continue
        }

        parent = parent.older()
        if (maxAge > parent.age()) {
          continue
        }

        let
        childfitness = child.fitness(),
        sortedfitnesses = sort(fitnesssorter, historicalfitnesses),
        index = compose(
          length,
          head,
          splitWhen(ft => ft.isequal(childfitness) || ft.isbetter(childfitness))
        )(sortedfitnesses),
        difference = length(historicalfitnesses) - index,
        propotionSimilar = difference / length(historicalfitnesses),
        rand = _.random(1, true),
        prob = Math.exp(-propotionSimilar)

        if (rand < prob) {
          parent = child
          continue
        }

        parent = chromosome(bestparent.genes(), bestparent.fitness(), 0)
        continue
      }

      if (child.fitness().isequal(parent.fitness())) {
        parent = chromosome(child.genes(), child.fitness(), parent.age() + 1)
        continue
      }

      parent = chromosome(child.genes(), child.fitness(), 0)

      if (child.fitness().isbetter(bestparent.fitness())) {
        yield child
        bestparent = child
        historicalfitnesses.push(child.fitness())
      }
    }
  }

  return {
    getbest: () => {
      let
      // Set up the functions
      mutate = customMutate
        ? compose(chromosome, chromosome => customMutate(chromosome.genes()))
        : _mutate(geneset),
      generate = () => customCreate
        ? chromosome(customCreate())
        : _generateParent(geneset, targetLen)


      for (let improvement of getImprovement(mutate, generate, 50)) {
        _display(improvement.genes(), improvement.fitness())
        if (improvement.fitness().isequal(optimalfitness)) {
          return improvement
        }
      }
    }
  }
}
