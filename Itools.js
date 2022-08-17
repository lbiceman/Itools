(function(global, func) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = func() :
        typeof define === 'function' && define.amd ? define(func()) :
        (global = global || self, global.itools = func());
})(this, function() {


    // 判断环境
    let inBrowser = typeof window !== 'undefined';
    let inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
    let weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
    let UA = inBrowser && window.navigator.userAgent.toLowerCase();
    let isIE = UA && /msie|trident/.test(UA);
    let isEdge = UA && UA.indexOf('edge/') > 0;
    let isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
    let isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
    let isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
    let isFirefox = UA && UA.match(/firefox\/(\d+)/);

    // 排序数组
    let letterSortOrder = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7, i: 8, j: 9, k: 10, l: 11, m: 12, n: 13, o: 14, p: 15, q: 16, r: 17, s: 18, t: 19, u: 20, v: 21, w: 22, x: 23, y: 24, z: 15};

    // 时间正则
    let fmtTimeReg = /d{1,2}|M{1,2}|yy(?:yy)?|S{1,3}|([HhMsDm])\1?/g;
    let letterReg = /^[a-zA-Z]/;
    let numReg = /^[0-9]+$/;

    let basicTypes = ["Number", "String", "Boolean", "Null", "Undefined", "RegExp"];
    let quoteTypes = ["Array", "Function", "Object"];

    function error(str) {
        console.error(str);
    }

    // 9月 -> 09月  10月 -> 10月
    function completion(val, len) {
        len = len || 2;
        val = val + "";
        for(; val.length < len; ) {
            val = "0" + val;
        }
        return val;
    }

    // 数组或者对象降维  // 可以指定对象需要降维的参数
    function flat(arr, list, variate) {
        for(let i = 0, len = list.length; i< len; i++) {
            if(variate) {
                arr.push(list[i]);
                if(list[i][variate] && list[i][variate].length > 0) {
                    flat(arr, list[i][variate], variate);
                }
            } else {
                if(list[i] && list[i].length > 0) flat(arr, list[i])
                else arr.push(list[i])
            }
        }
        for(let i = 0, len = arr.length; i < len; i++) {
            delete arr[i][variate];
        }
        return arr;
    }

    // 完整格式 yyyy-MM-dd HH:mm:ss:SSS
    // D 周     d 日     M月    m分     y年     h 12进制小时   H 24进制小时  s 秒  S 毫秒
    let fmtDateFlags = {
        D: function(date) {
            return date.getDay() + "";
        },
        DD: function(date) {
            return completion(date.getDay())
        },
        d: function(date) {
            return date.getDate() + "";
        },
        dd: function(date) {
            return completion(date.getDate())
        },
        M: function(date) {
            return (date.getMonth() + 1) + "";
        },
        MM: function(date) {
            return completion(date.getMonth() + 1)
        },
        yy: function(date) {
            return completion(date.getFullYear().substr(2))
        },
        yyyy: function(date) {
            return completion(date.getFullYear())
        },
        m: function(date) {
            return completion(date.getMinutes())
        },
        mm: function(date) {
            return completion(date.getMinutes())
        },
        H: function(date) {
            return date.getHours() + "";
        },
        HH: function(date) {
            return completion(date.getHours())
        },
        h: function(date) {
            return date.getHours() % 12 || 12
        },
        hh: function(date) {
            return completion(date.getHours() % 12 || 12)
        },
        S: function(date) {
            return date.getMilliseconds() + ""
        },
        SSS: function(date) {
            return completion(date.getMilliseconds(), 3)
        },
        s: function(date) {
            return date.getSeconds() + ""
        },
        ss: function(date) {
            return completion(date.getSeconds())
        },
        season: function(date) {
            let month = date.getMonth() + 1;
            return completion(Math.ceil(month / 3))
        }
    }

    function Idate(date, dateFormat) {
        if(date && Itools.prototype.getType(new Date(date)) !== "Date") throw new Error("not type")

        this._date = date || "";
        this.dateFormat = dateFormat || "yyyy-MM-dd hh:mm:ss";
        this.date = date ? new Date(this._date) : new Date();
    }

    function idate(date, dateFormat) {
        return new Idate(date, dateFormat)
    }

    Idate.prototype = {
        // 获取毫秒数
        valueOf() {
            return this.date.getTime()
        },

        // 获取秒
        getSeconds() {
            return fmtDateFlags.ss(this.date)
        },

        // 获取分钟
        getMinutes() {
            return fmtDateFlags.mm(this.date)
        },

        // 获取小时
        getHours(type) {
            if(type == 12) return fmtDateFlags.hh(this.date);
            else return fmtDateFlags.HH(this.date);
        },

        // 获取日
        getDate() {
            return fmtDateFlags.dd(this.date);
        },

        // 获取周几
        getWeek() {
            // 返回字符串  0 1 2...
            return fmtDateFlags.D(this.date)
        },

        // 获取月
        getMonth() {
            return fmtDateFlags.MM(this.date)
        },

        // 获取季度
        getSeason() {
            return fmtDateFlags.season(this.date)
        },

        // 获取年
        getYear() {
            return fmtDateFlags.yyyy(this.date)
        },

        // 判断闰年
        isLeapYear(year) {
            return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)
        },

        // 获取当前计算机时间
        now(dateFormat) {
            return new Idate(new Date(), dateFormat || this.dateFormat).format()
        },

        // 获取格式化之后的时间
        format(dateFormat) {
            let that = this;
            let fmt = dateFormat || this.dateFormat;
            return fmt.replace(fmtTimeReg, function(curr) {
                return fmtDateFlags[curr](that.date)
            })
        }
    }

    let Itools = function() {
        this.version = "Itools version: 0.0.1";
        this.autor = {
            emil: "lbiceman@126.com",
            name: "lbiceman",
            github: "https://github.com/lbiceman/Itools"
        }
    }

    Itools.prototype = {
        // Idate,
        idate,
        browser() {
            return {
                inBrowser,
                inWeex,
                isIE,
                isEdge,
                isAndroid,
                isIOS,
                isChrome,
                isFirefox
            }
        },
        // 获取类型
        getType(obj) {
            let str = Object.prototype.toString.call(obj);
            return str.slice(8, str.length - 1)
        },
        //获取对象长度
        getObjKeysSize(obj) {
            return this.getObjKeys(obj).length
        },
        // 获取对象的key
        getObjKeys(obj) {
            return Object.getOwnPropertyNames(obj)
        },
        // 生成指定范围随机数
        getRangeRandom(min, max) {
            return parseInt(Math.random() * (max - min + 1) + min)
        },
        // 按照传入的数字生成数组
        createRange(start, end, step) {
            end = end || 0;
            start = start || 0;
            step = step || 1;
            if(arguments.length == 1) {
                end = start;
                start = 0;
            }
            let arr = [];
            for(; start < end; start += step) {
                arr.push(start)
            }
            return arr;
        },
        // 是否为数组
        isArr(arr) {
            return this.getType(arr) === "Array"
        },
        //是否为对象
        isObj(obj) {
            return this.getType(obj) === "Object"
        },
        // 判断是否为字符串
        isStr(obj) {
            return this.getType(obj) === "String"
        },
        // 判断是否为数字
        isNum(obj) {
            return this.getType(obj) === "Number"
        },
        // 判断是否为函数
        isFun(obj) {
            return this.getType(obj) === "Function"
        },
        // 判断对象，数组，字符串是否含有当前元素
        // 进行广度有点对比，对于这个函数效率比深度高
        has(obj, variate) {
            let that = this;
            function disObj(obj, variate) {
                let queue = [];
                queue.push(obj);
                for(; queue.length > 0; ) {
                    let item = queue.shift();
                    for(let key in item) {
                        if(that.isObj(item[key])) {
                            queue.push(item[key])
                        } else if(that.isArr(item[key])) {
                            if(disArr(item[key], variate)) return true;
                        } else {
                            if(that.equals(item[key], variate)) return true;
                        }
                    }
                }
                return false;
            }
            function disArr(obj, variate) {
                return that.flat(obj).includes(variate)
            }
            if(this.isStr(obj)) return obj.includes(variate)
            else if(this.isObj(obj)) return disObj(obj, variate)
            else if(this.isArr(obj)) return disArr(obj, variate)
        },
        // 随机生成16进制颜色
        randomColor() {
            return Math.random().toString(16).slice(2, 8)
        },
        // 数组或者对象去重  list 数组    根据variate去重
        uniq(list, variate) {
            let arr = this.clone(list, []);
            for(let i = 0; i < arr.length; i++) {
                for(let j = i + 1; j < arr.length; j++) {
                    if((variate && arr[i][variate] == arr[j][variate]) || (!variate && arr[i] == arr[j])) {
                        arr.splice(j, 1);
                        j--;
                    }
                }
            }
            return arr
        },
        // 数组或者对象降维  list 传递进来的对象或者数组  variate需要降维的参数名
        flat: (list, variate) => flat([], list, variate),
        // 深度克隆
        clone(obj, newObj) {
            if(!obj) return obj;
            if(!quoteTypes.includes(this.getType(obj))) return obj;
            for(let key in obj) {
                let el = obj[key];
                if(quoteTypes.includes(this.getType(el))) {
                    if(this.isArr(el)) newObj[key] = []
                    else if(this.isObj(el)) newObj[key] = {};
                    else if(this.getType(el) == "Function") newObj[key] = el;
                    this.clone(el, newObj[key])
                } else newObj[key] = el
            }
            return newObj
        },
        // 判断两个对象是否相同 支持基础类型，数组，对象(支持多级对象或者数组)
        equals(obj1, obj2) {
            let type = this.getType(obj1);
            let errMsg = "The current type (Function, RegExp) is not supported";
            if(type === this.getType(obj2)) {
                if(type === "RegExp") {
                    error(errMsg);
                }
                if(basicTypes.includes(type)) {
                    return obj1 === obj2;
                } else if(type === "Object") {
                    if(this.getObjKeysSize(obj1) === this.getObjKeysSize(obj2)) {
                        for(let key in obj1) {
                            if(!this.equals(obj1[key], obj2[key])) return false;
                        }
                        return true;
                    } else return false
                } else if(type === "Array") {
                    if(obj1.length === obj2.length) {
                        for(let i = 0, len = obj1.length; i < len; i++) {
                            if(!this.equals(obj1[i], obj2[i])) return false;
                        }
                        return true;
                    } else return false;
                } else error(errMsg)
            }
            return false;
        },
        // 合并
        merge(target) {
            for (let i = 1, j = arguments.length; i < j; i++) {
                let source = arguments[i] || {};
                for (let prop in source) {
                    if (source.hasOwnProperty(prop)) {
                        let value = source[prop];
                        if (value !== undefined) {
                            target[prop] = value;
                        }
                    }
                }
            }
            return target
        },
        // 从属性结构查找某个节点 广度
        // 目前建议使用下边的深度算法
        findTree2(tree, child, callback) {
            // 广度优先  理论上比下边的深度优先快
            // 但是这种写法比深度慢
            // 后边需要优化
            if(!this.isObj(tree)) return
            function findChild(tree, child, callback) {
                let queue = [tree];
                for(; queue.length > 0; ) {
                    let item = queue.shift();
                    if(callback(item)) {
                        return item;
                    }
                    if(item[child] && item[child].length > 0) {
                        queue = queue.concat(item[child]);
                    }
                }
            }
            return findChild(tree, child, callback)
        },
        // 从树形机构查找某个节点 深度
        findTree(tree, child, callback) {
            if(!this.isObj(tree)) return;
            let obj = null;
            function findChild(list, child, callback) {
                for(let i = 0; i < list.length; i++) {
                    if(callback(list[i])) {
                        obj = list[i]
                    }
                    if(list[i][child] && list[i][child].length > 0) {
                        findChild(list[i][child], child, callback)
                    }
                }
            }
            findChild([tree], child, callback);
            return obj;
        },
        // 求和
        sum(list) {
            let num = 0;
            for(let i = 0; i < list.length; i++) {
                if(!this.isNum(list[i])) {
                    error("not a num");
                    return;
                }
                num += list[i];
            }
            return num;
        },
        // 平均值
        mean(list) {
            let num = this.sum(list);
            return num / list.length;
        },
        // 排序
        // 快速
        orderBy(list, order) {
            // order    asc   1 -> 99    desc  99 -> 1
            order = order || "asc";
            if(list.length <= 1) {
                return list;
            }
            let left = []
            let right = [];
            let index = Math.floor(list.length / 2);
            let value = list.splice(index, 1)[0];
            for(let i = 0; i < list.length; i++) {
                let item = list[i];
                if(item === undefined || item === null || item === "") continue;
                if(letterReg.test(item)) {
                    letterSortOrder[item[0].toLowerCase()] > letterSortOrder[value[0].toLowerCase()] ? right.push(item) : left.push(item);
                } else if(numReg.test(item)) {
                    item > value ? right.push(item) : left.push(item);
                }
            }
            if(order === "desc") {
                return this.orderBy(right, order).concat(value, this.orderBy(left, order));
            } else {
                return this.orderBy(left, order).concat(value, this.orderBy(right, order));
            }
        },

        // 节流  // 每个一段时间调用一次
        // 当被调用N毫秒后才会执行 如果在这时间内有被调用至少格N秒调用一次
        throttle(callback, wait) {
            let timer = null;
            return function() {// 使用传统写法  保持this只想
                let args = arguments;
                if(!timer) {
                    timer = setTimeout(() => {
                        callback.apply(this, args);
                        timer = null;
                    }, wait);
                }
            }
        },
        // 防抖  // 被调用后重新计算时间
        // 当被调用N毫秒后才会执行，如果在这段时间内又被调用则重新计算执行时间
        debounce(callback, wait, state) {
            /*
                state
                    true: 立即执行
                    false: 不立即执行
            */
           state = state || false;
           let timer = null;
           return function() {
               let args = arguments;
               if(timer) clearTimeout(timer);
               if(state) {
                   let now = !timer;
                   timer = setTimeout(() => {
                       timer = null
                   }, wait)
                   if(now) callback.apply(this, args);
               } else {
                   timer = setTimeout(() => {
                       callback.apply(this, args);
                   }, wait);
               }
           }
        },
        // 用户自定义扩展函数
        extend(obj) {
            obj = obj || {};
            for(let key in obj) {
                if(this.hasOwnProperty(key)) {
                    error("'" + key + "' has already been declared");
                    continue;
                }
                if(this.getType(obj[key] == "Function")) {
                    Itools.prototype[key] = obj[key]
                }
            }
        }
    }

    return new Itools();
})
