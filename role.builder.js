function build(creep, shouldMove) {
    let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if(target) {
        if(creep.build(target) === ERR_NOT_IN_RANGE && shouldMove) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 99});
        }
    } else if (!creep.room.find(FIND_CONSTRUCTION_SITES).length) {
        if (Game.spawns['Spawn1'].recycleCreep(creep) == ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.spawns['Spawn1']);
        }
    }
}

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
            build(creep, true);
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
                let result;
                if ((result = creep.withdraw(source, RESOURCE_ENERGY)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#00FF00'}});
                }
                if(result !== OK) {
                    build(creep, false);
                }
            } else if (source = creep.pos.findClosestByPath(FIND_SOURCES)) {
                let result;
                if ((result = creep.harvest(source)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                if(result !== OK) {
                    build(creep, false);
                }
            }
        }
    }
};
module.exports = {
    run: (creep) => roleBuilder.run(creep)
}