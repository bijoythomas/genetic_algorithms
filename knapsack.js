const {always, apply, compose, contains, curry, filter, isEmpty, length, map, min, remove, sum, transpose} = require('ramda')
const genetic = require('./genetic_with_annealing')
const {log} = console
const _ = require('lodash')

const

MAX_WEIGHT = 10,

MAX_VOLUME = 4,

Item = (name, value, weight, volume) => ({
  name: always(name),
  value: always(value),
  weight: always(weight),
  volume: always(volume)
}),

flour = Item('flour', 1680, 0.265, 0.41),

butter = Item('butter', 1440, 0.5, 0.13),

sugar = Item('sugar', 1840, 0.441, 0.29),

_max = curry((maxweight, maxvolume, item) => Math.floor(min(maxweight / item.weight(), maxvolume / item.volume()))),

ItemQuantity = (item, quantity) => ({
  item: always(item),
  quantity: always(quantity),
  equals: another => item.name() === another.item().name() && quantity === another.quantity()
}),

Fitness = (totalweight, totalvolume, totalvalue) => ({
  totalweight: always(totalweight),
  totalvolume: always(totalvolume),
  totalvalue: always(totalvalue),
  isbetter: another => totalvalue > another.totalvalue(),
  isequal: another => totalvalue === another.totalvalue()
}),

fitness = genes => compose(
  apply(Fitness),
  map(sum),
  transpose,
  map(itemq => [
    itemq.quantity() * itemq.item().weight(),
    itemq.quantity() * itemq.item().volume(),
    itemq.quantity() * itemq.item().value()
  ])
)(genes),

_create = curry((maxweight, maxvolume, items) => {
  let
  genes = [],
  remainingweight = maxweight,
  remainingvolume = maxvolume
  for (let item of _.shuffle(items)) {
    let quantity = _max(remainingweight, remainingvolume, item)
    if (quantity > 0) {
      genes.push(ItemQuantity(item, quantity))
      remainingweight -= quantity * item.weight()
      remainingvolume -= quantity * item.volume()
    }
  }

  return genes
}),

_mutate = curry((maxweight, maxvolume, geneset, genes) => {
  let f = fitness(genes)
  let selecteditems = genes.map(iq => iq.item().name())
  let totalweight = f.totalweight()
  let totalvolume = f.totalvolume()
  let remainingweight = maxweight - totalweight
  let remainingvolume = maxvolume - totalvolume
  let mutation = genes // initialize

  // removing an item
  if (!isEmpty(mutation) && _.random(0, 10) === 0) {
    let index = _.random(0, length(mutation) - 1)
    let itemq = mutation[index]
    mutation = remove(index, 1, mutation)
    remainingweight += itemq.quantity() * itemq.item().weight()
    remainingvolume += itemq.quantity() * itemq.item().volume()
  }

  // adding items
  if (
    (remainingweight > 0 || remainingvolume > 0) &&
    (isEmpty(mutation) || (length(mutation) < length(geneset) && _.random(0, 100) === 0))
  ) {
    let items = filter(item => !contains(item.name(), selecteditems), geneset)
    for (let item of items) {
      let quantity = _max(remainingweight, remainingvolume, item)
      if (quantity > 0) {
        quantity = _.random(Math.floor(quantity / 2), quantity)
        mutation.push(ItemQuantity(item, quantity))
        remainingweight -= quantity * item.weight()
        remainingvolume -= quantity * item.volume()
      }
    }
    return mutation
  }

  // replacing an item with other items
  if (!isEmpty(mutation) && length(mutation) < length(geneset) && _.random(0, 4) === 0) {
    let index = _.random(0, length(mutation) - 1)
    let itemq = mutation[index]
    mutation = remove(index, 1, mutation)
    remainingweight += itemq.quantity() * itemq.item().weight()
    remainingvolume += itemq.quantity() * itemq.item().volume()
    let items = filter(item => !contains(item.name(), selecteditems), geneset)
    for (let item of items) {
      let quantity = _max(remainingweight, remainingvolume, item)
      if (quantity > 0) {
        quantity = _.random(Math.floor(quantity / 2), quantity)
        mutation.push(ItemQuantity(item, quantity))
        remainingweight -= quantity * item.weight()
        remainingvolume -= quantity * item.volume()
      }
    }
    return mutation
  }

  return mutation
}),

items = [flour, butter, sugar],

_display = curry((start, genes, fitness) => {
  log(
    Date.now() - start,
    fitness.totalvalue() + ': ' + map(itemq => itemq.item().name() + '[' + itemq.quantity() + ']', genes)
  )
}),

display = _display(Date.now()),

create = () => _create(MAX_WEIGHT, MAX_VOLUME, items),

mutate = _mutate(MAX_WEIGHT, MAX_VOLUME, items),

optimalfitness = fitness([ItemQuantity(flour, 1), ItemQuantity(butter, 14), ItemQuantity(sugar, 6)]),

engine = genetic(fitness, length(items), optimalfitness, items, display, mutate, create, 50)

log('optimalfitness', optimalfitness.totalvalue())
engine.getbest()
