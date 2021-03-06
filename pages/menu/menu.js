var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
const app = getApp();
let that = this;
Page({
  data: {
    tabs: ["GPA", "设置"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    gpa: 0,
    periods: ['全部学期', '2018-2019-2', '2018-2019-1', '2017-2018-3', '2017-2018-2', '2017-2018-1', '2016-2017-3', '2016-2017-2', '2016-2017-1', '2015-2016-3', '2015-2016-2', '2015-2016-1', '2014-2015-3', '2014-2015-2', '2014-2015-1', '2013-2014-2', '2013-2014-1', '2012-2013-2', '2012-2013-1', '2011-2012-2', '2011-2012-1', '2010-2011-2', '2010-2011-1'],
    periodIndex: 0,
    checkboxItems: getApp().globalData.defaultItems,
    courses: [],
    session: null
  },
  onReady: function() {
    const that = this
    this.setData({
      checkboxItems: getApp().globalData.defaultItems
    });
    this.setData({
      gpa: that.calculateGPA().toFixed(2)
    });
  },
  onLoad: function() {
    var that = this;

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });

    wx.request({
      url: 'https://ji.s-cry.com/course',
      method: 'POST',
      data: app.globalData.account,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        that.setData({
          courses: res.data.courses
        })
      },
      complete: () => {
        wx.hideLoading();
      }
    })
  },
  tabClick: function(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  bindPeriodChange: function(e) {
    //  let that = this;
    this.setData({
      periodIndex: e.detail.value
    })
    var items = [];
    var size = 0;
    if (this.data.periods[this.data.periodIndex] != "全部学期") {
      for (var key in app.globalData.grade[this.data.periods[this.data.periodIndex]]) {
        if (typeof(key) != undefined) {
          var temp_str = app.globalData.grade[this.data.periods[this.data.periodIndex]][key][0] + " " + app.globalData.grade[this.data.periods[this.data.periodIndex]][key][1];
          console.log(temp_str);
          items.push({
            name: key,
            num: app.globalData.grade[this.data.periods[this.data.periodIndex]][key][1],
            grade: temp_str,
            credit: app.globalData.grade[this.data.periods[this.data.periodIndex]][key][2],
            value: String(size),
            checked: true
          });
          size = size + 1;
        }

      }
    } else {
      for (var i = 0; i < app.globalData.periods.length; i++) {
        for (var key in app.globalData.grade[app.globalData.periods[i]]) {
          if (typeof(key) != undefined) {
            items.push({
              name: key,
              num: app.globalData.grade[app.globalData.periods[i]][key][1],
              grade: app.globalData.grade[app.globalData.periods[i]][key][0] + " " + app.globalData.grade[app.globalData.periods[i]][key][1],
              credit: app.globalData.grade[app.globalData.periods[i]][key][2],
              value: String(size),
              checked: true
            });
            size = size + 1;
          }

        }
      }
    }
    console.log(items);
    console.log(this.data.periodIndex);
    this.setData({
      checkboxItems: items
    });
    console.log(this.data.checkboxItems);
    this.setData({
      gpa: this.calculateGPA().toFixed(2)
    });
    this.onLoad();
  },
  checkboxChange: function(e) {
    var checkboxItems = this.data.checkboxItems,
      values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;

      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }

    this.setData({
      checkboxItems: checkboxItems
    });
    this.setData({
      gpa: this.calculateGPA().toFixed(2)
    });
  },
  calculateGPA: function() {
    const tmp = this.data.checkboxItems.filter(
      course =>
      course.checked &&
      /^[0-9]+$/.test(course.num) &&
      parseInt(course.num) >= 60
    )

    let res = 0.0
    let totalCredit = 0
    if (!tmp.length) return res

    tmp.forEach(course => {
      const score = parseFloat(course.num)
      const credit = parseFloat(course.credit)
      if (score >= 97) res += 4.0 * credit
      else if (score >= 93) res += 3.94 * credit
      else if (score >= 90) res += 3.85 * credit
      else if (score >= 87) res += 3.73 * credit
      else if (score >= 83) res += 3.55 * credit
      else if (score >= 80) res += 3.32 * credit
      else if (score >= 77) res += 3.09 * credit
      else if (score >= 73) res += 2.78 * credit
      else if (score >= 70) res += 2.42 * credit
      else if (score >= 67) res += 2.08 * credit
      else if (score >= 63) res += 1.63 * credit
      else res += 1.15 * credit
      totalCredit += credit
    })
    return res / totalCredit
  },
  formGoTo: function (e) {
    const that = this
    const account = app.globalData.account
    const course = e.detail.target.dataset.name
    const formid = e.detail.formId
    if (this.data.session) {
      that.subscribe(account, formid, course)
    } else {
      wx.login({
        success(res) {
          if (res.code) {
            wx.request({
              url: 'https://ji.s-cry.com/login',
              method: "POST",
              header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
              },
              data: {
                code: res.code
              },
              success: function({ data }) {
                that.setData({
                  session: data.session_key
                })
                that.subscribe(account, formid, course)
              }
            })
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
    }
    console.log(formid)
  },
  //向后台发送formid
  
  submintFromId: function (formid) {
    var that = this
  },

  subscribe(account, formId, course) {

    wx.request({
      url: 'https://ji.s-cry.com/subscribe',
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        username: account.username,
        password: account.password,
        formId: formId,
        course: course,
        session: this.data.session
      },
      success: function ({ data }) {
        console.log(data)
      }
    })
  }
});