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

function isWent(key) {
    return goings[key] !== undefined;
}
function goTo(creep, s) {
    goings[s.pos.toString()] = {who: creep.id};
}

function transferAndGoStr(creep, s) {
    const key = s.pos.toString();
    if(!goings[key]) {
        goings[key] = {who: creep.id};
        if(creep.transfer(s, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(s, {reusePath: 99});
        }
        return true
    }
    return false;
}

function shouldAndWithdraw(creep, s, type, move = true) {
    if(s && type && s.store.getUsedCapacity(type) > 0) {
        const key = s.pos.toString();
        let data = goings[key];
        if(!data) {
            data = goings[key] = {
                left: s.store.getUsedCapacity(type)
            }
        }
        if(move && data.left > 0) {
            goings[key].left = data.left - creep.store.getFreeCapacity(resType);
            if(creep.withdraw(s, type) === ERR_NOT_IN_RANGE) {
                creep.moveTo(s, {reusePath: 99});
                creep.say('go dropped');
            }
            return true;
        }
        return data.left > 0;
    }
    return false;
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
    shouldAndGoDropped: (creep, res) => shouldAndGoDropped(creep, res),
    isWent: isWent,
    transferAndGoStr: (creep, s) => transferAndGoStr(creep, s),
    goTo: goTo
};