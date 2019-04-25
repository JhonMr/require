/*
* Author: LJH
* Date: 2019/4/25
* Description:
*/

// 全局模块缓存
const moduleCache = {}

class Module {
    /*
    * deps 依赖模块名数组
    * depsUnload 未加载完成的依赖模块
    * beDeps 依赖本模块的模块列表
    * status 模块状态
    *   0：初始化完成
    *   1：依赖准备完毕
    *   2：执行完成
    *
    * */

    constructor(src, deps, cb) {
        this.name = src
        this.deps = deps
        this.callback = cb
        this._depsUnload = deps.length
        this.beDeps = []
        this._status = 0
        this.result = null
        Object.defineProperty(this, 'depsUnload', {
            get() {
                return this._depsUnload
            },
            set(num) {
                this._depsUnload = num
                // 依赖都加载完成
                if(this._depsUnload == 0) {
                    this.status = 2
                }
            }
        })

        Object.defineProperty(this, 'status', {
            get() {
                return this._status
            },
            set(num) {
                this._status = num
                // 万事具备，只差执行了
                if(this._status == 1) {
                    this.execute()
                }
                // 自己执行完后就要告诉依赖你的其他人
                if(this._status == 2) {
                    this.beDeps.map(beDep => {
                        moduleCache[beDep].depsUnload--
                    })
                }
            }
        })

        if(this.deps.length)
            this.deps.map(dep=>{
            const module = moduleCache[dep]
            // 已缓存的模块
            if(module) {
                moduleCache[dep].beDeps.push(this.name)
                if(module.status==2) {
                    this.depsUnload--
                }
            }
        })
        else
            this.status = 1

        // 缓存自己到全局模块缓存中
        moduleCache[this.name] = this

        // 加载未加载的依赖模块
        this.deps.map(dep=>{
            if(!moduleCache[dep]) {
                Module.loadModule(dep, ()=> {
                    // 初始化后才能加在模块缓存里
                    moduleCache[dep].beDeps.push(this.name)
                })
            }
        })
    }
    execute() {
        // 拿参数
        const params = []
        this.deps.map(dep=>{
            const module = moduleCache[dep]
            params.push(module.result)
        })
        this.result = this.callback(...params)
        this.status = 3
    }
    static loadModule(src, callback) {
        const script = document.createElement('script')
        script.src=src
        script.onload = callback
        document.body.appendChild(script)
    }
}
