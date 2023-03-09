export default {
	data() {
		return {
			isIphoneX: false,
			orderCreateData: {
				is_balance: 0,
				pay_password: ''
			},
			orderPaymentData: {
				member_account: {
					balance: 0,
					is_pay_password: 0,
					mobile:''
				},
				shop_goods_list: {
					site_name: '',
					express_type: [],
					invoice_config: {
						invoice_status: 0
					}
				}
			},
			orderInvoice: {
				is_invoice: 0, //是否需要发票
				invoice_type: 1, //发票类型电子、纸质
				invoice_title: '', //发票抬头
				invoice_title_type: 1, // 抬头类型
				invoice_full_address: '', //邮寄地址
				is_tax_invoice: 0, //是否需要增值税发票
				invoice_email: '', // 邮箱
				invoice_content: '', //发票内容
				taxpayer_number: '' //纳税人识别号
			},
			isSub: false,
			tempData: null,
			siteDelivery: {
				site_id: 0,
				data: []
			}
		};
	},
	methods: {
		// 显示弹出层
		openPopup(ref) {
			this.$refs[ref].open();
		},
		// 关闭弹出层
		closePopup(ref) {
			if (this.tempData) {
				Object.assign(this.orderCreateData, this.tempData);
				Object.assign(this.orderPaymentData, this.tempData);
				this.tempData = null;
				this.$forceUpdate();
			}
			this.$refs[ref].close();
		},
		// 选择收货地址，默认有定位
		selectAddress() {
			var params = {
				back: '/promotionpages/bargain/payment/payment',
				local: 0,
				type: 1
			}
			// 外卖配送需要定位地址
			// if (this.orderPaymentData.delivery.delivery_type == 'local') {
			// 	params.local = 1;
			// 	params.type = 2;
			// }
			this.$util.redirectTo('/otherpages/member/address/address', params);
		},
		// 获取订单初始化数据
		getOrderPaymentData() {
			this.orderCreateData = uni.getStorageSync('bargainOrderCreateData');
			var pay_flag = uni.getStorageSync("pay_flag"); // 支付中标识，防止返回时，提示,跳转错误
			if (!this.orderCreateData) {
				if (pay_flag == 1) {
					uni.removeStorageSync("pay_flag");
				} else {
					this.$util.showToast({
						title: '未获取到创建订单所需数据！'
					});
					setTimeout(() => {
						this.$util.redirectTo('/pages/index/index/index', {}, 'reLaunch');
					}, 1000);
				}
				return;
			}

			// 获取经纬度
			let location = uni.getStorageSync('location');
			if (location) {
				this.orderCreateData = Object.assign(this.orderCreateData, location);
			}

			this.orderCreateData.buyer_message = '';

			this.$api.sendRequest({
				url: '/bargain/api/ordercreate/payment',
				data: this.orderCreateData,
				success: res => {
					if (res.code >= 0) {
						this.orderPaymentData = res.data;
						this.orderPaymentData.timestamp = res.timestamp;
						this.handlePaymentData();
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
					} else {
						this.$util.showToast({
							title: '未获取到创建订单所需数据！'
						});
						setTimeout(() => {
							this.$util.redirectTo('/pages/index/index/index', {}, 'reLaunch');
						}, 1000);
					}
				},
				fail: res => {
					if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
				}
			})
		},
		// 处理结算订单数据
		handlePaymentData() {
			this.orderCreateData.delivery = {};
			this.orderCreateData.invoice = {};
			this.orderCreateData.is_balance = 0;
			this.orderCreateData.pay_password = '';

			var data = this.orderPaymentData;

			let h = new Date().getHours().toString();
			let m = new Date().getMinutes().toString();
			if (h.length == 1) {
				h = '0' + h;
			}
			if (m.length == 1) {
				m = '0' + m;
			}
			let nowTime = h + ':' + m;
			var weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

			// 获取时间，必须是字符串,跟后端一致
			let index_weeks = ['0', '1', '2', '3', '4', '5', '6'];
			let curr_week = index_weeks[new Date().getDay()];

			if (data.shop_goods_list.express_type != undefined && data.shop_goods_list.express_type[0] != undefined) {
				var express_type = data.shop_goods_list.express_type;
				this.orderCreateData.delivery.delivery_type = express_type[0].name;
				this.orderCreateData.delivery.delivery_type_name = express_type[0].title;
				this.orderCreateData.delivery.store_id = 0;

				// 如果默认配送方式是门店配送
				if (express_type[0].name == 'store') {
					if (express_type[0].store_list[0] != undefined) {
						this.orderCreateData.delivery.store_id = express_type[0].store_list[0].store_id;
					}
				}
			}

			if (data.is_virtual == 0 && data.shop_goods_list.local_config) {

				// 是否显示时间选择
				if (data.shop_goods_list.local_config.info && data.shop_goods_list.local_config.info.time_is_open == 1) {
					this.orderCreateData.delivery.showTimeBar = true;
					this.orderCreateData.delivery.buyer_ask_delivery_time = nowTime;
					// 当日是否支持配送
					if (data.shop_goods_list.local_config.info.time_week.length == 0 ||
						data.shop_goods_list.local_config.info.time_week.length == 7 ||
						data.shop_goods_list.local_config.info.time_week.indexOf(curr_week) > -1) {
						this.orderCreateData.delivery.canLocalDelicery = true;
					} else {
						this.orderCreateData.delivery.canLocalDelicery = false;
					}

					if (data.shop_goods_list.local_config.info.time_type == 0) {
						this.orderCreateData.delivery.deliveryWeek = "全天";
					} else if (data.shop_goods_list.local_config.info.time_week.length > 0) {
						if (data.shop_goods_list.local_config.info.time_week.length == 7) {
							this.orderCreateData.delivery.deliveryWeek = "全天";
							this.orderCreateData.delivery.showTime = false;
						} else {
							this.orderCreateData.delivery.showTime = true;
							// 判断配送时间是连续还是间隔
							var timeWeek = data.shop_goods_list.local_config.info.time_week;
							var is_interval = false; // 是否间隔
							for (var i = 0; i < timeWeek.length; i++) {
								if ((i + 1) < timeWeek.length) {
									var difference = timeWeek[i + 1] - timeWeek[i];
									if (difference > 1) {
										is_interval = true;
										break;
									}
								}
							}

							if (is_interval) {
								var temp = [];
								for (var i = 0; i < timeWeek.length; i++) {
									temp.push(weeks[timeWeek[i]]);
								}
								this.orderCreateData.delivery.deliveryWeek = temp.join("、");
							} else {
								this.orderCreateData.delivery.deliveryWeek = weeks[timeWeek[0]] + "至" + weeks[timeWeek[timeWeek.length -
									1]];
							}
						}
					} else {
						this.orderCreateData.delivery.deliveryWeek = "店铺未设置配送时间";
					}

					// picker组件时间起始
					let start_time = data.shop_goods_list.local_config.info.start_time;
					this.orderCreateData.delivery.start_time = this.getTimeStr(start_time);

					let end_time = data.shop_goods_list.local_config.info.end_time;
					this.orderCreateData.delivery.end_time = this.getTimeStr(end_time);

					var current_time = new Date(this.$util.timeStampTurnTime(data.timestamp));
					var hour = current_time.getHours();
					var minute = current_time.getMinutes();

					var start_hour = parseInt(this.orderCreateData.delivery.start_time.split(":")[0]);
					var start_minute = parseInt(this.orderCreateData.delivery.start_time.split(":")[1]);

					var end_hour = parseInt(this.orderCreateData.delivery.end_time.split(":")[0]);
					var end_minute = parseInt(this.orderCreateData.delivery.end_time.split(":")[1]);

					// 检测当天是否能够配送，然后判断送达时间。不在配送时间当日不能下单，例：配送时间是周一到周五，那么周末不能下单，周一到周五可以下单
					if (this.orderCreateData.delivery.canLocalDelicery) {

						// 判断是否全天
						if (!(start_hour == end_hour && start_minute == end_minute)) {

							// 当前时间早于配送时间，送达时间：开始时间~结束时间
							if ((hour < start_hour) || (hour == start_hour && minute < start_minute)) {
								this.orderCreateData.delivery.buyer_ask_delivery_time = (start_hour.toString().length == 1 ? "0" + start_hour :
										start_hour) + ':' +
									(start_minute.toString().length == 1 ? "0" + start_minute : start_minute);
							}

							// if (((hour > start_hour && hour < end_hour) || (hour == start_hour && minute > start_minute) || (hour ==
							// 		start_hour && minute >= start_minute && hour < end_hour))) {
							// }

							// 当前时间晚于配送时间，送达时间隐藏，不能下单
							if ((hour > end_hour) || (hour == end_hour && minute > end_minute)) {
								this.orderCreateData.delivery.canLocalDelicery = false;
							}
						}

					}

				} else {
					this.orderCreateData.delivery.showTimeBar = false;
					this.orderCreateData.delivery.deliveryWeek = "店铺未开启配送时间";
				}

			}

			data.shop_goods_list.goods_list.forEach((v) => {
				if (typeof(v.sku_spec_format) == 'string') {
					if (v.sku_spec_format) {
						v.sku_spec_format = JSON.parse(v.sku_spec_format);
					} else {
						v.sku_spec_format = [];
					}
				}
			});

			if (this.orderPaymentData.is_virtual) this.orderCreateData.member_address = {
				mobile: ''
			};

			Object.assign(data, this.orderCreateData);
			this.orderCalculate();
		},
		// 转化时间字符串
		getTimeStr(val) {
			var h = parseInt(val / 3600).toString();
			var m = parseInt((val % 3600) / 60).toString();
			if (m.length == 1) {
				m = '0' + m;
			}
			if (h.length == 1) {
				h = '0' + h;
			}
			return h + ':' + m;
		},
		// 订单计算
		orderCalculate() {
			let siteId = this.orderPaymentData.shop_goods_list.site_id;

			var deliveryObj = {};
			deliveryObj[siteId] = this.orderCreateData.delivery;

			var messageObj = {};
			messageObj[siteId] = this.orderCreateData.buyer_message;

			//店铺发票
			if (this.orderPaymentData.shop_goods_list.is_invoice) {
				this.orderCreateData.invoice[siteId] = {};
				if (!Array.isArray(this.orderPaymentData.shop_goods_list.invoice_config)) {
					this.orderCreateData.invoice[siteId].is_invoice = this.orderPaymentData.shop_goods_list.is_invoice;
					this.orderCreateData.invoice[siteId].invoice_type = this.orderPaymentData.shop_goods_list.invoice_type;
					this.orderCreateData.invoice[siteId].invoice_title = this.orderPaymentData.shop_goods_list.invoice_title;
					this.orderCreateData.invoice[siteId].taxpayer_number = this.orderPaymentData.shop_goods_list.taxpayer_number;
					this.orderCreateData.invoice[siteId].invoice_content = this.orderPaymentData.shop_goods_list.invoice_content;
					this.orderCreateData.invoice[siteId].invoice_full_address = this.orderPaymentData.shop_goods_list.invoice_full_address;
					this.orderCreateData.invoice[siteId].is_tax_invoice = this.orderPaymentData.shop_goods_list.is_tax_invoice;
					this.orderCreateData.invoice[siteId].invoice_email = this.orderPaymentData.shop_goods_list.invoice_email;
					this.orderCreateData.invoice[siteId].invoice_title_type = this.orderPaymentData.shop_goods_list.invoice_title_type;
				}
			}

			var data = this.$util.deepClone(this.orderCreateData);
			data.delivery = JSON.stringify(deliveryObj);
			data.invoice = JSON.stringify(data.invoice);
			data.member_address = JSON.stringify(data.member_address);
			data.buyer_message = JSON.stringify(messageObj);

			this.$api.sendRequest({
				url: '/bargain/api/ordercreate/calculate',
				data,
				success: res => {
					if (res.code >= 0) {
						this.orderPaymentData.member_address = res.data.member_address;
						this.orderPaymentData.delivery_money = res.data.delivery_money;
						this.orderPaymentData.invoice_money = res.data.invoice_money;
						this.orderPaymentData.invoice_delivery_money = res.data.invoice_delivery_money;
						this.orderPaymentData.promotion_money = res.data.promotion_money;
						this.orderPaymentData.order_money = res.data.order_money;
						this.orderPaymentData.balance_money = res.data.balance_money;
						this.orderPaymentData.pay_money = res.data.pay_money;
						this.orderPaymentData.goods_money = res.data.goods_money;
						this.$forceUpdate();
					} else {
						this.$util.showToast({
							title: res.message
						});
					}
				}
			})
		},
		/**
		 * 订单创建
		 * @param {String} pay_password 支付密码
		 */
		orderCreate(pay_password) {
			if (this.verify()) {
				if (this.isSub) return;
				this.isSub = true;

				if (pay_password) this.orderCreateData.pay_password = pay_password;

				let siteId = this.orderPaymentData.shop_goods_list.site_id;

				var deliveryObj = {};
				deliveryObj[siteId] = this.orderCreateData.delivery;

				var messageObj = {};
				messageObj[siteId] = this.orderCreateData.buyer_message;

				var data = this.$util.deepClone(this.orderCreateData);
				data.delivery = JSON.stringify(deliveryObj);
				data.invoice = JSON.stringify(data.invoice);
				data.member_address = JSON.stringify(data.member_address);
				data.buyer_message = JSON.stringify(messageObj);

				this.$api.sendRequest({
					url: '/bargain/api/ordercreate/create',
					data,
					success: res => {
						uni.hideLoading();
						if (res.code >= 0) {
							if (this.orderPaymentData.pay_money == 0) {
								this.$util.redirectTo('/pages/pay/result/result', {
									code: res.data
								}, 'redirectTo');
							} else {
								this.$refs.choosePaymentPopup.getPayInfo(res.data);
								this.isSub = false;
							}
							// uni.removeStorage({
							// 	key: 'bargainOrderCreateData',
							// 	success: () => {}
							// });
						} else {
							this.isSub = false;
							if (res.data.error_code == 10 || res.data.error_code == 12) {
								uni.showModal({
									title: '订单未创建',
									content: res.message,
									confirmText: '去设置',
									success: res => {
										if (res.confirm) {
											this.selectAddress();
										}
									}
								})
							} else {
								this.$util.showToast({
									title: res.message
								});
							}
						}
					},
					fail: res => {
						uni.hideLoading();
						this.isSub = false;
					}
				})
			}
		},
		// 订单验证
		verify() {
			if (this.orderPaymentData.is_virtual == 1) {
				if (!this.orderPaymentData.member_account.mobile.length) {
					this.$util.showToast({
						title: '请输入您的手机号码'
					});
					return false;
				}
				var reg = /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/;
				if (!reg.test(this.orderPaymentData.member_account.mobile)) {
					this.$util.showToast({
						title: '请输入正确的手机号码'
					});
					return false;
				}
			}

			if (this.orderPaymentData.is_virtual == 0) {

				let expressTypeVerify = true;

				for (let key in this.orderPaymentData.shop_goods_list) {
					if (this.orderPaymentData.shop_goods_list.express_type.length == 0) {
						expressTypeVerify = false;
						this.$util.showToast({
							title: '店铺【"' + this.orderPaymentData.shop_goods_list.site_name + '】未设置配送方式'
						});
						break;
					}
				}

				if (!expressTypeVerify) return false;

				if (!this.orderPaymentData.member_address) {
					this.$util.showToast({
						title: '请先选择您的收货地址'
					});
					return false;
				}

				if (JSON.stringify(this.orderCreateData.delivery) == "{}") {
					this.$util.showToast({
						title: '店铺【"' + this.orderPaymentData.shop_goods_list.site_name + '】未设置配送方式'
					});
					return false;
				}

				if (this.orderCreateData.delivery.delivery_type == 'store' && this.orderCreateData.delivery.store_id == 0) {
					this.$util.showToast({
						title: '店铺【"' + this.orderPaymentData.shop_goods_list.site_name + '】没有可提货的门店,请选择其他配送方式'
					});
					return false;
				}

				if (this.orderCreateData.delivery.delivery_type == 'local') {

					if (this.orderCreateData.delivery.canLocalDelicery) {

						var hour = parseInt(this.orderCreateData.delivery.buyer_ask_delivery_time.split(":")[0]);
						var minute = parseInt(this.orderCreateData.delivery.buyer_ask_delivery_time.split(":")[1]);

						var start_hour = parseInt(this.orderCreateData.delivery.start_time.split(":")[0]);
						var start_minute = parseInt(this.orderCreateData.delivery.start_time.split(":")[1]);

						var end_hour = parseInt(this.orderCreateData.delivery.end_time.split(":")[0]);
						var end_minute = parseInt(this.orderCreateData.delivery.end_time.split(":")[1]);

						// 判断是否全天
						if (!(start_hour == end_hour && start_minute == end_minute)) {

							// 当前时间早于配送时间
							if (((hour < start_hour) || (hour == start_hour && minute < start_minute))) {
								this.$util.showToast({
									title: '店铺【"' + this.orderPaymentData.shop_goods_list.site_name + '】送达时间不能小于配送开始时间'
								});
								return false;
							}

							// 当前时间在配送时间内，送达时间：开始时间~结束时间
							if (!((hour > start_hour && hour < end_hour) || (hour == start_hour && minute > start_minute) || (hour ==
									start_hour && minute >= start_minute && hour < end_hour))) {
								this.$util.showToast({
									title: '店铺【"' + this.orderPaymentData.shop_goods_list.site_name + '】送达时间范围：开始时间~结束时间'
								});
								return false;
							}
						}
					} else {
						this.$util.showToast({
							title: '店铺【"' + this.orderPaymentData.shop_goods_list.site_name + '】已休息'
						});
						return false;
					}

				}

			}

			return true;
		},
		// 显示店铺优惠信息
		openSitePromotion() {
			this.$refs.sitePromotionPopup.open();
		},
		// 显示店铺配送信息
		openSiteDelivery() {
			this.tempData = {
				delivery: this.$util.deepClone(this.orderPaymentData.delivery)
			};
			this.$refs.deliveryPopup.open();
		},
		// 选择配送方式
		selectDeliveryType(data) {
			this.orderCreateData.delivery.delivery_type = data.name;
			this.orderCreateData.delivery.delivery_type_name = data.title;
			this.tempData = {
				delivery: this.$util.deepClone(this.orderPaymentData.delivery)
			};
			// 如果是门店配送
			if (data.name == 'store') {
				if (data.store_list[0] != undefined) {
					this.orderCreateData.delivery.store_id = data.store_list[0].store_id;
					this.tempData.delivery.store_id = data.store_list[0].store_id;
				}
			}
			Object.assign(this.orderPaymentData, this.orderCreateData);
			this.orderCalculate();
			this.$forceUpdate();
		},
		// 选择自提点
		selectPickupPoint(store_id) {
			this.orderCreateData.delivery.store_id = store_id;
			Object.assign(this.orderPaymentData, this.orderCreateData);
			this.orderCalculate();
			this.$forceUpdate();
			this.$refs['deliveryPopup'].close();
		},
		// 使用余额
		useBalance() {
			if (this.orderCreateData.is_balance) this.orderCreateData.is_balance = 0;
			else this.orderCreateData.is_balance = 1;
			this.orderCalculate();
			this.$forceUpdate();
		},
		imgError(goodsIndex) {
			this.orderPaymentData.shop_goods_list.goods_list[goodsIndex].sku_image = this.$util.getDefaultImage().default_goods_img;
			this.$forceUpdate();
		},
		//打开发票弹窗
		openInvoicePopup(val) {
			this.orderInvoice = this.$util.deepClone(val);
			this.orderInvoice.invoice_type = this.orderInvoice.invoice_type == undefined ? 1 : this.orderInvoice.invoice_type;
			this.orderInvoice.invoice_title_type = this.orderInvoice.invoice_title_type == undefined ? 1 : this.orderInvoice.invoice_title_type;
			this.orderInvoice.invoice_content = this.orderInvoice.invoice_content ? this.orderInvoice.invoice_content : '';
			this.orderInvoice.invoice_title = this.orderInvoice.invoice_title ? this.orderInvoice.invoice_title : '';
			this.orderInvoice.invoice_full_address = this.orderInvoice.invoice_full_address ? this.orderInvoice.invoice_full_address :
				''; //邮寄地址
			this.orderInvoice.is_tax_invoice = this.orderInvoice.is_tax_invoice ? this.orderInvoice.is_tax_invoice : 0; //是否需要增值税发票
			this.orderInvoice.invoice_email = this.orderInvoice.invoice_email ? this.orderInvoice.invoice_email : ''; // 邮箱
			this.orderInvoice.taxpayer_number = this.orderInvoice.taxpayer_number ? this.orderInvoice.taxpayer_number : ''; //纳税人识别号
			this.openPopup('invoicePopup');
		},
		// 切换发票开关
		changeIsInvoice() {
			if (this.orderInvoice.is_invoice == 0) {
				this.orderInvoice.is_invoice = 1;
			} else {
				this.orderInvoice.is_invoice = 0;
			}
			this.$forceUpdate();
		},
		// 切换发票类型
		changeInvoiceType(invoice_type) {
			this.orderInvoice.invoice_type = invoice_type;
			this.$forceUpdate();
		},
		// 切换发票个人还是企业
		changeInvoiceTitleType(invoice_title_type) {
			this.orderInvoice.invoice_title_type = invoice_title_type;
			this.$forceUpdate();
		},
		// 选择发票内容
		changeInvoiceContent(invoice_content) {
			this.orderInvoice.invoice_content = invoice_content;
			this.$forceUpdate();
		},
		//关闭发票弹窗
		closeInvoicePopup() {
			this.orderInvoice.invoice_type = 1; // 发票类型  1 纸质 2 电子
			this.orderInvoice.invoice_title_type = 1; // 抬头类型  1 个人 2 企业
			this.orderInvoice.invoice_content = ''; // 发票内容
			this.orderInvoice.invoice_title = ''; // 发票抬头
			this.orderInvoice.invoice_full_address = ''; // 发票邮寄地址
			this.orderInvoice.is_tax_invoice = 0; // 是否需要增值税专用发票  0 不需要 1 需要
			this.orderInvoice.invoice_email = ''; //发票邮箱
			this.orderInvoice.taxpayer_number = ''; //纳税人识别号
			this.orderCalculate();
			this.$forceUpdate();
			this.$refs.invoicePopup.close();
		},
		// 发票验证
		invoiceVerify() {
			if (this.orderInvoice.is_invoice == 1) {
				if (this.orderInvoice.invoice_title == '') {
					this.$refs.invoicePopup.open();
					this.$util.showToast({
						title: "请填写发票抬头"
					});
					return false;
				}
				if (this.orderInvoice.invoice_title_type == 2 && this.orderInvoice.taxpayer_number == '') {
					this.$refs.invoicePopup.open();
					this.$util.showToast({
						title: "请填写纳税人识别号"
					});
					return false;
				}
				if (this.orderInvoice.invoice_type == 1 && this.orderInvoice.invoice_full_address == '') {
					this.$refs.invoicePopup.open();
					this.$util.showToast({
						title: "请填写发票邮寄地址"
					});
					return false;
				}
				if (this.orderInvoice.invoice_type == 2 && this.orderInvoice.invoice_email == '') {
					this.$refs.invoicePopup.open();
					this.$util.showToast({
						title: "请填写邮箱"
					});
					return false;
				}
				if (this.orderInvoice.invoice_type == 2 && this.orderInvoice.invoice_email != '') {
					var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
					if (!reg.test(this.orderInvoice.invoice_email)) {
						this.$refs.invoicePopup.open();
						this.$util.showToast({
							title: "请填写正确的邮箱地址"
						});
						return false;
					}
				}
				if (this.orderInvoice.invoice_content == '') {
					this.$refs.invoicePopup.open();
					this.$util.showToast({
						title: "请选择发票内容"
					});
					return false;
				}

			}
			return true;
		},
		// 保存发票信息
		saveInvoice() {
			if (this.invoiceVerify()) {
				this.orderPaymentData.shop_goods_list = this.orderInvoice;
				this.orderCalculate();
				this.closePopup('invoicePopup');
			}
		},
		bindTimeChange(e) {
			let time = e.target.value;
			this.orderCreateData.delivery[e.currentTarget.dataset.siteid].buyer_ask_delivery_time = time;
			this.orderCalculate();
			this.$forceUpdate();
		},
		toShopDetail(e) {
			this.$util.redirectTo('/otherpages/shop/index/index', {
				site_id: e
			});
		},
		navigateTo(sku_id) {
			this.$util.redirectTo('/pages/goods/detail/detail', {
				sku_id
			});
		},
		// 显示选择支付方式弹框
		openChoosePayment() {
			uni.setStorageSync('paySource', '');
			if (this.verify()) {
				// #ifdef MP-WEIXIN
				this.subscribeMessage();
				// #endif
				this.$refs.choosePaymentPopup.open();
			}
		},
		/**
		 * 微信订阅消息
		 */
		subscribeMessage() {
			this.$api.sendRequest({
				url: '/weapp/api/weapp/messagetmplids',
				data: {
					keywords: 'ORDER_PAY,ORDER_DELIVERY,ORDER_TAKE_DELIVERY'
				},
				success: res => {
					if (res.data.length) {
						uni.requestSubscribeMessage({
							tmplIds: res.data,
							success: (res) => {},
							fail: (res) => {
								console.log('fail', res)
							}
						})
					}
				}
			})
		}
	},
	onShow() {
		// 刷新多语言
		this.$langConfig.refresh();

		if (uni.getStorageSync('addressBack')) {
			uni.removeStorageSync('addressBack');
		}

		// 判断登录
		if (!uni.getStorageSync('token')) {
			this.$util.redirectTo('/pages/login/login/login');
		} else {
			this.getOrderPaymentData();
		}

		this.isIphoneX = this.$util.uniappIsIPhoneX();
	},
	onHide() {
		if (this.$refs.loadingCover) this.$refs.loadingCover.show();
	},
	computed: {
		// 余额抵扣
		balanceDeduct() {
			if (this.orderPaymentData.member_account.balance_total <= parseFloat(this.orderPaymentData.order_money).toFixed(2)) {
				return parseFloat(this.orderPaymentData.member_account.balance_total).toFixed(2);
			} else {
				return parseFloat(this.orderPaymentData.order_money).toFixed(2);
			}
		},
		bargainPrice() {
			if (this.orderPaymentData && this.orderPaymentData.bargain_info) {
				return (Number(this.orderPaymentData.bargain_info.price) - Number(this.orderPaymentData.bargain_info.curr_price)).toFixed(
					2);
			} else {
				return 0;
			}
		}
	},
	filters: {
		// 金额格式化输出
		moneyFormat(money) {
			return parseFloat(money).toFixed(2);
		}
	}
}
