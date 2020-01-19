/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('link');
 * mod.thing == 'a thing'; // true
 */
const senders = ['5e2166ec3938700dc96e6c88'];
const receivers = ['5e229d0ff9d0a63ba16ee1e7'];
function tick() {
    for(let senderID of senders) {
        let sender = Game.getObjectById(senderID);
        if(sender.cooldown === 0) {
            for(let receiverID of receivers) {
                let receiver = Game.getObjectById(receiverID);
                if(receiver.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    sender.transferEnergy(receiver);
                }
            }
        }
    }
}
module.exports = {
    tick: () => tick()
};