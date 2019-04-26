/*
* Author: LJH
* Date: 2019/4/25
* Description:
*/

new Module('./js/a.js', ['./js/b.js'], function(b) {
    return '我是a模块的数据！！' + b
})
