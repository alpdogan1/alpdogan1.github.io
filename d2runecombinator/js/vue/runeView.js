Vue.component('rune-view', {
    // props: ['runeGroup', 'isEditable'],
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
        requestDelete() {
            this.$emit('requestDelete', this.runeGroup);
        },
        capitalizeFirstLetter(str) {
            return capitalizeFirstLetter(str);
        }
    },
    template: `
        <div class="rune-view">
            <div>{{this.runeGroup.count}} x {{capitalizeFirstLetter(this.runeGroup.name)}}</div>
            <div v-if="isEditable" class="field is-grouped">
                <div class="buttons are-small">
<!--                    <a class="button is-small" @click="increaseCount">+</a>-->
<!--                    <a class="button is-small" @click="decreaseCount">-</a>-->
<!--                    <a class="button is-danger" @click="requestDelete">-</a>-->
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
        </div>
    `
})