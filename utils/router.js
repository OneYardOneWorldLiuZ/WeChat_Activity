const app = getApp();

/**
 * 路由拦截器
 */
const Router = (pageObj) => {
    if (pageObj.onShow) {
        let _page = pageObj.onShow
        pageObj.onShow = function () {
            if (app.globalData.isiPhoneX) {
                this.setData({ isiPhoneX: true })
            } else {
                app.sysCallback = () => {
                    this.setData({ isiPhoneX: true })
                }
            }
            _page.call(this)
        }
    }
    return Page(pageObj)
}

module.exports = {
    Router
}