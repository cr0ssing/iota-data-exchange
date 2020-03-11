const fs = require('fs');
const hash = require('object-hash');
const util = require('util');

evalFile('hashFromDatetag-pi.json');
evalFile('hashFromDatetag-desktop.json');
// evalFile(
//   'publish-desktop.json',
//   ['sideKeyCalculation', 'createMessage', 'attachMessage'],
//   ['mwm']
// );

function evalFile(
  name,
  durationFields = ['duration'],
  groupingFields = ['format']
) {
  try {
    const file = fs.readFileSync(name, 'utf8');
    const data = JSON.parse(file);
    const map = new Map();
    const hashes = new Map();
    let result;
    for (let point of data) {
      const group = groupingFields
        .map(n => ({ [n]: point[n] }))
        .reduce((acc, v) => ({ ...acc, ...v }));
      const key = hash(group);
      if (!map.has(key)) {
        map.set(key, []);
        hashes.set(key, group);
      }
      const stats = durationFields
        .map(k => ({ [k]: point[k] }))
        .reduce((acc, v) => ({ ...acc, ...v }));
      map.get(key).push(stats);
    }
    const absolute = new Map();
    Array.from(map.entries()).forEach(([key, value]) => {
      const getPoints = name => value.map(p => p[name]);
      const stats = durationFields
        .map(k => ({
          [k]: {
            min: Math.min(...getPoints(k)),
            max: Math.max(...getPoints(k)),
            avg: getPoints(k).reduce((acc, v) => acc + v) / getPoints(k).length,
          },
        }))
        .reduce((acc, v) => ({ ...acc, ...v }));

      absolute.set(hashes.get(key), stats);
    });
    if (durationFields.length > 1) {
      const relative = new Map();
      const sums = new Map();
      const props = ['min', 'max', 'avg'];
      Array.from(absolute.entries()).forEach(([key, value]) => {
        const groupSums = {};
        const groupPortions = {};

        props.forEach(prop => {
          const sum = durationFields
            .map(durationName => value[durationName][prop])
            .reduce((acc, v) => acc + v);
          groupSums[prop] = sum;

          groupPortions[prop] = durationFields
            .map(durationName => ({
              [durationName]: value[durationName][prop] / sum,
            }))
            .reduce((acc, v) => ({ ...acc, ...v }));
        });
        sums.set(key, groupSums);
        relative.set(key, groupPortions);

        result = {
          absolute,
          sums,
          relative,
        };
      });
    } else {
      result = absolute;
    }
    console.log(
      name + ':',
      util.inspect(result, false, null, true /* enable colors */)
    );
  } catch (err) {
    console.error(err);
  }
}
