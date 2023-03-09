import Config from './config.js'
import store from '@/store/index.js'
import JSEncrypt from 'jsencrypt'
import Http from './http.js'

export default {
	/**
	 * 页面跳转
	 * @param {string} to 跳转链接 /pages/index/index
	 * @param {Object} param 参数 {key : value, ...}
	 * @param {string} mode 模式 
	 */
	redirectTo(to, param, mode) {
		let url = to;
		// console.log({"$store":store.state.$store.tabbarList.list}) 
		let tabbarList = ['/pages/index/index/index', '/pages/goods/category/category', '/pages/goods/cart/cart',
			'/pages/member/index/index'
		]
		for (let i = 0; i < tabbarList.length; i++) {
			if (to.indexOf(tabbarList[i]) != -1) {
				uni.switchTab({
					url: url
				})
				return;
			}
		}

		// // #ifdef H5
		// window.history.pushState(null, null, url);
		// // #endif

		if (param != undefined) {
			Object.keys(param).forEach(function(key) {
				if (url.indexOf('?') != -1) {
					url += "&" + key + "=" + param[key];
				} else {
					url += "?" + key + "=" + param[key];
				}
			});
		}
		switch (mode) {
			case 'tabbar':
				// 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面。
				uni.switchTab({
					url: url
				})
				break;
			case 'redirectTo':
				// 关闭当前页面，跳转到应用内的某个页面。
				uni.redirectTo({
					url: url
				});
				break;
			case 'reLaunch':
				// 关闭所有页面，打开到应用内的某个页面。
				uni.reLaunch({
					url: url
				});
				break;
			default:
				// 保留当前页面，跳转到应用内的某个页面
				uni.navigateTo({
					url: url
				});
		}
	},
	/**
	 * 图片路径转换
	 * @param {String} img_path 图片地址
	 * @param {Object} params 参数，针对商品、相册里面的图片区分大中小，size: big、mid、small
	 */
	img(img_path, params) {
		var path = "";
		if (img_path && img_path != undefined && img_path != "") {
			if (params && img_path != this.getDefaultImage().default_goods_img) {
				// 过滤默认图
				let arr = img_path.split(".");
				let suffix = arr[arr.length - 1];
				arr.pop();
				arr[arr.length - 1] = arr[arr.length - 1] + "_" + params.size;
				arr.push(suffix);
				img_path = arr.join(".");
			}
			if (img_path.indexOf("http://") == -1 && img_path.indexOf("https://") == -1) {
				path = Config.imgDomain + "/" + img_path;
			} else {
				path = img_path;
			}
		}
		return path;
	},
	/**
	 * 时间戳转日期格式
	 * @param {Object} timeStamp
	 */
	timeStampTurnTime(timeStamp, type = "") {
		if (timeStamp != undefined && timeStamp != "" && timeStamp > 0) {
			var date = new Date();
			date.setTime(timeStamp * 1000);
			var y = date.getFullYear();
			var m = date.getMonth() + 1;
			m = m < 10 ? ('0' + m) : m;
			var d = date.getDate();
			d = d < 10 ? ('0' + d) : d;
			var h = date.getHours();
			h = h < 10 ? ('0' + h) : h;
			var minute = date.getMinutes();
			var second = date.getSeconds();
			minute = minute < 10 ? ('0' + minute) : minute;
			second = second < 10 ? ('0' + second) : second;
			if (type) {
				return y + '-' + m + '-' + d;
			} else {
				return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
			}

		} else {
			return "";
		}
	},
	/**
	 * 日期格式转时间戳
	 * @param {Object} timeStamp
	 */
	timeTurnTimeStamp(string) {
		var f = string.split(' ', 2);
		var d = (f[0] ? f[0] : '').split('-', 3);
		var t = (f[1] ? f[1] : '').split(':', 3);
		return (new Date(
			parseInt(d[0], 10) || null,
			(parseInt(d[1], 10) || 1) - 1,
			parseInt(d[2], 10) || null,
			parseInt(t[0], 10) || null,
			parseInt(t[1], 10) || null,
			parseInt(t[2], 10) || null
		)).getTime() / 1000;
	},
	/**
	 * 倒计时
	 * @param {Object} seconds 秒
	 */
	countDown(seconds) {
		let [day, hour, minute, second] = [0, 0, 0, 0]
		if (seconds > 0) {
			day = Math.floor(seconds / (60 * 60 * 24))
			hour = Math.floor(seconds / (60 * 60)) - (day * 24)
			minute = Math.floor(seconds / 60) - (day * 24 * 60) - (hour * 60)
			second = Math.floor(seconds) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60)
		}
		if (day < 10) {
			day = '0' + day
		}
		if (hour < 10) {
			hour = '0' + hour
		}
		if (minute < 10) {
			minute = '0' + minute
		}
		if (second < 10) {
			second = '0' + second
		}
		return {
			d: day,
			h: hour,
			i: minute,
			s: second
		};
	},
	/**
	 * 数值去重
	 * @param {Array} arr 数组
	 * @param {string} field 字段
	 */
	unique(arr, field) {
		const res = new Map();
		return arr.filter((a) => !res.has(a[field]) && res.set(a[field], 1));
	},
	/**
	 * 判断值是否在数组中
	 * @param {Object} elem
	 * @param {Object} arr
	 * @param {Object} i
	 */
	inArray: function(elem, arr) {
		return arr == null ? -1 : arr.indexOf(elem);
	},
	/**
	 * 获取某天日期
	 * @param {Object} day
	 */
	getDay: function(day) {
		var today = new Date();
		var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
		today.setTime(targetday_milliseconds);

		const doHandleMonth = function(month) {
			var m = month;
			if (month.toString().length == 1) {
				m = "0" + month;
			}
			return m
		}

		var tYear = today.getFullYear();
		var tMonth = today.getMonth();
		var tDate = today.getDate();
		var tWeek = today.getDay();
		var time = parseInt(today.getTime() / 1000);
		tMonth = doHandleMonth(tMonth + 1);
		tDate = doHandleMonth(tDate);

		const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
		return {
			't': time,
			'y': tYear,
			'm': tMonth,
			'd': tDate,
			'w': week[tWeek]
		};
	},
	/**
	 * 图片选择加上传
	 * @param number num
	 * @param {Object} params
	 * @param {Object} callback
	 * @param string url
	 * return array
	 */
	upload: function(num, params, callback, url) {
		// #ifdef H5
		var app_type = this.isWeiXin() ? 'wechat' : 'h5';
		var app_type_name = this.isWeiXin() ? '微信公众号' : 'H5';
		// #endif

		// #ifdef MP-WEIXIN
		var app_type = 'weapp';
		var app_type_name = '微信小程序';
		// #endif

		// #ifdef MP-ALIPAY
		var app_type = 'aliapp';
		var app_type_name = '支付宝小程序';
		// #endif

		// #ifdef MP-BAIDU
		var app_type = 'baiduapp';
		var app_type_name = '百度小程序';
		// #endif

		// #ifdef MP-TOUTIAO
		var app_type = 'MP-TOUTIAO';
		var app_type_name = '头条小程序';
		// #endif

		// #ifdef MP-QQ
		var app_type = 'MP-QQ';
		var app_type_name = 'QQ小程序';
		// #endif
		var data = {
			token: uni.getStorageSync('token'),
			app_type: app_type,
			app_type_name: app_type_name
		}
		data = Object.assign(data, params);

		// 请求参数加密
		// if (Config.apiSecurity) {
		// 	let jsencrypt = new JSEncrypt();
		// 	jsencrypt.setPublicKey(Config.publicKey);
		// 	let encrypt = encodeURIComponent(jsencrypt.encryptLong(JSON.stringify(data)));
		// 	data = {
		// 		encrypt
		// 	};
		// }
		var imgs_num = num;
		var _self = this;
		uni.chooseImage({
			count: imgs_num,
			sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], //从相册或者拍照
			success: async function(res) {
				const tempFilePaths = res.tempFilePaths;

				var _data = data;
				var imgs = [];
				for (var i = 0; i < tempFilePaths.length; i++) {
					var path = await _self.upload_file_server(tempFilePaths[i], _data, params.path, url);
					imgs.push(path);
				}
				typeof callback == 'function' && callback(imgs);
			}
		});
	},
	//上传
	upload_file_server(tempFilePath, data, path, url = "") {
		if (url) {
			var uploadUrl = Config.baseUrl + url
		} else {
			var uploadUrl = Config.baseUrl + '/api/upload/' + path
		}
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: uploadUrl,
				filePath: tempFilePath,
				name: 'file',
				formData: data,
				success: function(res) {
					var path_str = JSON.parse(res.data);
					if (path_str.code >= 0) {
						resolve(path_str.data.pic_path);
					} else {
						reject("error");
					}
				}
			});

		});

	},
	/**
	 * 复制
	 * @param {Object} message
	 * @param {Object} callback
	 */
	copy(value, callback) {
		// #ifdef H5
		var oInput = document.createElement('input'); //创建一个隐藏input（重要！）
		oInput.value = value; //赋值
		document.body.appendChild(oInput);
		oInput.select(); // 选择对象
		document.execCommand("Copy"); // 执行浏览器复制命令
		oInput.className = 'oInput';
		oInput.style.display = 'none';
		uni.hideKeyboard();
		this.showToast({
			title: '复制成功'
		});

		typeof callback == 'function' && callback();
		// #endif

		// #ifdef MP || APP-PLUS
		uni.setClipboardData({
			data: value,
			success: () => {
				typeof callback == 'function' && callback();
			}
		});
		// #endif
	},
	/**
	 * 是否是微信浏览器
	 */
	isWeiXin() {
		// #ifndef H5
		return false;
		// #endif
		var ua = navigator.userAgent.toLowerCase();
		if (ua.match(/MicroMessenger/i) == "micromessenger") {
			return true;
		} else {
			return false;
		}
	},
	/**
	 * 显示消息提示框
	 *  @param {Object} params 参数
	 */
	showToast(params = {}) {
		params.title = params.title || "";
		params.icon = params.icon || "none";
		params.position = params.position || 'bottom';
		params.duration = 1500;
		uni.showToast(params);
	},
	/**
	 * 检测苹果X以上的手机
	 */
	isIPhoneX() {
		let res = uni.getSystemInfoSync();
		if (res.model.search('iPhone X') != -1) {
			return true;
		}
		return false;
	},
	//判断安卓还是iOS
	isAndroid() {
		let platform = uni.getSystemInfoSync().platform
		if (platform == 'ios') {
			return false;
		} else if (platform == 'android') {
			return true;
		}
	},
	/**
	 * 深度拷贝对象
	 * @param {Object} obj
	 */
	deepClone(obj) {
		const isObject = function(obj) {
			return typeof obj == 'object';
		}

		if (!isObject(obj)) {
			throw new Error('obj 不是一个对象！')
		}
		//判断传进来的是对象还是数组
		let isArray = Array.isArray(obj)
		let cloneObj = isArray ? [] : {}
		//通过for...in来拷贝
		for (let key in obj) {
			cloneObj[key] = isObject(obj[key]) ? this.deepClone(obj[key]) : obj[key]
		}
		return cloneObj
	},
	refreshBottomNav() {
		var bottomNav = uni.getStorageSync("bottom_nav");
		bottomNav = JSON.parse(bottomNav);
		for (var i = 0; i < bottomNav.list.length; i++) {
			var item = bottomNav.list[i];
			var obj = {
				index: i
			};
			obj.text = item.title;
			obj.iconPath = this.img(item.iconPath);
			obj.selectedIconPath = this.img(item.selectedIconPath);
			if (bottomNav.type == 1) {
				// 图文
			} else if (bottomNav.type == 2) {
				// 图片
			} else if (bottomNav.type == 3) {
				// 文字
			}
			uni.setTabBarItem(obj);
		}
	},
	/**
	 * 自定义模板的跳转链接
	 * @param {Object} link
	 */
	diyRedirectTo(link, method) {
		if (link == null || link == '' || !link.wap_url) return;
		if (link.wap_url.indexOf('http') != -1) {
			this.redirectTo('/otherpages/webview/webview', {
				link: encodeURIComponent(link.wap_url)
			});
		} else {
			var params = link.site_id ? {
				site_id: link.site_id
			} : {};
			this.redirectTo(link.wap_url);
		}
	},
	/**
	 * 获取默认图
	 * @param {Object} link
	 */
	getDefaultImage() {
		let defaultImg = uni.getStorageSync('default_img');
		if (defaultImg) {
			defaultImg = JSON.parse(defaultImg);
			defaultImg.default_goods_img = this.img(defaultImg.default_goods_img);
			defaultImg.default_headimg = this.img(defaultImg.default_headimg);
			defaultImg.default_shop_img = this.img(defaultImg.default_shop_img);
			defaultImg.default_category_img = this.img(defaultImg.default_category_img);
			defaultImg.default_city_img = this.img(defaultImg.default_city_img);
			defaultImg.default_supply_img = this.img(defaultImg.default_supply_img);
			defaultImg.default_store_img = this.img(defaultImg.default_store_img);
			defaultImg.default_brand_img = this.img(defaultImg.default_brand_img);
			return defaultImg;
		} else {
			return {
				default_goods_img: '',
				default_headimg: '',
				default_shop_img: '',
				default_category_img: '',
				default_city_img: '',
				default_supply_img: '',
				default_store_img: '',
				default_brand_img: ''
			};
		}
	},
	/**
	 * 判断手机是否为iphoneX系列
	 */
	uniappIsIPhoneX() {
		let isIphoneX = false;
		let systemInfo = uni.getSystemInfoSync();
		// #ifdef MP
		if (systemInfo.model.search('iPhone X') != -1 || systemInfo.model.search('iPhone 11') != -1 || systemInfo.model.search(
				'iPhone12') != -1) {
			isIphoneX = true;
		}
		// #endif

		// #ifdef H5
		var u = navigator.userAgent;
		var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

		if (isIOS) {
			if (systemInfo.screenWidth == 375 && systemInfo.screenHeight == 812 && systemInfo.pixelRatio == 3) {
				isIphoneX = true;
			} else if (systemInfo.screenWidth == 414 && systemInfo.screenHeight == 896 && systemInfo.pixelRatio == 3) {
				isIphoneX = true;
			} else if (systemInfo.screenWidth == 414 && systemInfo.screenHeight == 896 && systemInfo.pixelRatio == 2) {
				isIphoneX = true;
			}
		}
		// #endif
		return isIphoneX;
	},
	/**
	 * 判断手机是否为iphone11系列
	 */
	uniappIsIPhone11() {
		let isIphone11 = false;
		let systemInfo = uni.getSystemInfoSync();
		// #ifdef MP
		if (systemInfo.model.search('iPhone 11') != -1) {
			isIphone11 = true;
		}
		// #endif
		return isIphone11;
	},
	/**
	 * 判断当前页面栈是否存在，如果存在，则返回该页面栈，否则跳转到该页面
	 * @param {Object} url
	 */
	jumpPage(url) {
		let jump = true;
		let arr = getCurrentPages().reverse();
		for (let i = 0; i < arr.length; i++) {
			if (url.indexOf(arr[i].route) != -1) {
				jump = false;
				uni.navigateBack({
					delta: i
				});
				break;
			}
		}
		if (jump) {
			this.$util.diyRedirectTo(url);
		}
	},
	/**
	 * 计算两个经纬度之间的距离
	 * @param {Object} lat1
	 * @param {Object} lng1
	 * @param {Object} lat2
	 * @param {Object} lng2
	 */
	getDistance(lat1, lng1, lat2, lng2) {
		var radLat1 = lat1 * Math.PI / 180.0;
		var radLat2 = lat2 * Math.PI / 180.0;
		var a = radLat1 - radLat2;
		var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
		var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
			Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
		s = s * 6378.137; // EARTH_RADIUS;
		s = Math.round(s * 10000) / 10000;
		return s;
	},
	// #ifdef H5
	/**
	 * 判断该浏览器是否为safaria浏览器
	 */
	isSafari() {
		let res = uni.getSystemInfoSync();
		var ua = navigator.userAgent.toLowerCase();
		if (ua.indexOf('applewebkit') > -1 && ua.indexOf('mobile') > -1 && ua.indexOf('safari') > -1 &&
			ua.indexOf('linux') === -1 && ua.indexOf('android') === -1 && ua.indexOf('chrome') === -1 &&
			ua.indexOf('ios') === -1 && ua.indexOf('browser') === -1) {
			return true;
		} else {
			return false;
		}
	},
	// #endif
	goBack(backUrl = '/pages/index/index/index') {
		if (getCurrentPages().length == 1) {
			this.redirectTo(backUrl);
		} else {
			uni.navigateBack();
		}
	},
	/**
	 * 转换数字，保留f位
	 * @param {Object} e
	 * @param {Object} f
	 */
	numberFixed(e, f) {
		if (!f) {
			f = 0;
		}
		return Number(e).toFixed(f);
	},
	/**
	 * 获取url参数
	 * @param {Object} callback
	 */
	getUrlCode(callback) {
		var url = location.search;
		var theRequest = new Object();
		if (url.indexOf('?') != -1) {
			var str = url.substr(1);
			var strs = str.split('&');
			for (var i = 0; i < strs.length; i++) {
				theRequest[strs[i].split('=')[0]] = strs[i].split('=')[1];
			}
		}
		typeof callback == 'function' && callback(theRequest);
	},
	// 站内信时间封装
	getSitemessageDate(time) {
		let curr_time = new Date();
		
		let curr_year = Number(curr_time.getFullYear());
		let curr_month = Number(curr_time.getMonth()) + 1;
		let curr_day = Number(curr_time.getDate());
		let curr_hours = Number(curr_time.getHours());
		let curr_minutes = Number(curr_time.getMinutes());
		
		let arr = time.split(" ");
		
		let send_year = Number(arr[0].split("-")[0]);
		let send_month = Number(arr[0].split("-")[1]);
		let send_day = Number(arr[0].split("-")[2]);
		let send_hours = Number(arr[1].split(":")[0]);
		let send_minutes = Number(arr[1].split(":")[1]);
		let send_date = send_year + "-" + (send_month >= 10 ? send_month : '0' + send_month) + "-" + (send_day >= 10 ? send_day : '0' + send_day);
		
		if (curr_year > send_year) {
			return send_date;
		} else {
			if (curr_month > send_month || (curr_month == send_month && (curr_day - send_day > 1))) {
				return (send_month >= 10 ? send_month : '0' + send_month) + "-" + (send_day >= 10 ? send_day : '0' + send_day);
			} else if (curr_month == send_month && curr_day - send_day == 1) {
				return "昨天" + (send_hours >= 10 ? send_hours : '0' + send_hours) + ":" + (send_minutes >= 10 ? send_minutes : '0' + send_minutes);
			} else {
				return (send_hours >= 10 ? send_hours : '0' + send_hours) + ":" + (send_minutes >= 10 ? send_minutes : '0' + send_minutes);
			}
		}
	}

}
