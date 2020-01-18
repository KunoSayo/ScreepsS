const roles = {
    'harvester': {
        role: require('role.harvester'),
        isNeed: (num) => num < 3 || (_.filter(Game.creeps, c => c.memory.role === 'energygetter' && c.ticksToLive > 100).length && num < 4),
        key: true,
        body: [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
    },
    "energygetter": {
        role: require('role.energygetter'),
        isNeed: (num) => {
            if (num > 2) {
                return false;
            }
            for (let flag of _.filter(Game.flags, (flag) => flag.memory.E)) {
                let hasCreep = false;
                for (let obj of flag.pos.look()) {
                    if (obj.type === LOOK_CREEPS) {
                        hasCreep = true;
                        let creep = obj[LOOK_CREEPS];
                        if (creep.memory.role !== 'energygetter' || creep.ticksToLive < 100) {
                            return true;
                        }
                    }
                }
                if (!hasCreep) {
                    return true;
                }
            }
            return false;
        },
        body: [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE]
    },
    'upgrader': {
        role: require('role.upgrader'),
        isNeed: (num) => num < 5,
        key: true,
        body: [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
    },
    'builder': {
        role: require('role.builder'),
        isNeed: (num) => num < 2 && Game.rooms['W26S12'].find(FIND_CONSTRUCTION_SITES).length > 0,
        body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE]
    }
};
const tickTasks = {
    defence: require('defence')
};
const util = require('util');

function createCreepName(name) {
    let i = 0;
    while (Game.creeps[name + i]) {
        ++i;
    }
    name = name + i;
    delete Memory.creeps[name];
    return name;
}

function checkCreep(spawnPoint = 'Spawn1', logMissing = false) {
    if (Game.spawns[spawnPoint].isActive) {
        let onlyKey = false;
        for (let roleName in roles) {
            let roledCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === roleName);
            let spawn = Game.spawns[spawnPoint];
            let role = roles[roleName];
            let count = roledCreeps.length;
            if (count < 2 && !role.disabled && role.key && spawn.room.energyAvailable <= 500) {
                let result = util.spawnCreep(spawn, roleName, createCreepName('[ERR]' + roleName), [WORK, WORK, CARRY, MOVE]);
                if (result === OK) {
                    return;
                } else {
                    console.log("Can't spawn creep for error! :" + result);
                }
            } else if (!onlyKey && role.isNeed(count) && !role.disabled) {
                let result = util.spawnCreep(spawn, roleName, createCreepName(roleName), role.body);
                if (result === ERR_NOT_ENOUGH_ENERGY) {
                    onlyKey = true;
                    if (spawn.room.energyAvailable === spawn.room.energyCapacityAvailable) {
                        console.log(`spawn ${roleName} failed by not enough E (even max)`);
                    }
                } else if (result === OK) {
                    return;
                }
            }
        }
    }
}

function getTombstone() {
    for (let roomName in Game.rooms) {
        let ggs = Game.rooms[roomName].find(FIND_TOMBSTONES);
        if (ggs && ggs.length > 0) {
            let movedCreep = {};
            for (let i in ggs) {
                if(ggs[i].getUsedCapacity == 0) {
                    continue;
                }
                let resType = _.keys(ggs[i].store)[0];
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
}

module.exports.loop = function () {
    checkCreep();
    for (let roleName in roles) {
        let role = roles[roleName];
        if (role.role.tickInit) {
            role.role.tickInit();
        }
    }
    for (let name in Game.creeps) {
        try {
            let creep = Game.creeps[name];
            roles[creep.memory.role].role.run(creep);
        } catch(e) {
            console.log(e.stack)
        }
    }
    getTombstone();
    for (let taskName in tickTasks) {
        tickTasks[taskName].tick();
    }
};