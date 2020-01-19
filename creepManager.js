/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creepManager');
 * mod.thing == 'a thing'; // true
 */
const util = require('util')
const roles = {
    'harvester': {
        role: require('role.harvester'),
        isNeed: (num) => num < 3 || (_.filter(Game.creeps, c => c.memory.role === 'energygetter' && c.ticksToLive > 100).length && num < 4),
        key: true,
        body: [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
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
        body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
    },
    'builder': {
        role: require('role.builder'),
        isNeed: (num) => num < 2 && Game.rooms['W26S12'].find(FIND_CONSTRUCTION_SITES).length > 0,
        body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
    }
};

function createCreepName(name) {
    let i = 0;
    while (Game.creeps[name + i]) {
        ++i;
    }
    name = name + i;
    delete Memory.creeps[name];
    return name;
}

let nowCreeps = {};
function checkCreep(spawnPoint = 'Spawn1', logMissing = false) {
    if (Game.spawns[spawnPoint].isActive) {
        let onlyKey = false;
        for (let roleName in roles) {
            let roledCreeps = nowCreeps[roleName].left;
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

function tick() {
    nowCreeps = {};
    for (let roleName in roles) {
        let role = roles[roleName];
        if (role.role.tickInit) {
            role.role.tickInit();
        }
        nowCreeps[roleName] = {left: 0};
    }
    for (let name in Game.creeps) {
        try {
            let creep = Game.creeps[name];
            let creepRole = creep.memory.role;
            roles[creepRole].role.run(creep);
            if(creepRole) {
                ++nowCreeps[creepRole].left;
            }
        } catch(e) {
            console.log(e.stack);
        }
    }
    checkCreep();
}
module.exports = {
    tick: () => tick()
};