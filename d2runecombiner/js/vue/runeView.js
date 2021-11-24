Vue.component('rune-view', {
    props: {
        runeGroup: RuneGroup,
        isEditable: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        increaseCount() {
            if(event.shiftKey)
                this.runeGroup.count += 5;
            else
                this.runeGroup.count += 1;

            this.$emit('countChange', this.runeGroup);
        },
        decreaseCount() {
            if(event.shiftKey)
                this.runeGroup.count -= 5;
            else
                this.runeGroup.count -= 1;

            if(this.runeGroup.count < 0) this.runeGroup.count = 0;

            this.$emit('countChange', this.runeGroup);
        },
        textInputChange(input) {
            const parsed = parseInt(input);
            if (isNaN(parsed)) {
                return;
            }

            this.$emit('countChange', this.runeGroup);

        },
        requestDelete() {
            this.$emit('requestDelete', this.runeGroup);
        },
        capitalizeFirstLetter(str) {
            return capitalizeFirstLetter(str);
        }
    },
    template: `
        <div class="rune-view">
            <div class="rune-view-rune-name">
            <span v-if="!isEditable">{{this.runeGroup.count}} x</span> 
            <strong>{{capitalizeFirstLetter(this.runeGroup.name)}}</strong>
            </div>
            <b-input v-if="isEditable" v-model="runeGroup.count" @input="textInputChange" class="rune-view-rune-count-input-wrapper" type="number" min="1" custom-class="rune-view-rune-count-input" size="is-small"></b-input>
            <div v-if="isEditable" class="is-grouped rune-view-button-wrapper">
                <div class="buttons are-small">
                    <button class="button is-small is-inverted" @click="decreaseCount" tabindex="-1">
                        <span class="icon is-small">
                            <i class="fas fa-minus"></i>
                        </span>
                    </button>
                    <button class="button is-small is-inverted" @click="increaseCount" tabindex="-1">
                        <span class="icon is-small">
                            <i class="fas fa-plus"></i>
                        </span>
                    </button>
                    <button class="button is-small is-danger is-inverted" @click="requestDelete" tabindex="-1">
                        <span class="icon is-small">
                            <i class="fas fa-trash"></i>
                        </span>
                    </button>
                </div>
            </div>
            <slot></slot>
        </div>
    `
})