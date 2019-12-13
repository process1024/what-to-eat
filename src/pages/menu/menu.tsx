import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text, Checkbox, Label, Form } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import request from '../../utils/request'
import { AtModal, AtModalHeader, AtModalContent, AtModalAction, AtInput, AtCheckbox, AtForm, AtSwitch, AtButton, AtFab } from "taro-ui"

import './menu.less'
import { type } from 'os'

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
        navigationBarTitleText: '菜单'
    }

    state = {
        meals: [],
        mealType: [
            {
                id: '',
                name: '全部'
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
        mealTypeIndex: 1,
        showDelete: false,
        selectId: null,
        typeCheckboxOpions: [
            {
                id: '1',
                name: '早餐',
                checked: false,
            },
            {
                id: '2',
                name: '午餐',
                checked: false,
            },
            {
                id: '3',
                name: '晚餐',
                checked: false,
            }
        ],
        showUpdate: false,
        form: {
            name: ''
        }
    }

    componentWillMount() {

    }

    componentWillReact() {
        console.log('componentWillReact')
    }

    componentDidMount() {
        this.switchType(this.state.mealTypeIndex)
    }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }

    switchType = (i) => {
        request({
            url: '/meals/list',
            data: {
                cate: this.state.mealType[i].id
            },
            showLoading: true
        }).then(r => {
            this.setState({
                mealTypeIndex: i,
                meals: r.data
            })
        })
    }

    toggleDelete(bool, id) {
        console.log(bool)
        this.setState({
            showDelete: bool,
            selectId: id
        })
    }

    confirmDelete = () => {
        request({
            url: '/meals/delete',
            data: {
                id: this.state.selectId
            }
        }).then(r => {
            console.log(r)
            Taro.showToast({
                title: r.data.msg,
                icon: 'success',
                // duration: 2000
            })
            this.setState({
                showDelete: false
            })
            this.switchType(this.state.mealTypeIndex)
        })
    }

    typeChange(index, bool) {
        let { typeCheckboxOpions } = this.state
        typeCheckboxOpions[index].checked = bool
        this.setState({
            typeCheckboxOpions: typeCheckboxOpions
        })
    }

    nameChange(name) {
        const form = this.state.form
        this.setState({
            form: { ...form, name}
        })
    }

    showUpdateModal(menu) {
        let {typeCheckboxOpions} = this.state
        let cateArr = menu.cate ? menu.cate.split(',') : []
        typeCheckboxOpions.forEach(item => {
            item.checked = cateArr.includes(item.id)
        })
        this.setState({
            showUpdate: true,
            form: menu,
            typeCheckboxOpions
        })
    }

    cancelUpdate() {
        this.setState({
            showUpdate: false
        })
    }

    confirmSubmit() {
        const { typeCheckboxOpions, form } = this.state
        let cate = []
        typeCheckboxOpions.forEach(item =>{
            if (item.checked) {
                cate.push(item.id)
            }
        })
        const data = {
            ...form,
            cate: cate.join(',')
        }
        request({
            // url: 'http://localhost:3000/meals/update',
            url: '/meals/update',
            data
        })
        .then(r => {
            Taro.showToast({
                title: r.data.msg,
                icon: 'success',
            })
            this.setState({
                showUpdate: false
            })
            this.switchType(this.state.mealTypeIndex)
        })
    }

    render() {
        const { showDelete, mealType, mealTypeIndex, meals, typeCheckboxOpions, showUpdate } = this.state
        return (
            <View className='dish-view'>
                <AtModal
                    isOpened={showDelete}
                    cancelText='取消'
                    confirmText='确认'
                    onCancel={this.toggleDelete.bind(this, false)}
                    onConfirm={this.confirmDelete}
                    closeOnClickOverlay={false}
                    content='是否确认删除这个菜单'
                />
                <AtModal
                    isOpened={showUpdate}
                    closeOnClickOverlay={false}
                    >
                    <AtModalHeader>标题</AtModalHeader>
                    <AtModalContent>
                        <AtInput
                            name='name'
                            type='text'
                            placeholder='请输入菜单名称'
                            value={this.state.form.name}
                            onChange={this.nameChange.bind(this)}
                        />
                        <AtSwitch title='早餐' checked={typeCheckboxOpions[0].checked} onChange={this.typeChange.bind(this, 0)}/>
                        <AtSwitch title='午餐' checked={typeCheckboxOpions[1].checked} onChange={this.typeChange.bind(this, 1)}/>
                        <AtSwitch title='晚餐' checked={typeCheckboxOpions[2].checked} onChange={this.typeChange.bind(this, 2)}/>
                    </AtModalContent>
                    <AtModalAction> <Button onClick={this.cancelUpdate}>取消</Button> <Button onClick={this.confirmSubmit.bind(this)}>确定</Button> </AtModalAction>
                </AtModal>
                <View className="flex-wrap">
                    <View className="type-list">
                        {mealType.map((meal, index) =>
                            <View
                                key={meal.id}
                                className={meal.id === mealType[mealTypeIndex].id ? 'active-Type' : ''}
                                onClick={this.switchType.bind(this, index)}>{meal.name}</View>
                        )}
                    </View>
                    <View className="meal-list">
                        {/* <AtButton size="small" className="add-btn" type="primary" onClick={this.showUpdateModal.bind(this)}>新增</AtButton> */}
                        <View className='add-btn'>
                            <AtFab onClick={this.showUpdateModal.bind(this)}>
                                新增
                                {/* <View className='at-fab__icon at-icon at-icon-menu'></Text> */}
                            </AtFab>
                        </View>
                        {meals.map(meal =>
                            <View className="meal-item" key="meal.id">
                                <Text>{meal.name}</Text>
                                <View className="btn-wrap">
                                    <AtButton size="small" type="primary" onClick={this.showUpdateModal.bind(this, meal)}>修改</AtButton>
                                    <AtButton onClick={this.toggleDelete.bind(this, true, meal.id)} size="small">删除</AtButton>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        )
    }
}

export default Index as ComponentType
