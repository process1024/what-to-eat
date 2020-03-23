import Taro from '@tarojs/taro'
import config from './config'

export default function request(options) {
    if (options.showLoading) {
        Taro.showLoading({
            title: '加载中'
        })
    }
    return Taro.request({
        header: {
            'content-type': 'application/json',
            'openId': Taro.getStorageSync('openId')
        },
        ...options,
        url: config.domain + options.url
    }).then(res => {
        const { statusCode, data } = res;
        if (statusCode >= 200 && statusCode < 300) {
            if (data.status !== 200) {
                Taro.showToast({
                    title: `${data.error.message}~` || data.error.code,
                    icon: 'none',
                    mask: true,
                });
                throw res
            }
            return data;
        } else {
            Taro.showToast({
                title: '服务器错误',
                icon: 'none',
                mask: true,
            });
            throw new Error(`网络请求错误，状态码${statusCode}`);
        }
    }).finally(() => {
        if (options.showLoading) {
            Taro.hideLoading()
        }
    })
}
