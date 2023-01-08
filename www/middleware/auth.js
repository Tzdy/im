import { ref } from '../public/js/vue.esm.js'
import { userStore, info } from '../store/user.js'
import { goLogin } from '../router.js'
export function useAuthMiddleware() {
    const loading = ref(true)
    info()
        .then(() => {
            if (userStore.userInfo.userId !== -1) {
                loading.value = false
            } else {
                goLogin()
            }
        })
        .catch(response => {
            goLogin(response.message)
        })

    return {
        loading
    }
}