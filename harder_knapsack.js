const {toString, always, apply, compose, contains, converge, curry, dec, filter, findIndex, isEmpty, length, lensIndex, map, match, max, min, nth, over, reject, remove, sort, split, startsWith, sum, transpose, trim, unary} = require('ramda')
const genetic = require('./genetic_with_annealing')
const
_ = require('lodash'),
{log} = console,
{fetchUrl} = require('fetch'),

Window = function(min, max, size) {
  function _window(min, max, size) {
    this.min = min
    this.max = max
    this.size = size
  }

  _window.prototype.slide = function() {
    this.size = this.size > this.min
      ? this.size - 1
      : this.max
  }

  return new _window(min, max, size)
},

Resource = curry((name, weight, value) => ({
  name: always(name),
  weight: always(weight),
  value: always(value)
})),

ResourceQuantity = (resource, quantity) => ({
  resource: always(resource),
  quantity: always(quantity)
}),

Fitness = (totalweight, totalvalue) => ({
  totalweight: always(totalweight),
  totalvalue: always(totalvalue),
  isbetter: another => totalvalue > another.totalvalue(),
  isequal: another => totalvalue === another.totalvalue()
}),

fitness = genes => compose(
  apply(Fitness),
  map(sum),
  transpose,
  map(rq => [rq.quantity() * rq.resource().weight(), rq.quantity() * rq.resource().value()])
)(genes),

_max = curry((maxweight, item) => Math.floor(maxweight / item.weight())),

_create = curry((maxweight, items) => {
  let
  genes = [],
  remainingweight = maxweight

  for (let item of _.shuffle(items)) {
    let quantity = _max(remainingweight, item)
    if (quantity > 0) {
      genes.push(ResourceQuantity(item, quantity))
      remainingweight -= quantity * item.weight()
    }
  }

  return genes
}),

_mutate = curry((maxweight, geneset, slidingwindow, genes) => {
  slidingwindow.slide()
  let f = fitness(genes)
  let selecteditems = genes.map(iq => iq.resource().name())
  let totalweight = f.totalweight()
  let remainingweight = maxweight - totalweight
  let mutation = genes // initialize

  // removing an item
  if (!isEmpty(mutation) && _.random(0, 10) === 0) {
    let index = _.random(0, length(mutation) - 1)
    let itemq = mutation[index]
    mutation = remove(index, 1, mutation)
    remainingweight += itemq.quantity() * itemq.resource().weight()
  }

  // adding items
  if (
    (remainingweight > 0) &&
    (isEmpty(mutation) || (length(mutation) < length(geneset) && _.random(0, 100) === 0))
  ) {
    let items = filter(item => !contains(item.name(), selecteditems), geneset)
    for (let item of items) {
      let quantity = _max(remainingweight, item)
      if (quantity > 0) {
        quantity = _.random(Math.floor(quantity / 2), quantity)
        mutation.push(ResourceQuantity(item, quantity))
        remainingweight -= quantity * item.weight()
      }
    }
    return mutation
  }

  // replacing an item with other items
  if (!isEmpty(mutation) && length(mutation) < length(geneset) && _.random(0, 4) === 0) {
    let index = _.random(0, length(mutation) - 1)
    let itemq = mutation[index]
    mutation = remove(index, 1, mutation)
    remainingweight += itemq.quantity() * itemq.resource().weight()

    let
    sortedIndex = findIndex(r => r.name() === itemq.resource().name(), geneset),
    start = max(1, sortedIndex - slidingwindow.size),
    stop = min(length(geneset) - 1, sortedIndex + slidingwindow.size),
    item = geneset[_.random(start, stop + 1)]

    if (!item) {
      return mutation
    }

    let quantity = _max(remainingweight, item)

    if (quantity > 0) {
      mutation.push(ResourceQuantity(item, quantity))
    }
    return mutation
  }

  return mutation
})

fetchUrl(
  'https://raw.githubusercontent.com/henriquebecker91/masters/master/data/ukp/exnsd16.ukp',
  (err, meta, body) => {
    if (err) {
      log(err)
      return
    }

    let
    data = body.toString(),
    beginResources = false,
    beginSolution = false,
    resources = [],
    resourceindex = 0,
    solution = [],
    maxweight

    for (let line of split('\n', data)) {
      if (startsWith('c: ', line)) {
        maxweight = unary(parseInt)(split(' ', line)[1])
      } else if (startsWith('begin data', line)) {
        beginResources = true
      } else if (startsWith('end data', line)) {
        beginResources = false
      } else if (beginResources) {
        let resource = compose(
          apply(Resource(toString(resourceindex++))),
          map(unary(parseInt)),
          converge(Array.of, [nth(1), nth(2)]),
          match(/([0-9]+)\s([0-9]+)/)
        )(line)
        resources.push(resource)
      } else if (startsWith('sol:', line)) {
        beginSolution = true
      } else if (startsWith('Best_Item', line)) {
        beginSolution = false
        break
      } else if (beginSolution && !isEmpty(trim(line))) {
        solution.push(compose(
          over(lensIndex(0), dec), // uses indexes starting at 1 instead of 0
          map(unary(parseInt)),
          reject(isEmpty),
          split('\t'),
          trim
          )(line))
      }
    }

    log('maxweight', maxweight)
    log('solution', solution)

    let optimalfitness = compose(
      fitness,
      map(([index, quantity]) => ResourceQuantity(resources[index], quantity))
    )(solution)

    log('optimalfitness', optimalfitness.totalweight(), optimalfitness.totalvalue())

    const
    _display = curry((start, genes, fitness) => {
      log(
        Date.now() - start,
        fitness.totalvalue() + ': ' + map(itemq => itemq.resource().name() + '[' + itemq.quantity() + ']', genes)
      )
    }),

    display = _display(Date.now()),

    create = () => _create(maxweight, resources),

    slidingwindow = Window(
      1,
      max(1, Math.floor(length(resources) / 3)),
      Math.floor(length(resources) / 2)
    ),

    mutate = _mutate(maxweight, sort((a, b) => a.value() - b.value(), resources), slidingwindow),

    // optimalfitness = fitness([ItemQuantity(flour, 1), ItemQuantity(butter, 14), ItemQuantity(sugar, 6)]),

    engine = genetic(fitness, length(resources), optimalfitness, resources, display, mutate, create, 50)

    engine.getbest()

  }
)
