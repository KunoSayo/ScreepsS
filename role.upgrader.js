const storageFilter = (structure) => (structure.structureType === STRUCTURE_STORAGE) && structure.store.getUsedCapacity(RESOURCE_ENERGY) >= 500000;
let sources = {};
const roleUpgrader = {
    tickInit: () => {
        sources = {};
    },
    /** @param {Creep} creep **/
    run: function (creep) {
        const creepRoomName = creep.room.name.toString();
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.upgrading = false;
            creep.say('harvest');
        } else if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
            creep.memory.upgrading = true;
            creep.say('upgrade');
        }

        if (creep.memory.upgrading) {
            
            if (creep.upgradeController(Game.rooms[_.keys(Game.rooms)[0]].controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.rooms[_.keys(Game.rooms)[0]].controller, {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 0});
            }
        } else {
            let source = Game.getObjectById('5e229d0ff9d0a63ba16ee1e7')
            if(creep.pos.getRangeTo(source) < 5) {
                if(source.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    if(creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                        creep.say("go link");
                    }
                    creep.memory.upgrading = true;
                    return;
                }
            }
            if(!sources[creepRoomName]) {
                sources[creepRoomName] = {storage: creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: storageFilter
                    })
                }
            }
            source = sources[creepRoomName].storage;
            if (source) {
                if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 99});
                    return;
                }
            }
            source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (!source) {
                source = Game.getObjectById('5e229d0ff9d0a63ba16ee1e7');
            }
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 99});
            }
        }
    }
};

module.exports = {
    run: creep => roleUpgrader.run(creep),
    tickInit: () => roleUpgrader.tickInit()
};