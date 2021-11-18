function RuneCombination (runesCombinationConfig) {

    this.upgradeRuneGroup = function (runeGroup) {
        let config = _.find(runesCombinationConfig, (rc)=>{
            return rc.name.toLowerCase() === runeGroup.name.toLowerCase();
        });

        if(config == null || config.nextRune == null) {
            // console.error(`Can't find config for ${runeGroup.name}`)
            return new GroupCombinationResult([runeGroup], false);  // No combination;
        }

        let combinedCount = runeGroup.count / config.count;
        if(combinedCount < 1) return new GroupCombinationResult([runeGroup], false);  // No combination

        let nextRuneCount = Math.floor(combinedCount);
        let remaining = runeGroup.count % config.count;

        let nextRuneGroup = new RuneGroup(config.nextRune, nextRuneCount);
        let groups = [nextRuneGroup];

        if(remaining > 0) {
            let remainingGroup = new RuneGroup(runeGroup.name, remaining);
            groups.push(remainingGroup);
        }

        return new GroupCombinationResult(groups, true, config.gem);
    }

    this.combineRuneGroups = function (runeGroupArray) {
        let combinedGroups = [];
        for (const groupIndex in runeGroupArray) {
            let group = runeGroupArray[groupIndex];
            let found = _.find(combinedGroups, (cg)=> {return group.name === cg.name });
            if(found != null) {
                found.count += group.count;
            }
            else {
                combinedGroups.push(group);
            }
        }
        return combinedGroups;
    }

}

let runeCombination = new RuneCombination(runesCombinationConfig);

function GroupCombinationResult(groups, isCombined, gem) {
    this.groups = groups;
    this.isCombined = isCombined;
    this.gem = gem;
}