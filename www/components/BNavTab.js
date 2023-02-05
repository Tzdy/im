import { defineComponent, ref } from "../public/js/vue.esm.js"

export default defineComponent({
    template: '#nav-tab',
    props: {
        defaultIndex: {
            type: Number,
            default: 0,
        },
        items: {
            type: Array,
            default: () => [],
        }
    },
    setup(props, { emit }) {

        const selectIndex = ref(0)

        function onSelect(index) {
            selectIndex.value = index
            emit('select', index)
        }

        return {
            onSelect,
            selectIndex,
        }
    }
})