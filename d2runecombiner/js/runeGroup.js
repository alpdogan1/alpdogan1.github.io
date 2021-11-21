function RuneGroup(name, count) {
    this.name = name.toLowerCase();
    this.count = count;
}

RuneGroup.prototype.isSameType = function (group) {
    return this.name.toLowerCase() === group.name.toLowerCase();
};