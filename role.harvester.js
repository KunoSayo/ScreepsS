/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */
const util = require('util');
const goingManager = require('goingManager');
const sourceFilter = (structure) => {
    let type = structure.structureType;
    if((type === STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) >= 150)) {
        return true;
    } else if(type === STRUCTURE_STORAGE && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 100000) {
        return true;
    }
}
let sources = {};
let roleHaverster = {
    tickInit: () => {
        sources = {};
    },
    /** @param {Creep} creep **/
    run: function (creep) {
        const creepRoomName = creep.pos.roomName.toString();
        if (creep.memory.transfer && creep.store.getUsedCapacity() === 0) {
            creep.memory.transfer = false;
        } else if (!creep.memory.transfer && creep.store.getFreeCapacity() === 0) {
            creep.memory.transfer = true;
        }
        if (!creep.memory.transfer) {
            let source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            if(goingManager.shouldAndGoDropped(creep, source)) {
                return;
            }
            if(!sources[creepRoomName]) {
                sources[creepRoomName] = {strctures: creep.room.find(FIND_STRUCTURES, {filter: sourceFilter})};
            }
            source = util.getClosest(creep, sources[creepRoomName].strctures);
            if (source) {
                if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 99});
                    return;
                }
            }
            if (source = creep.pos.findClosestByPath(FIND_SOURCES)) {
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 99});
                }
            } else {
                creep.memory.transfer = true;
            }
        } else {
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_TOWER) && structure.store.getUsedCapacity(RESOURCE_ENERGY) < 500;
                }
            });
            let resType = _.keys(creep.store)[0];
            if (target && resType == RESOURCE_ENERGY) {
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 99});
                    creep.say("go tower");
                }
            } else if ((creep.store[RESOURCE_ENERGY] > 0) && (target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    let type = structure.structureType;
                    let isTypeRight = (type === STRUCTURE_EXTENSION || type == STRUCTURE_LINK || type === STRUCTURE_SPAWN || type === STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    return isTypeRight && (!goingManager.isWent(structure.pos.toString()) || structure.store.getFreeCapacity(RESOURCE_ENERGY) > 150);
                }
            }))) {
                let result;
                creep.say(target.structureType);
                goingManager.goTo(creep, target);
                if ((result = creep.transfer(target, resType)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#0000ff'}, reusePath: 99});
                } else if (result !== OK) {
                    console.log("transfer failed with " + target + ' ' + result)
                }
            } else if(target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType === STRUCTURE_STORAGE && structure.store.getFreeCapacity(resType) > 0
            })) {
                let result;
                if ((result = creep.transfer(target, resType)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#0000ff'}, reusePath: 99});
                } else if (result !== OK) {
                    console.log("transfer failed with " + target + ' ' + result)
                }
            } else {
                creep.memory.transfer = false;
                creep.moveTo(Game.flags['NOTHING']);
            }
        }
    }
};
module.exports = {
    run: (creep) => roleHaverster.run(creep),
    tickInit: () => roleHaverster.tickInit()
};