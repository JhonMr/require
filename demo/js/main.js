/*
* Author: LJH
* Date: 2019/4/25
* Description:
*/

new Module('main', ['./js/a.js'], function(a) {
    document.getElementById('aData').innerText = a.toString()
    return false
})
