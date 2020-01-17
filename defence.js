/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('defence');
 * mod.thing == 'a thing'; // true
 */
const whitelist = ['KevinH'];
let willGGStr;
function tickTower(tower) {
    let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: obj => whitelist.indexOf(obj.owner.name) == -1
    });
    
    if (target) {
        tower.attack(target);
    } else if (target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {filter: (creep) => creep.hits < creep.hitsMax})) {
        tower.heal(target);
    } else {
                // let targets = _.sortBy(tower.room.find(FIND_STRUCTURES, {
            // filter: structure => structure.hits < structure.hitsMax
        // }), 'hits');
        if (target = willGGStr) {
            if (tower.store[RESOURCE_ENERGY] > 750 || target.hits < 5000) {
                tower.repair(target);
            }
        }
    }
}

function tickRempart(rampart) {
    rampart.setPublic(false);
}

module.exports = {
    tick: () => {
        for(let name in Game.structures) {
            let structure = Game.structures[name];
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
                if((!willGGStr) || structure.hits < willGGStr.hits) {
                    willGGStr = structure;
                }
            }
        }
    }
};