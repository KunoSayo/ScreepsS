const tickTasks = {
    link: require('link'),
    creepManager: require('creepManager'),
    goingManager: require('goingManager'),
    defence: require('defence')
};

module.exports.loop = function () {
    for (let taskName in tickTasks) {
        try {
            tickTasks[taskName].tick();
        } catch(e) {
            console.log(e.stack);
            Game.notify(e.stack);
        }
    }
};