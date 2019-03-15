// 模块被引用记录
var mapDepToModule = {}
// 模块缓存
var modulesCache = {}

/*
* @params: name(String),模块名
* @params: dep(Array), 依赖模块列表
* @params: callback(Function),回调函数
* @params: errorHandler(Function),错误处理函数
* */
function Module(name, dep, callback, errorHandler){
    this.name = name;
    this.dep = dep;
    this._depCount = 0;                     // 引用模块未加载完的个数
    this.cb = callback;
    this.result = null
    this.errorFn = errorHandler;
    this._STATUS = 0;                       // 本模块状态
    this.init()
}

// 初始化
Module.prototype.init = function() {
    modulesCache[this.name] = this;
    // 记录模块谁引用了本模块
    if(this.dep && this.dep.length) {
        this.dep.map(name=>{
            if(mapDepToModule[name]) {
                mapDepToModule[name].push(this)
            }
            else {
                mapDepToModule[name]=[this]
            }
        });
    }
    Object.defineProperty(this, 'STATUS', {
        get() { return this._STATUS },
        set(status) {
            if(this._STATUS !== status && status === 5) {
                this.execute();
                // 准备完毕，告诉引用本模块的其他人
                let depedModules = mapDepToModule[this.name];
                if(!depedModules) return;
                depedModules.map(module=>{
                    setTimeout(()=>{
                        module.depCount--;
                    }, 0)
                })
            }
            this._STATUS = status
        }
    })
    this.analyzeDep();
    this.fetch()
    // 不依赖其他模块，则本模块直接准备完成
    if(!this.dep || this.dep.length===0) this.STATUS = 5
}

// 模块加载
Module.prototype.fetch = function() {
    if(this.dep && this.dep.length) {
        this.dep.map(name=>{
            // 模块已在缓存中
            if(modulesCache[name]) {
                // 模块ready，引用模块未加载完的个数减一
                modulesCache[name].STATUS === 5 && this.depCount--;
            }
            else {
                // 加载模块（路径先直接写死）
                tools.getModule(`js/${name}.js`);
            }
        })
    }
};

// 依赖处理
Module.prototype.analyzeDep = function() {
    this._depCount = this.dep ? this.dep.length : 0;
    Object.defineProperty(this, 'depCount', {
        get() { return this._depCount },
        set(depCount) {
            this._depCount = depCount;
            if(depCount === 0) {
                console.log(`模块${this.name}的依赖已经ready！！`);
                this.STATUS = 5;
            }
        }
    })

};

// 模块运行
Module.prototype.execute = function() {
    if(this.dep && this.dep.length) {
        let args = new Array(this.dep.length).fill(undefined);
        this.dep.map((name,i)=>{
            let value = modulesCache[name].result;
            args[i] = value;
        })
        this.result = this.cb(args);
    }
    else {
        this.result = this.cb()
    }
};

// 公用函数库
var tools = {
    getModule(src) {
        let tag = document.createElement('script');
        tag.src = src;
        document.body.appendChild(tag)
    }
}
