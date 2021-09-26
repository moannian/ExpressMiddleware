const http = require('http');
const { stack } = require('../../Express/routes/blog');
const slice = Array.prototype.slice;

class LikeExpress {
    constructor() {
        this.router = {
            all: [],
            get: [],
            post: []
        }

    };
    listen(...args) {
            const server = http.createServer(this.callback())
            server.listen(...args)
        }
        // 判断第一个参数是什么
    register(path) {
        const info = {}
            // 里面有两个参数
            // { path,stack}
        if (typeof path === "string") {
            info.path = path;
            // 从第二个参数开始，转换为数组，存入stack，【中间件的信息】
            info.stack = slice.call(arguments, 1) //数组

        } else {
            info.path = '/';
            info.stack = slice.call(arguments, 0)
        }
        // 返回的是一个对象
        return info;
    }
    use() {
        // 调用register并将参数传递给·register
        // info里面接收的也是一个对象
        const info = this.register.apply(this, arguments);
        this.router.all.push(info);
    }
    get() {
        // 调用register并将参数传递给·register
        const info = this.register.apply(this, arguments);
        this.router.get.push(info);
    }
    post() {
        // 调用register并将参数传递给·register
        const info = this.register.apply(this, arguments);
        this.router.post.push(info);
    }
    match(method, url) {
        let stack = [];
        // /favicon.ico,是浏览器自动发送的一个请求
        if (url === '/favicon.ico') {
            return stack
        }
        // 获取router
        let curRouter = [];
        curRouter = curRouter.concat(this.router.all);
        curRouter = curRouter.concat(this.router[method]);

        curRouter.forEach((routeInfo) => {
            if (url.indexOf(routeInfo.path) === 0) {
                stack = stack.concat(routeInfo.stack)
            }
        })
        return stack;
    };
    // next的核心机制
    handle(req, res, stack) {
        const next = () => {
            const middleware = stack.shift();
            if (middleware) {
                // 执行中间件函数
                middleware(req, res, next)
            }
        };
        next()
    }

    callback() {
        return (req, res) => {
            // 往外设置返回的函数
            // 首先，我们假设data为JSON格式
            res.json = (data) => {
                res.setHeader('Content-type', 'application/json');
                res.end(JSON.stringify(data))
            }
            const url = req.url;
            const method = req.method.toLowerCase();
            // 需要访问的中间件
            const resultList = this.match(method, url)
                // 核心函数
            this.handle(req, res, resultList)
        }
    }


};
// 构造函数
module.exports = () => {

}