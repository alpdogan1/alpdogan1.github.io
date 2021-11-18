Vue.component('add-rune-view', {
    data: function () {
        return {
            runes: [],
            value: ''
        }
    },
    methods: {
        onSelect(value) {
            this.value = value;
            console.log(`Selected ${this.value}`);

            if(value != null)
                this.$emit('select', this.value);
        }
    },
    computed: {
        filteredDataArray() {
            if(this.value == null) return [];
            return this.runes.filter((option) => {
                return option
                    .toString()
                    .toLowerCase()
                    .indexOf(this.value.toLowerCase()) >= 0
            })
        }
    },
    mounted() {
        this.runes = _.map(runesCombinationConfig, (runeConfig)=>{
            return capitalizeFirstLetter(runeConfig.name);
        })
    },
    template: `
        <div>
            <b-field label="Add Rune">
                <b-autocomplete
                    rounded
                    v-model="value"
                    :data="filteredDataArray"
                    placeholder="e.g. Ohm, Vex etc."
                    icon="magnify"
                    clearable
                    @select="onSelect">
                    <template #empty>No results found</template>
                </b-autocomplete>
            </b-field>
        </div>
    `
})