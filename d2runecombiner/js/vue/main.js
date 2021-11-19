let app = new Vue({
    el: '#app',
    data: function (){
        return {
            runeGroups: [
                new RuneGroup("ber", 3),
                new RuneGroup("eth", 3)
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

                    // Add runes
                    _.forEach(combinationResult.groups, (cg) => {
                        combiningRunes.push(cg);
                    });
                    // Add gems
                    if(combinationResult.gem != null)
                        this.addRequiredGem(combinationResult.gem, combinationResult.gemCount);

                    upgrading ||= combinationResult.isCombined;
                });

                runes = combiningRunes

                // Combine
                runes = runeCombination.combineRuneGroups(runes);

            }

            this.combinedGroups = runes;
        },
        addRequiredGem(gemName, gemCount) {
            let found = _.find(this.requiredGems, (gemData)=>{
                return gemData.name === gemName;
            });

            if(found != null) {
                found.count += gemCount;
            }
            else {
                this.requiredGems.push(new GemData(gemName, gemCount));
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
            this.saveToLocal();
        },
        deleteRuneGroup(group) {
            // console.log(group.name);
            this.removeArrayItem(this.runeGroups, group);
            this.calculateHighest();
            this.saveToLocal();
        },
        onRuneCountChange() {
            this.calculateHighest();
            this.saveToLocal();
        },
        removeArrayItem(array, item) {
            const index = array.indexOf(item);
            if (index > -1) {
                array.splice(index, 1);
            }
        },
        saveToLocal() {
            let runesJson = JSON.stringify(this.runeGroups);
            localStorage.setItem("d2runecombiner", runesJson);
        },
        loadFromLocal() {
            let parsedRunes = JSON.parse(localStorage.getItem("d2runecombiner"));
            if(parsedRunes == null) return;
            if(!Array.isArray(parsedRunes)) return;

            for (const parsedRunesKey in parsedRunes) {
                let runeObj = parsedRunes[parsedRunesKey];
                Object.setPrototypeOf(runeObj, RuneGroup.prototype);
            }

            this.runeGroups = parsedRunes;
            console.log(parsedRunes);
        }
    },
    computed: {
    },
    mounted (){
        this.loadFromLocal();
        this.calculateHighest();
    },
    template: `
<section class="section">

<h1 class="main-header common-header">D2 Rune Combiner <span class="main-header-note">beta</span></h1>
        
<div class="container">
    <div class="box">
        <p>
            <p>Enter your current rune count and calculate highest runes possible and required gems for to combine them.</p>
            <p>Add using input box and change rune counts. <strong>Use Shift to increase/decrease by 5.</strong></p>
        </p> 
</div>
<div class="box">
    <div>
        <h2 class="common-header">Add Runes</h2>
        <add-rune-view @select="addRuneGroup"></add-rune-view>
    </div>
    <!-- RUNES -->
    <div class="rune-list common-list">
        <div v-if="runeGroups.length <= 0">Add runes to view highest combinations</div>
        <div v-for="runeGroup in runeGroups">
            <rune-view :runeGroup='runeGroup' @requestDelete='deleteRuneGroup($event)' @countChange='onRuneCountChange'></rune-view>
        </div>
    </div>
</div>
<div v-if="combinedGroups.length > 0" class="container box">
    <!-- RUNES RESULT -->
    <h2 class="common-header">Highest Runes</h2>
    <div class="rune-result-list common-list">
        <div v-for="runeGroup in combinedGroups" >
            <rune-view :runeGroup='runeGroup' :is-editable='false'></rune-view>
        </div>
    </div>
    <!-- GEMS -->
    <div v-if="requiredGems.length > 0">
        <h2 class="common-header">Required Gems</h2>
        <div class="gem-list common-list">
            <div v-for="gemData in requiredGems" class="gem-list" id="gem-list">
            {{gemData.count}} x <strong>{{gemData.name}}</strong>
            </div>
        </div>
    </div>
</div>
<!--</section>-->
    </div>
    
    
</section>
    `
})

function GemData(name, count) {
    this.name = name;
    this.count = count;
}