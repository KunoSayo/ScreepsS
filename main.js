const tickTasks = {
    defence: require('defence'),
    link: require('link'),
    creepManager: require('creepManager'),
    goingManager: require('goingManager')
};

module.exports.loop = function () {
    for (let taskName in tickTasks) {
        try {
            tickTasks[taskName].tick();
        } catch(e) {
            console.log(e.stack);
        }
    }
};