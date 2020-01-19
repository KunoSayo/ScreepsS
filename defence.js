/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('defence');
 * mod.thing == 'a thing'; // true
 */
const whitelist = ['KevinH'];
let ggs1;
function tickTower(tower) {
    let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: obj => whitelist.indexOf(obj.owner.username) == -1
    });
    
    if (target) {
        tower.attack(target);
    } else if (target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {filter: (creep) => creep.hits < creep.hitsMax})) {
        tower.heal(target);
    } else {
        // let targets = _.sortBy(tower.room.find(FIND_STRUCTURES, {
        //     filter: structure => structure.hits < structure.hitsMax
        // }), 'hits');
        if (target = Game.getObjectById(ggs1)) {
            if (tower.store[RESOURCE_ENERGY] > 750 || target.hits < 5000) {
                if(target.hits < target.hitsMax) {
                    tower.repair(target);
                }
            }
        }
    }
}

function tickRempart(rampart) {
    if(rampart.isPublic) {
        rampart.setPublic(false);
    }
}

function getTombStone(room) {
    let ggs = room.find(FIND_TOMBSTONES);
        if (ggs && ggs.length > 0) {
            let movedCreep = {};
            for (let i in ggs) {
                let resType = _.keys(ggs[i].store)[0];
                if(!resType) {
                    continue;
                }
                let creep = ggs[i].pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: (c) => {
                        if(c.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && ggs[i].store[RESOURCE_ENERGY] > 0) {
                            return !movedCreep[c.name];
                        } else if(c.store.getFreeCapacity(_.keys(ggs[i].store)[0]) > 0 && c.memory.role === 'harvester') {
                            return !movedCreep[c.name];
                        }
                        return false;
                    }
                });
                if(creep) {
                    let result = creep.withdraw(ggs[i], resType);
                    movedCreep[creep.name] = true;
                    if (result === ERR_NOT_IN_RANGE) {
                        console.log("move " + creep + " to get tombstone");
                        creep.moveTo(ggs[i]);
                    } else if (result !== OK) {
                        console.log("withdraw tombstone result:" + result);
                    }
                }
            }
        }
}

function tick() {
    let i = 0;
    for(let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        getTombStone(room);
        for(let structure of room.find(FIND_STRUCTURES)) {
            ++i;
            let type = structure.structureType;
            switch(type) {
                case STRUCTURE_TOWER: {
                    tickTower(structure);
                    break;
                }
                    case STRUCTURE_RAMPART: {
                    tickRempart(structure);
                    break;
                }
            }
            if(structure.hits < structure.hitsMax) {
                let ggstr = Game.getObjectById(ggs1);
                if((!ggstr) || (ggstr.hits === ggstr.hitsMax) || structure.hits < ggstr.hits) {
                    ggs1 = structure.id;
                }
            }
        }
    }
}

module.exports = {
    tick: () => tick()
};