let app = new Vue({
    el: '#app',
    data: function (){
        return {
            localStorageKey: "d2runecombinerSaveData",
            runeGroups: [
                new RuneGroup("ber", 3),
                new RuneGroup("eth", 3)
            ],
            combinedGroups: [],
            requiredGems: [],
            wantedRunes: [
                new RuneGroup("eth", 1)
            ],
            foundWantedRunes: [

            ]
        }
    },
    methods: {
        calculateHighest() {
            this.foundWantedRunes = [];
            this.requiredGems = [];
            let runeGroupsClone = _.clone(this.runeGroups);
            let wantedRunesClone = _.cloneDeep(this.wantedRunes);

            runeGroupsClone = this.reduceWantedRunes(runeGroupsClone, wantedRunesClone);
            let upgrading = true;
            while(upgrading) {
                let combiningRunes = [];

                upgrading = false;

                _.forEach(runeGroupsClone, (group) => {
                    let combinationResult = runeCombination.upgradeRuneGroup(group);

                    // Add runes
                    _.forEach(combinationResult.groups, (cg) => {
                        combiningRunes.push(cg);
                    });
                    // Add required gems
                    if(combinationResult.gem != null)
                        this.addRequiredGem(combinationResult.gem, combinationResult.gemCount);

                    upgrading ||= combinationResult.isCombined;
                });

                runeGroupsClone = combiningRunes

                // Combine
                runeGroupsClone = runeCombination.combineRuneGroups(runeGroupsClone);
                runeGroupsClone = this.reduceWantedRunes(runeGroupsClone, wantedRunesClone);
            }

            this.combinedGroups = runeGroupsClone;


            this.foundWantedRunes = runeCombination.combineRuneGroups(this.foundWantedRunes);

            function runeGroupExists(group) {
                    return group.count <= 0;
            }

            _.remove(this.combinedGroups, runeGroupExists);
            _.remove(this.foundWantedRunes, runeGroupExists);

            this.reorderLists();
        },
        reorderLists() {
            let sortByRuneIndex = function (runeGroupCollection) {
                return _.sortBy(runeGroupCollection, (group)=>{
                    return _.findIndex(runesCombinationConfig, (runeConfig)=>{
                        return runeConfig.name === group.name;
                    })
                });
            }

            this.runeGroups = sortByRuneIndex(this.runeGroups);
            this.combinedGroups = sortByRuneIndex(this.combinedGroups);
            this.wantedRunes = sortByRuneIndex(this.wantedRunes);
            this.foundWantedRunes = sortByRuneIndex(this.foundWantedRunes);

            this.requiredGems = _.sortBy(this.requiredGems, (gemGroup)=>{
                return _.findIndex(sortedGemsList, (sortedGemName)=>{
                    return sortedGemName === gemGroup.name;
                })
            });

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
        reduceWantedRunes(runeGroups, wantedRunes) {
            let runeGroupsClone = _.cloneDeep(runeGroups);


            for (const i in wantedRunes) {
                const wantedRuneGroup = wantedRunes[i];
                if(wantedRuneGroup.count === 0) continue;

                let foundGroup = _.find(runeGroupsClone, (group)=>{
                    return group.isSameType(wantedRuneGroup);
                });

                if(foundGroup == null) continue;

                let foundWantedRuneGroup = new RuneGroup(foundGroup.name, wantedRuneGroup.count);
                this.foundWantedRunes.push(foundWantedRuneGroup);

                foundGroup.count -= wantedRuneGroup.count;
                wantedRuneGroup.count = 0;

                // Found enough or less
                if(foundGroup.count <= 0) {
                    wantedRuneGroup.count = -foundGroup.count;
                    foundWantedRuneGroup.count += foundGroup.count;
                    // Remove found one
                    this.removeArrayItem(runeGroupsClone, foundGroup);
                }
            }

            return runeGroupsClone;
        },
        isWantedRuneGroupValid(wantedRuneGroup) {
            let found = _.find(this.foundWantedRunes, (foundWanted) => foundWanted.isSameType(wantedRuneGroup));
            if(found == null) return "none";
            if(found.count >= wantedRuneGroup.count) return "all";
            else return Math.floor( found.count / wantedRuneGroup.count * 100) + "%";
        },
        // RUNES
        addRuneGroup(runeName) {
            // Return if group already exists
            let runeExists = _.some(this.runeGroups, (runeGroup)=>{
                return runeGroup.name.toLowerCase() === runeName.toLowerCase();
            });
            if(runeExists) return;

            let newRuneGroup = new RuneGroup(runeName, 1);
            this.runeGroups.push(newRuneGroup);

            this.calculateHighest();
            this.saveToLocal();
        },
        deleteRuneGroup(group) {
            this.removeArrayItem(this.runeGroups, group);

            this.calculateHighest();
            this.saveToLocal();
        },
        addAllRunes(){
            for (const runesCombinationConfigKey in runesCombinationConfig) {
                const runeConfig = runesCombinationConfig[runesCombinationConfigKey];

                if(_.some(this.runeGroups, (runeGroup)=>{return runeConfig.name === runeGroup.name })) continue;

                this.runeGroups.push(new RuneGroup(runeConfig.name, 0));
                this.calculateHighest();
                this.saveToLocal();
            }
        },
        clearRunes() {
            this.runeGroups = [];
            this.calculateHighest();
            this.saveToLocal();
        },
        // WANTED RUNES
        addWantedRuneGroup(runeName) {
            // Return if group already exists
            let runeExists = _.some(this.wantedRunes, (runeGroup)=>{
                return runeGroup.name.toLowerCase() === runeName.toLowerCase();
            });
            if(runeExists) return;

            let newRuneGroup = new RuneGroup(runeName, 1);
            this.wantedRunes.push(newRuneGroup);

            this.calculateHighest();
            this.saveToLocal();
        },
        deleteWantedRuneGroup(group) {
            this.removeArrayItem(this.wantedRunes, group);

            this.calculateHighest();
            this.saveToLocal();
        },
        onRuneCountChange() {
            this.calculateHighest();
            this.saveToLocal();
        },
        // LOCAL STORAGE
        saveToLocal() {
            let saveData = {
                runes: this.runeGroups,
                wantedRunes: this.wantedRunes
            }

            let saveDataJson = JSON.stringify(saveData);
            localStorage.setItem(this.localStorageKey, saveDataJson);
        },
        loadFromLocal() {
            let parsedRunes = JSON.parse(localStorage.getItem(this.localStorageKey));
            // Check validity
            if(parsedRunes == null) return;                                                                 // No save data
            // if(!Array.isArray(parsedRunes)) return;
            if(typeof parsedRunes != "object") return;                                                      // Invalid save data
            if( parsedRunes.runes == null || parsedRunes.wantedRunes == null ||
                !Array.isArray(parsedRunes.runes) || !Array.isArray(parsedRunes.wantedRunes)) return;       // Invalid data

            // Add runes
            for (const i in parsedRunes.runes) {
                let runeObj = parsedRunes.runes[i];
                Object.setPrototypeOf(runeObj, RuneGroup.prototype);
            }
            this.runeGroups = parsedRunes.runes;

            // Add Wanted Runes
            for (const i in parsedRunes.wantedRunes) {
                let runeObj = parsedRunes.wantedRunes[i];
                Object.setPrototypeOf(runeObj, RuneGroup.prototype);
            }
            this.wantedRunes = parsedRunes.wantedRunes;
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
    mounted (){
        this.loadFromLocal();
        this.calculateHighest();
    },
    template: `
<section class="section">

        
<div class="container">
    <h1 class="main-header common-header">D2 Rune Combiner <span class="main-header-note">0.2 beta</span></h1>
    <div class="main-section-container">
    
    <!-- SECTION 2 - INPUT -->
        <div class="common-section">
            <div class="box">
                <p>
                    <p>Enter your current rune count and calculate <strong>highest runes possible and gems required</strong> to combine.</p>
                    <br>
                    <p>Add runes using input box and change count using buttons. <strong>Hold Shift to increase/decrease by 5.</strong></p>
                    <br>
                    <p>Reserve required runes to exclude them from combining. </p>
                </p> 
            </div>
            <div class="box">
                <!-- RUNES -->
                <!-- ADD -->
                <div>
                    <h2 class="common-header">Owned Runes</h2>
                    <add-rune-view @select="addRuneGroup">
                        <b-button class="add-all-runes-button" @click="addAllRunes">Add All Runes</b-button>
                        <b-button class="add-all-runes-button" type="is-danger is-light" @click="clearRunes">Clear</b-button>
                    </add-rune-view>
                </div>
                <!-- LIST -->
                <div class="rune-list common-list">
                    <div v-if="runeGroups.length <= 0">Add runes to view highest combinations.</div>
                    <div v-for="runeGroup in runeGroups">
                        <rune-view :runeGroup='runeGroup' @requestDelete='deleteRuneGroup($event)' @countChange='onRuneCountChange'></rune-view>
                    </div>
                </div>
                
                <!-- WANTEDRUNES -->
                <!-- ADD -->
                <div>
                    <h2 class="common-header">Reserved Runes</h2>
                    <add-rune-view @select="addWantedRuneGroup"></add-rune-view>
                </div>
                <!-- LIST -->
                <div class="rune-list common-list">
                    <div v-if="wantedRunes.length <= 0">Add reserved runes to exclude them from combining.</div>
                    <div v-for="runeGroup in wantedRunes">
                        <rune-view :runeGroup='runeGroup' @requestDelete='deleteWantedRuneGroup($event)' @countChange='onRuneCountChange'>
                            <div class="rune-view-found-text">Found {{isWantedRuneGroupValid(runeGroup)}}</div>
                        </rune-view>
                        
                    </div>
                </div>
            </div>
        </div>
        <!-- SECTION 2 - RESULTES -->
        <div v-if="combinedGroups.length > 0 || foundWantedRunes.length > 0 " class="common-section box">
            <div class="">
                <!-- FOUND WANTED RESULT -->
                <h2 class="common-header results-header">Results</h2>
                <div v-if="foundWantedRunes.length > 0" class="reserved-rune-result-list common-list">
                    <h3 class="reserved-runes-header">Found Reserved Runes</h3>
                    <div v-for="runeGroup in foundWantedRunes" >
                        <rune-view :runeGroup='runeGroup' :is-editable='false'></rune-view>
                    </div>
                </div>
                <!-- RUNES RESULT -->
                <div v-if="combinedGroups.length > 0">
                    <div class="rune-result-list common-list">
                        <div v-for="runeGroup in combinedGroups" >
                            <rune-view :runeGroup='runeGroup' :is-editable='false'></rune-view>
                        </div>
                    </div>
                </div>
                <!-- GEMS -->
                <div >
                    <div v-if="requiredGems.length > 0">
                    <h2 class="common-header">Required Gems</h2>
                        <div class="gem-list common-list">
                            <div v-for="gemData in requiredGems" class="gem-list" id="gem-list">
                            {{gemData.count}} x <strong>{{gemData.name}}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="common-list" v-else >No gems required.</div>
            
                </div>
            </div>
        </div>
    
    </div>
    <div class="footnote">Contact alpdoganurut@gmail.com for bugs, reports, requests etc.</div>
</div>
    
    
</section>
    `
})

function GemData(name, count) {
    this.name = name;
    this.count = count;
}