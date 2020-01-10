/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('util');
 * mod.thing == 'a thing'; // true
 */
let util = {
    spawnCreep: (spawnPoint, role, name, body = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE]) => {
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
    }
};
module.exports = util;