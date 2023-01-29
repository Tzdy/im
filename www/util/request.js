import { VUE_BASE } from '../config.js';
import axios from '../public/js/axios.esm.js'
import { goLogin } from '../router.js';
import { getToken } from './storage.js';


const instance = axios.create({
    baseURL: VUE_BASE,

})

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    config.headers['authorization'] = getToken()
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
}, function (error) {
    if (error.response.status === 401) {
        goLogin(error.response.data.message)
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error.response.data)
});

export default instance