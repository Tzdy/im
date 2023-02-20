import { defineComponent } from "../public/js/vue.esm.js"

export default defineComponent({
    template: '#dialog',
    props: {
        title: String,
        visible: Boolean,
        size: String
    },
    setup(props, { emit }) {

        function onClose() {
            emit('update:visible', false)
        }

        return {
            onClose,
        }
    }
})