/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('util');
 * mod.thing == 'a thing'; // true
 */
let util = {
    spawnCreep: (spawnPoint, role, name, body = [WORK, WORK, CARRY, CARRY, MOVE, MOVE]) => {
        let result = spawnPoint.spawnCreep(body, name, {memory: {role: role}});
        if (result == OK) {
            console.log('spawned ' + role + ' with name:' + name + ', with body:' + body);
        }
        return result;
    },
    printAllCreeps: () => {
        for (let name in Game.creeps) {
            let creep = Game.creeps[name];
            console.log(name + " and " + creep.pos + ' with time:' + creep.ticksToLive + " | role:" + creep.memory.role);
        }
        return _.keys(Game.creeps).length;
    },
    getClosest: (creep, structures, typeFirst = STRUCTURE_CONTAINER) => {
        let pos = creep.pos;
        let minRange = 99999;
        let closest;
        for(let s of structures) {
            if(s.structureType === typeFirst && closest && closest.structureType !== typeFirst) {
                closest = s;
                continue;
            }
            if(closest && closest.structureType === typeFirst && s.structureType !== typeFirst) {
                continue;
            }
            let range = creep.pos.getRangeTo(s);
            if(range < minRange) {
                minRange = range;
                closest = s;
            }
        }
        return closest;
    },
    logCpu: (msg) => console.log(msg + Game.cpu.getUsed())
};
module.exports = util;