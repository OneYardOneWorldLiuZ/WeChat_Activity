// pages/userPhoto/userPhoto.js
//获取应用实例
const app = getApp()
import { Router } from '../../utils/router.js'
//获取画布
const ctx = wx.createCanvasContext('getImg')

Router({
  //绘图
  drawImg(headImg, index) {

    let that = this
    wx.showLoading({
      title: '图片生成中...',
    })

    let promiseHead = new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: headImg,
        success(res) {
          resolve(res)
        },
        fail(e){
          reject("调用失败"); 
        }
      })
    })

    let promiseFrame = new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: that.data.photo_bj_num[index],
        success(res) {
          resolve(res)
        },
        fail(e){
          reject("调用失败"); 
        }
      })
    })

    Promise.all([promiseHead, promiseFrame]).then(res => {
      let num = 1024
      let width_userIcon = num- 80
      let x_userIcon = (num - (num - 80))/2
      ctx.drawImage(res[0].path, x_userIcon, x_userIcon, width_userIcon, width_userIcon)
      ctx.drawImage('/' + res[1].path, 0, 0, num, num)
      // 第一个参数为false，表示先清空画布再绘制
      ctx.draw(false,setTimeout(function(){
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: num,
          height: num,
          destWidth: num,
          destHeight: num,
          canvasId: 'getImg',
          success(res) {
            that.setData({
              new_userImage: res.tempFilePath,
              new_showuserImage: true,
              userImage: headImg
            })
            wx.hideLoading()
          },
          fail(res) {
            console.log("绘图错误："+res);
            wx.hideLoading()
          }
        },that);
      },100))
    }).catch(e => console.log(e));
  },

  /**
   * 页面的初始数据
   */
  data: {
    isiPhoneX: false,
    userImage: '',
    new_userImage: '',
    new_showuserImage: false,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    photo_bj_num: [ "../../status/image/ah1.png",
                    "../../status/image/ah2.png",
                    "../../status/image/ah3.png",
                    "../../status/image/ah4.png",
                    "../../status/image/ah5.png",
                    "../../status/image/ah6.png",
                    "../../status/image/ah7.png",
                    "../../status/image/ah8.png"],
    photo_select_idx:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

  },
  /**
   * 用户点击获取图片
   */
  tapSelectUserClick: function () {
    let self = this;
    console.log('点击获取图片');
    wx.showActionSheet({
      itemList: ["微信头像", "从手机相机册选择"],
      success(e) {
        console.log('success');
        if (!e.camcle) {
          if (e.tapIndex == 0) {
            self.getUSerWechatInfo_Photo();
          } else if (e.tapIndex == 1) {
            self.getUSerMobile_Photo();
          }
        } else {
          console.log("cancle");
        }
      },
      fail(e) {
        console.log("fail: --- ", e);
      },
      complete(e) {
        console.log("complete --- ", e);
      }
    })
  },

 /**
  * 下载用户微信头像
  */
setUserWeCahtPhoto: function(url) {
  let that = this
  wx.downloadFile({
    url: that.headimgHD(url),
    success: function (res) {
      if (res.statusCode === 200) {
        that.drawImg(res.tempFilePath, that.data.photo_select_idx);
      }
    }
  })
},

  /**
  * 获取用户微信头像
  */
  getUSerWechatInfo_Photo: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
      })
      this.setUserWeCahtPhoto(app.globalData.userInfo.avatarUrl);

    } else {
      let that = this
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          that.setUserWeCahtPhoto(app.globalData.userInfo.avatarUrl);
        }
      })
    }
  },

  /**
  * 打开用户相册
  */
  getUSerMobile_Photo: function () {
    let that = this
    // let index = e.currentTarget.dataset.index

    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success (res) {
        // tempFilePath可以作为img标签的src属性显示图片
        let tempFilePath = res.tempFilePaths[0];
        that.drawImg(tempFilePath, that.data.photo_select_idx)
        that.setData({
          hasUserInfo: true
        })
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })

  },
  /**
  * 重置画布
  */
  editClick: function () {
    this.setData({
      hasUserInfo: false,
      userImage : '',
      new_userImage : '',
      new_showuserImage: false
    })
  },

  /**
  * 获取高清微信头像
  */
 headimgHD : function (imageUrl) {       
    console.log('原来的头像', imageUrl);
    imageUrl = imageUrl.split('/'); 
    if (imageUrl[imageUrl.length - 1] && 
      (imageUrl[imageUrl.length - 1] == 46 || imageUrl[imageUrl.length - 1] == 64 || imageUrl[imageUrl.length - 1] == 96 || imageUrl[imageUrl.length - 1] == 132)) {
            imageUrl[imageUrl.length - 1] = 0;
      }
        imageUrl = imageUrl.join('/');  
        console.log('高清的头像', imageUrl);        
        return imageUrl;
    },


  saveloadFile: function () {
    if(!this.data.new_userImage){
      wx.showModal({
        content: '没有图片可保存~',
        showCancel: false,
        confirmText: '明白了',
      })
      return
    }

    let that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.new_userImage,
      success(res) {
        wx.showModal({
          content: '图片已保存到相册了~',
          showCancel: false,
          confirmText: '没毛病',
          success(res) {
            if (res.confirm) {
              log("点击确定,老铁没毛病")
            }
          }
        })
      }
    })
  },

  bigimg: function (e) {

    if(this.data.userImage){
      this.setData({
        photo_select_idx : e.currentTarget.dataset.item
      });
      this.drawImg(this.data.userImage,this.data.photo_select_idx);
    }
  }
  
})