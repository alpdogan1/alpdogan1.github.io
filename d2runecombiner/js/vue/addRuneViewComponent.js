Vue.component('add-rune-view', {
    data: function () {
        return {
            runes: [],
            value: ''
        }
    },
    methods: {
        onSelect(value) {
            // this.value = value;
            console.log(`Selected ${value}`);

            if(value != null)
                this.$emit('select', value);

            // this.$refs.inputBox.setSelected(null);
            this.value = null;
        }
    },
    computed: {
        filteredDataArray() {
            if(this.value === "") return this.runes;
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
        <div class="add-rune-view">
            <b-field>
                <b-autocomplete
                    ref="inputBox"
                    rounded
                    v-model="value"
                    :data="filteredDataArray"
                    placeholder="Add rune"
                    icon="magnify"
                    clearable
                    open-on-focus
                    @select="onSelect">
                    <template #empty>No results found</template>
                </b-autocomplete>
            </b-field>
        </div>
    `
})