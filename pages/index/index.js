//index.js
//获取应用实例
const app = getApp()
var WxParse = require('../../wxParse/wxParse.js');
var that = this;
Page({
  data: {
    username: wx.getStorageSync('username') || '',
    password: wx.getStorageSync('password') || '',
    remember: true
  },
  msg: function() {
    if (this.data.username == '' || this.data.password == '') {
      wx.showModal({
        content: '学号和密码不能为空',
        showCancel: false
      });
      return
    }
    if (this.data.remember) {
      wx.setStorageSync('username', this.data.username)
      wx.setStorageSync('password', this.data.password)
    } else {
      wx.removeStorageSync('username')
      wx.removeStorageSync('password')
    }
    wx.showLoading({
      title: '登录中',
    })
    wx.request({
      url: 'https://ji.s-cry.com/gpa',
      method: 'POST',
      data: {
        'username': this.data.username,
        'password': this.data.password
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        app.globalData.account = {
          'username': this.data.username,
          'password': this.data.password
        }
        app.globalData.grade = res.data;
        if (res.data['state'] == true) {
          var items = []
          var size = 0
          for (var i = 0; i < app.globalData.periods.length; i++) {
            var periodGrade = app.globalData.grade[app.globalData.periods[i]]
            if (typeof(periodGrade) != undefined) {
              for (var key in periodGrade) {
                if (typeof(key) != "undefined") {

                  items.push({
                    name: key,
                    num: periodGrade[key][1],
                    grade: periodGrade[key][0] + " " + periodGrade[key][1],
                    credit: periodGrade[key][2],
                    value: String(size),
                    checked: true
                  });
                  size = size + 1;
                }

              }

            }

          }

          app.globalData.defaultItems = items;
          wx.reLaunch({
            url: '/pages/menu/menu'
          })

        } else {
          wx.showModal({
            content: '登录失败',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                //console.log('确定')
              }
            }
          });
        }

      },
      complete: () => {
        wx.hideLoading();
      }
    })
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  bindUsername: function(e) {
    this.setData({
      username: e.detail.value
    })
  },
  bindPassword: function(e) {
    this.setData({
      password: e.detail.value
    })
  },
  bindRemember: function (e) {
    this.setData({
      remember: e.detail.value
    })
  }
})