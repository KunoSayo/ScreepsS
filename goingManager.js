/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('goingManager');
 * mod.thing == 'a thing'; // true
 */
let goings = {}
function tick() {
    goings = {}
}

function shouldAndGoDropped(creep, res) {
    if(res && res.amount) {
        const key = res.pos.toString();
        let data = goings[key];
        const resType = _.keys(res.store)[0];
        if(!data) {
            data = goings[key] = {
                left: res.amount
            }
        }
        if(data.left > 0) {
            goings[key].left = data.left - creep.store.getFreeCapacity(resType);
            if(creep.pickup(res) === ERR_NOT_IN_RANGE) {
                creep.moveTo(res, {reusePath: 99});
                creep.say('go dropped');
            }
            return true;
        }
    }
    return false;
}

module.exports = {
    tick: () => tick(),
    shouldAndGoDropped: (creep, res) => shouldAndGoDropped(creep, res)
};