/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('defence');
 * mod.thing == 'a thing'; // true
 */
const whitelist = ['KevinH'];

function tickTower() {
    let towers = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
        let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
            filter: obj => whitelist.indexOf(obj.owner.name) == -1
        });
        if (target) {
            tower.attack(target);
        } else if (target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {filter: (creep) => creep.hits < creep.hitsMax})) {
            tower.heal(target);
        } else {
            let targets = _.sortBy(tower.room.find(FIND_STRUCTURES, {
                filter: structure => structure.hits < structure.hitsMax
            }), 'hits');
            if (target = targets[0]) {
                if (tower.store[RESOURCE_ENERGY] > 750 || target.hits < 5000) {
                    tower.repair(target);
                }
            }
        }
    }
}

function open() {
    let remparts = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_RAMPART);
    for (let rempart of remparts) {
        rempart.setPublic(false);
    }
    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        let targets = room.find(FIND_HOSTILE_CREEPS);
        for (let target of targets) {
            if (whitelist.indexOf(target.owner.name) !== -1) {
                let direction = target.getDirectionTo();
                console.log(direction);
            }
        }
    }
}

module.exports = {
    tick: () => {
        tickTower();
        open();
    }
};