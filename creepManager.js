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
        isNeed: (num) => num < 3,
        key: true,
        body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
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
        isNeed: (num) => num < 2,
        key: true,
        spawns: ["US", "Spawn1"],
        body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
    },
    'builder': {
        role: require('role.builder'),
        isNeed: (num) => num < (_.keys(Game.constructionSites).length / 20 + 1) && Game.rooms['W31S8'].find(FIND_CONSTRUCTION_SITES).length > 0,
        body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
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
    let room;
    if (Game.spawns[spawnPoint] && Game.spawns[spawnPoint].isActive()) {
        room = Game.spawns[spawnPoint].room;
    }
    let onlyKey = false;
    for (let roleName in roles) {
        // console.log("check " + roleName);
        let count = room ? (nowCreeps[room] ? (nowCreeps[room][roleName] ? nowCreeps[room][roleName].left : 0) : 0) : 0;
        let role = roles[roleName];
        let spawn = Game.spawns[role.spawns ? role.spawns[0] : spawnPoint];
        if (!spawn) {
            spawn = Game.spawns[spawnPoint];
        }
        if (count < 2 && !role.disabled && role.key && (spawn.room && spawn.room.energyAvailable <= 2000)) {
            let result = util.spawnCreep(spawn, roleName, createCreepName('[ERR]' + roleName), [WORK, WORK, CARRY, MOVE]);
            if (result === OK) {
                Game.notify("spawned error creep for key role: " + roleName);
                return;
            } else {
                console.log("Can't spawn creep for error! :" + result);
            }
        } else if (!onlyKey && role.isNeed(count) && !role.disabled) {
            // console.log("normal spawn check");
            let result = util.spawnCreep(spawn, roleName, createCreepName(roleName), role.body);
            if (result === ERR_NOT_ENOUGH_ENERGY) {
                console.log("not energy");
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

function tick() {
    nowCreeps = {};
    for (let roleName in roles) {
        let role = roles[roleName];
        if (role.role.tickInit) {
            role.role.tickInit();
        }
    }
    for (let name in Game.creeps) {
        try {
            let creep = Game.creeps[name];
            let room = creep.room;
            let creepRole = creep.memory.role;
            if(creepRole) {
                roles[creepRole].role.run(creep);
                if(!nowCreeps[room]) {
                    nowCreeps[room] = {};
                }
                if(!nowCreeps[room][creepRole]) {
                    nowCreeps[room][creepRole] = {left: 0};
                }
                ++nowCreeps[room][creepRole].left;
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