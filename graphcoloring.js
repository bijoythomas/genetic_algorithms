/* eslint-disable no-sync */
const {apply, compose, curry, filter, fromPairs, head, length, map, o, pair, reduce, split, zip} = require('ramda')
const genetic = require('./genetic')
const {log} = console

const
adjmap = `AK,
AL,FL;GA;MS;TN
AR,LA;MO;MS;OK;TN;TX
AZ,CA;NM;NV;UT
CA,AZ;NV;OR
CO,KS;NE;NM;OK;UT;WY
CT,MA;NY;RI
DC,MD;VA
DE,MD;NJ;PA
FL,AL;GA
GA,AL;FL;NC;SC;TN
HI,
IA,IL;MN;MO;NE;SD;WI
ID,MT;NV;OR;UT;WA;WY
IL,IA;IN;KY;MO;WI
IN,IL;KY;MI;OH
KS,CO;MO;NE;OK
KY,IL;IN;MO;OH;TN;VA;WV
LA,AR;MS;TX
MA,CT;NH;NY;RI;VT
MD,DC;DE;PA;VA;WV
ME,NH
MI,IN;OH;WI
MN,IA;ND;SD;WI
MO,AR;IA;IL;KS;KY;NE;OK;TN
MS,AL;AR;LA;TN
MT,ID;ND;SD;WY
NC,GA;SC;TN;VA
ND,MN;MT;SD
NE,CO;IA;KS;MO;SD;WY
NH,MA;ME;VT
NJ,DE;NY;PA
NM,AZ;CO;OK;TX
NV,AZ;CA;ID;OR;UT
NY,CT;MA;NJ;PA;VT
OH,IN;KY;MI;PA;WV
OK,AR;CO;KS;MO;NM;TX
OR,CA;ID;NV;WA
PA,DE;MD;NJ;NY;OH;WV
RI,CT;MA
SC,GA;NC
SD,IA;MN;MT;ND;NE;WY
TN,AL;AR;GA;KY;MO;MS;NC;VA
TX,AR;LA;NM;OK
UT,AZ;CO;ID;NV;WY
VA,DC;KY;MD;NC;TN;WV
VT,MA;NH;NY
WA,ID;OR
WI,IA;IL;MI;MN
WV,KY;MD;OH;PA;VA
WY,CO;ID;MT;NE;SD;UT`,

geneset = ['orange', 'yellow', 'green', 'blue'],

graph = compose(
  map(([state, adjstring]) => [state, adjstring.split(';')]),
  map(line => o(apply(pair), split(','))(line)),
  split('\n')
)(adjmap),

states = graph.map(e => head(e)),

Fitness = total => ({
  total,
  isbetter: other => total < other.total,
  isequal: other => total === other.total
}),

graphtocolors = genes => compose(
  statecolormap => graph.map(([state, adjstates]) => [state, statecolormap[state], adjstates.map(st => st + '[' + statecolormap[st] + ']')]),
  compose(fromPairs, zip(states))
)(genes),

fitness = genes => {
  let statecolormap = compose(fromPairs, zip(states))(genes)
  let total = reduce((acc, [state, adjstates]) => {
    let statecolor = statecolormap[state]
    let adjcolors = adjstates.map(st => statecolormap[st])
    let numsamecolors = compose(
      length,
      filter(adjcolor => adjcolor === statecolor)
    )(adjcolors)
    return acc + numsamecolors
  }, 0, graph)

  return Fitness(total)
},

_display = curry((start, genes, fitness) => {
  log(graphtocolors(genes).map(([state, color, colors]) => state + '[' + color + '] :' + colors.join(', ') + '\n'))
  log(Date.now() - start, fitness.total)
}),


display = _display(Date.now()),

engine = genetic(fitness, length(graph), Fitness(0), geneset, display)

engine.getbest()
