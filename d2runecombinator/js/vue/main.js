let app = new Vue({
    el: '#app',
    data: function (){
        return {
            runeGroups: [
            ],
            combinedGroups: [],
            requiredGems: []
        }
    },
    methods: {
        calculateHighest() {
            this.requiredGems = [];

            let runes = _.clone(this.runeGroups);
            let upgrading = true;
            while(upgrading) {
                let combiningRunes = [];

                upgrading = false;

                _.forEach(runes, (group) => {
                    let combinationResult = runeCombination.upgradeRuneGroup(group);

                    _.forEach(combinationResult.groups, (cg) => {

                        combiningRunes.push(cg);

                        if(combinationResult.gem != null)
                            this.addRequiredGem(combinationResult.gem);

                    });
                    upgrading ||= combinationResult.isCombined;
                });

                runes = combiningRunes

                // Combine
                runes = runeCombination.combineRuneGroups(runes);

            }

            this.combinedGroups = runes;
        },
        addRequiredGem(gemName) {
            let found = _.find(this.requiredGems, (gemData)=>{
                return gemData.name === gemName;
            });

            if(found != null) {
                found.count++;
            }
            else {
                this.requiredGems.push(new GemData(gemName, 1));
            }
        },
        addRuneGroup(runeName) {
            // Return if group already exists
            let runeExists = _.some(this.runeGroups, (runeGroup)=>{
                return runeGroup.name.toLowerCase() === runeName.toLowerCase();
            });
            if(runeExists) return;

            let newRuneGroup = new RuneGroup(runeName.toLowerCase(), 1);
            this.runeGroups.push(newRuneGroup);
        },
        deleteRuneGroup(group) {
            // console.log(group.name);
            this.removeArrayItem(this.runeGroups, group);
            this.calculateHighest();
        },
        removeArrayItem(array, item) {
            const index = array.indexOf(item);
            if (index > -1) {
                array.splice(index, 1);
            }
        }
    },
    computed: {
    },
    mounted (){},
    template: `
<div>

<section class="section">
    <div class="container">
        <add-rune-view @select="addRuneGroup"></add-rune-view>
    </div>
    <div class="container box">
        <div v-for="runeGroup in runeGroups" class="rune-list" id="rune-list">
            <rune-view :runeGroup='runeGroup' @requestDelete='deleteRuneGroup($event)' @countChange='calculateHighest'></rune-view>
        </div>
    </div>
    <div class="section">
        <div class="container">
            <div class="field is-grouped">
                <p class="control"><a class="button is-success" @click="calculateHighest">Get Highest Runes</a></p>
            </div>
        </div>
        <div class="container box">
            <div v-for="runeGroup in combinedGroups" class="rune-list" id="rune-list">
            <rune-view :runeGroup='runeGroup' :is-editable='false'></rune-view>
        </div>
        <div class="container box">
            <div v-for="gemData in requiredGems" class="gem-list" id="gem-list">
            {{gemData.count}} x {{gemData.name}}
            </div>
        </div>
        </div>
    </div>
</section>
    
    
</div>
    `
})

function GemData(name, count) {
    this.name = name;
    this.count = count;
}