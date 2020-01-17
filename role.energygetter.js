/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.energygetter');
 * mod.thing == 'a thing'; // true
 */
let roleEnergyGetter = {
    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.GODIENOW) {
            let spawn = Game.spawns['Spawn1'];
            if (spawn.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
            let target = creep.pos.findClosestByPath(FIND_SOURCES);
            if (target) {
                creep.harvest(target);
            }
            return;
        }
        let flags = creep.pos.lookFor(LOOK_FLAGS);
        if (flags.length == 0 || !flags[0].memory.E) {
            for (let flag of creep.room.find(FIND_FLAGS).filter(flag => flag.memory.E)) {
                let hasCreep = false;
                for (let obj of flag.pos.look()) {
                    if (obj.type == LOOK_CREEPS) {
                        hasCreep = true;
                        let lookcreep = obj[LOOK_CREEPS];
                        if (creep != lookcreep) {
                            if (lookcreep.memory.role === 'energygetter') {
                                if (lookcreep.ticksToLive < 100) {
                                    creep.moveTo(flag.pos, {visualizePathStyle: {stroke: '#FF0000'}});
                                    if (flag.pos.isNearTo(creep.pos)) {
                                        lookcreep.moveTo(creep.pos);
                                        lookcreep.memory.GODIENOW = true;
                                    }
                                }
                            } else {
                                creep.moveTo(flag.pos, {visualizePathStyle: {stroke: '#FF0000'}});
                                if (flag.pos.isNearTo(creep.pos)) {
                                    lookcreep.moveTo(creep.pos);
                                }
                            }
                        }
                    }
                }
                if (!hasCreep) {
                    creep.moveTo(flag.pos, {visualizePathStyle: {stroke: '#FF0000'}});
                }
            }
        }
        let target = creep.pos.findClosestByPath(FIND_SOURCES);
        if (target) {
            creep.harvest(target);
        }
    }
};
module.exports = roleEnergyGetter;