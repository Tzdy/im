import { computed, defineComponent } from "../public/js/vue.esm.js"
import { relativeTimeFormat } from "../util/timeFormat.js"

export default defineComponent({
    template: '#user-card',
    props: {
        avatar: String,
        nickname: String,
        content: String,
        contentCreatedTime: String,
        selected: Boolean,
        hasNewAlert: Boolean,
        isOnline: Boolean,
    },
    setup(props) {
        const selectStyle = computed(() => {
            if (props.selected) {
                return {
                    backgroundColor: 'rgba(208,215,222,.32)'
                }
            }
            return {}
        })
        return {
            selectStyle,
            relativeTimeFormat,
        }
    }
})