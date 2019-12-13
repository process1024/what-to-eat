import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Picker } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import request from '../../utils/request'
import { randomNum } from '../../utils/tools'
import { AtModal, AtButton } from "taro-ui"

import './index.less'

type PageStateProps = {
    counterStore: {
    }
}

interface Index {
    props: PageStateProps;
}

@inject('counterStore')
@observer
class Index extends Component {

    /**
     * 指定config的类型声明为: Taro.Config
     *
     * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
     * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
     * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
     */
    config: Config = {
        navigationBarTitleText: '吃啥'
    }
    state = {
        meals: [],
        dishIndex: -1,
        isProcess: false,
        mealType: [
            {
                id: 0,
                name: '随便'
            },
            {
                id: 1,
                name: '早餐'
            },
            {
                id: 2,
                name: '午餐'
            },
            {
                id: 3,
                name: '晚餐'
            },
        ],
        mealTypeIndex: 0,
        showResult: false,

    }
    componentWillMount() {
        Taro.login().then(res => {
            request({
                url: '/login',
                data: {
                    code: res.code
                },
            }).then(res => {
                console.log(res)
                Taro.setStorageSync('openId', res.data.openId)
                request({
                    url: '/meals/list'
                }).then(r => {
                    this.state.meals = r.data
                })
            })
        })
    }


    onShareAppMessage() {
        return {
            title: '还在纠结今天吃啥？',
            imageUrl: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1598981444,3445006762&fm=26&gp=0.jpg',
            success: () => {
                Taro.showToast({
                    title: '转发成功',
                    icon: 'success',
                })
            },
            fail: () => {
                Taro.showToast({
                    title: '转发失败',
                    icon: 'failer',
                })
            }
        }
    }

    componentDidHide() { }

    startChoose() {
        clearInterval(this.timerId)
        if (this.state.isProcess) {
            this.setState({
                isProcess: false,
                showResult: true
            })
        } else {
            this.setState({
                isProcess: true
            })
            this.timerId = setInterval(() => {
                this.setState({
                    dishIndex: randomNum(0, this.state.meals.length - 1)
                });
            }, 50);
        }
    }

    mealTypeChange = (e) => {
        const id = e.target.value
        request({
            url: '/meals/list',
            data: {
                cate: id
            }
        }).then(r => {
            this.setState({
                dishIndex: -1,
                mealTypeIndex: id,
                meals: r.data
            })
        })
    }

    onGotUserInfo(e) {
        console.log(e.detail.errMsg)
        console.log(e.detail.userInfo)
        console.log(e.detail.rawData)
    }

    toggleShowResult(bool) {
        this.setState({
            showResult: bool
        })
    }

    render() {
        const { mealType, mealTypeIndex, dishIndex, meals, isProcess, showResult } = this.state

        return (
            <View className='dish-view'>
                {/* <Button className="login-btn" open-type="getUserInfo" onGetUserInfo={this.onGotUserInfo}>点击授权登录</Button> */}
                <View className='page-section'>
                    <View>
                        <Picker onChange={this.mealTypeChange} mode="selector" value={mealTypeIndex} range={mealType} rangeKey="name">
                            <View className='picker'>
                                当前选择：{mealType[mealTypeIndex].name}
                            </View>
                        </Picker>
                    </View>
                </View>
                <View className="food-name">{meals[dishIndex] && meals[dishIndex].name || '今天吃什么呢！'}</View>
                <AtButton className="start-btn" type='primary' onClick={this.startChoose.bind(this)}>{isProcess ? '停止' : '开始'}</AtButton>

                <AtModal
                    isOpened={showResult}
                    cancelText='再选一次'
                    confirmText='就它了'
                    onCancel={this.toggleShowResult.bind(this, false)}
                    onConfirm={this.toggleShowResult.bind(this, false)}
                    closeOnClickOverlay={false}
                    content={dishIndex !== -1 ? `今天${mealTypeIndex === 0 ? '' : mealType[mealTypeIndex].name}吃${meals[dishIndex].name}` : ''}
                />
            </View>
        )
    }
}

export default Index as ComponentType
