const roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('harvest');
        } else if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
            creep.say('build');
        }

        if (creep.memory.building) {
            const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (target) {
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if (!creep.room.find(FIND_CONSTRUCTION_SITES).length) {
                if (Game.spawns['Spawn1'].recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns['Spawn1']);
                }
            }
        } else {
            let source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            if (source) {
                if (creep.pickup(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
                return;
            }
            if (source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: structure => structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 50000
            })) {
                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#00FF00'}});
                }
            } else if (source = creep.pos.findClosestByPath(FIND_SOURCES)) {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
    }
};
module.exports = roleBuilder;