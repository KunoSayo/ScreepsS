/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */
const util = require('util');
let goings = {};
const sourceFilter = (structure) => (structure.structureType === STRUCTURE_CONTAINER) && structure.store.getUsedCapacity(RESOURCE_ENERGY) >= 100 && (!goings[structure.pos.toString()] || structure.store.getFreeCapacity(RESOURCE_ENERGY) < 1000)
let sources = {};
let roleHaverster = {
    tickInit: () => {
        goings = {};
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
            if (source && source.getUsedCapacity > 0) {
                if (creep.pickup(source) === ERR_NOT_IN_RANGE) {
                    creep.say('go droped');
                    creep.moveTo(source);
                }
                return;
            }
            if(!sources[creepRoomName]) {
                sources[creepRoomName] = {strctures: creep.room.find(FIND_STRUCTURES, {filter: sourceFilter})};
            }
            source = util.getClosest(creep, sources[creepRoomName].strctures);
            if (source) {
                if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    let mark = source.pos.toString();
                    goings[mark] = true;
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                    return;
                }
            }
            if (source = creep.pos.findClosestByPath(FIND_SOURCES)) {
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
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
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.say("go tower");
                }
            } else if (target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    let isTypeRight = (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    if (isTypeRight && creep.store[RESOURCE_ENERGY] > 0) {
                        if (!goings[structure.pos.toString()]) {
                            return true;
                        }
                    } else if (structure.structureType === STRUCTURE_STORAGE && structure.store.getFreeCapacity(resType) > 0) {
                        return true;
                    }
                    return false;
                }
            })) {
                let result;
                if ((result = creep.transfer(target, resType)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#0000ff'}});
                } else if (result !== OK) {
                    console.log("transfer failed with " + target + ' ' + result)
                }
                goings[target.pos.toString()] = true;
            } else {
                creep.memory.transfer = false;
                creep.moveTo(Game.flags['NOTHING']);
            }
        }
    }
};
module.exports = roleHaverster;