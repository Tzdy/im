import { computed, defineComponent } from "../public/js/vue.esm.js"


export default defineComponent({
    template: '#user-card',
    props: {
        avatar: String,
        nickname: String,
        content: String,
        selected: Boolean,
    },
    setup(props) {
        const selectStyle = computed(() => {
            console.log(props.selected)
            if (props.selected) {
                return {
                    backgroundColor: 'rgba(208,215,222,.32)'
                }
            }
            return {}
        })
        return {
            selectStyle,
        }
    }
})