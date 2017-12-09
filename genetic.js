const {compose, curry, length, min, update} = require('ramda')
const _ = require('lodash')

module.exports = (_fitness, targetLen, optimalfitness, geneset, _display, customMutate, customCreate) => {

  const

  /*
   * Wrap a geneset and its fitness
   * @param {Array} genes
   * @ return {Object}
   */
  chromosome = genes => ({genes, fitness: _fitness(genes)}),

  _mutate = curry((geneset, parentchromosome) => {
    let {genes} = parentchromosome
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
  })

  return {
    getbest: () => {
      let
      // Set up the functions
      mutate = customMutate
        ? compose(chromosome, chromosome => customMutate(chromosome.genes))
        : _mutate(geneset),

      // Initial guesses
      currentbest = customCreate
        ? chromosome(customCreate())
        : _generateParent(geneset, targetLen),

      currentfitness = currentbest.fitness

      if (currentfitness.isequal(optimalfitness)) {
        _display(currentbest.genes, currentbest.fitness)
        return currentbest
      }
      // console.log(currentbest)
      while (true) {
        let child = mutate(currentbest)
        // console.log(child)
        if (currentfitness.isbetter(child.fitness)) {
          continue
        }

        _display(child.genes, child.fitness)
        if (child.fitness.isequal(optimalfitness)) {
          return child
        }
        currentfitness = child.fitness
        currentbest = child
      }
    }
  }
}
