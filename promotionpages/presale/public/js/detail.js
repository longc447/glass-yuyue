import htmlParser from '@/common/js/html-parser';
import {Weixin} from '@/common/js/wx-jssdk.js';
import Config from '@/common/js/config.js'
export default {
	data() {
		return {
			id: 0,
			skuId: 0,
			groupId: 0,
			presale_order_count:0,
			// 商品详情
			goodsSkuDetail: {
				goods_id: 0,
				goods_service: []
			},
			presale_num: 0,
			
			// 店铺详情
			shopInfo: {
				logo: '',
				shop_baozh: 0,
				shop_qtian: 0,
				shop_zhping: 0,
				shop_erxiaoshi: 0,
				shop_tuihuo: 0,
				shop_shiyong: 0,
				shop_shiti: 0,
				shop_xiaoxie: 0
			},
			
			cartCount: 0, // 购物车商品数量
			whetherCollection: 0,
			// 媒体,图片,视频
			
			// 解决每个商品SKU图片数量不同时，无法切换到第一个，导致轮播图显示不出来
			swiperInterval: 1,
			swiperAutoplay: false,
			swiperCurrent: 1,
			switchMedia: 'img',
			
			couponList: [], //优惠券列表
			couponBtnSwitch: false, //获取优惠券防止重复提交
			
			//评价数量
			token: "",
			isIphoneX: false, //判断手机是否是iphoneX以上

			poster: "-1", //海报
			posterMsg: "", //海报错误信息
			posterHeight: 0,

			//评价
			goodsEvaluate: {
				member_headimg: '',
				member_name: '',
				content: '',
				images: [],
				create_time: 0,
				sku_name: ''
			},
			
			currentPintuan: {
				headimg: '',
				timeMachine: {}
			},
			openPopup: false,
			memberId: 0,
			//满减活动
			manjian: {
				type: 0,
				manjian_name: "",
				rule_json: null
			},
			//评价
			goodsEvaluate: {
				member_headimg: '',
				member_name: '',
				content: '',
				images: [],
				create_time: 0,
				sku_name: ''
			},
			//组合套餐
			bundling: [{
				bundling_goods: {
					bl_name: '',
					sku_image: ''
				}
			}],
			contactData: {
				title: '',
				path: '',
				img: ''
			},
			detailTab: 0,
			service: null,
			preview: 0,	//是否开启预览，0：不开启，1：开启
			// 是否可分享到好物圈
			goodsCircle: false,
			timestamp:'',
			evaluateConfig: {
				evaluate_audit: 1,
				evaluate_show: 0,
				evaluate_status: 1
			},
			showKefu: 0,
			kefuConfig: {},
			evaluateConfig: {
				evaluate_audit: 1,
				evaluate_show: 0,
				evaluate_status: 1
			}
		}
	},
	// computed: {
	// 	showDiscount() {
	// 		var flag = false;
	// 		if (
	// 			this.preview == 0 &&
	// 			this.addonIsExit.discount &&
	// 			this.goodsSkuDetail.promotion_type == 1 &&
	// 			this.goodsSkuDetail.discountTimeMachine
	// 			// (!this.goodsSkuDetail.member_price ||
	// 			// 	(this.goodsSkuDetail.member_price > 0 && Number(this.goodsSkuDetail.member_price) > Number(this.goodsSkuDetail.discount_price))
	// 			// )
	// 		) {
	// 			flag = true;
	// 		}else if(this.preview == 0 && this.addonIsExit.discount && this.goodsSkuDetail.promotion_type == 0 && this.goodsSkuDetail.member_price >0){
	// 			flag = true;
	// 		}
	// 		return flag;
	// 	},
	// 	addonIsExit() {
	// 		return this.$store.state.addonIsExit;
	// 	}
	// },
	onLoad(data) {
		this.id = data.id || 0;
		this.skuId = data.sku_id || 0;
		
		this.isIphoneX = this.$util.uniappIsIPhoneX()
		if (data.suid) uni.setStorageSync('suid', data.suid);
		// 小程序扫码进入
		if (data.scene) {
			var sceneParams = decodeURIComponent(data.scene);
			sceneParams = sceneParams.split('&');
			if (sceneParams.length) {
				sceneParams.forEach(item => {
					if (item.indexOf('id') != -1) this.id = item.split('-')[1];
					if (item.indexOf('suid') != -1) uni.setStorageSync('suid', item.split('-')[1]);
				});
			}
		}
	},
	async onShow() {

		// 刷新多语言
		this.$langConfig.refresh();

		//登录后查询
		this.token = uni.getStorageSync('token');
		
		this.getKekuConfig();
		
		//同步获取商品详情
		await this.getGoodsSkuDetail();
		
		//修改商品信息
		this.modifyGoodsInfo();
		
		// 评价设置
		this.getEvaluateConfig();

		if (this.token != '') {
			this.getCartCount();
			this.getMemberId();
		}
		//商品评论
		this.getGoodsEvaluate();
		// 开启预览，禁止任何操作和跳转
		if (this.preview == 0) {
			//修改商品信息
			this.modifyGoodsInfo();
		
			this.getCoupon();
		
			this.getManjian();
		
			// 评价设置
			this.getEvaluateConfig();
		
			//组合套餐
			this.getBundling();
		
		}
	},
	onHide() {},
	methods: {
		//联系客服
		goConnect() {
			if (uni.getStorageSync('token')) {
				let typeId = this.goodsSkuDetail.goods_promotion[0]
				let data = {
					site_id: this.shopInfo.site_id,
					sku_id: this.goodsSkuDetail.sku_id
				}
				if (typeId) {
					// 砍价
					if (typeId.bargain_id) {
						data.type = 'bargain'
						data.type_id = typeId.bargain_id
					}
					// 限时折扣
					if (typeId.discount_id) {
						data.type = 'discount'
						data.type_id = typeId.discount_id
					}
				}
		
				this.$util.redirectTo('/otherpages/chat/room/room', data)
				return false;
			} else {
				this.$refs.login.open('/pages/goods/detail/detail?sku_id=' + this.goodsSkuDetail.sku_id);
				return;
			}
		},
		//判断是否有分销插件
		async getAddonisexit() {
			let res = await this.$api.sendRequest({
				url: '/api/addon/addonisexit',
				async: false,
				success: res => {}
			});
			if (res.code == 0 && res.data) {
				this.showKefu = res.data.servicer
				this.showFenxiao = res.data.fenxiao;
			}
		},
		// 获取商品详情
		async getGoodsSkuDetail() {
			let res = await this.$api.sendRequest({
				url: '/presale/api/goods/detail',
				async: false,
				data: {
					id: this.id,
					sku_id: this.skuId,
				}
			});
			let data = res.data;
			this.presale_num = data.presale_num;
			if (data.goods_sku_detail != null) {
				this.presale_order_count = data.presale_order_count
				this.goodsSkuDetail = data.goods_sku_detail;
				this.goodsSkuDetail.purchased_num = this.goodsSkuDetail.purchased_num ? this.goodsSkuDetail.purchased_num : 0;
				this.shopInfo = data.shop_info;
				// this.goodsSkuDetail.preview = this.preview;
				this.skuId = this.goodsSkuDetail.sku_id;
				this.goodsSkuDetail.group_id = this.groupId;
				this.siteId =this.goodsSkuDetail.site_id
				//预售结束倒计时
				if ((this.goodsSkuDetail.end_time - res.timestamp) > 0) {
					this.goodsSkuDetail.timeMachine = this.$util.countDown(this.goodsSkuDetail.end_time - res.timestamp);
				} else {
					this.$util.showToast({
						title: "活动已结束",
					});
					setTimeout(() => {
						this.$util.redirectTo('/pages/goods/detail/detail', {
							sku_id: this.goodsSkuDetail.sku_id
						}, 'redirectTo');
					}, 1000);
				}
				// 商家服务信息
				this.goodsSkuDetail.goods_service = [];
				if (this.shopInfo.shop_baozh == 1) {
					this.goodsSkuDetail.goods_service.push({
						service_name: '保证服务',
						desc: '保证服务'
					});
				}
				
				if (this.shopInfo.shop_qtian == 1) {
					this.goodsSkuDetail.goods_service.push({
						service_name: '7天退换',
						desc: '满足7天无理由退换货申请的前提下，包邮商品需要买家承担退货邮费，非包邮商品需要买家承担发货和退货邮费'
					});
				}
				
				if (this.shopInfo.shop_zhping == 1) {
					this.goodsSkuDetail.goods_service.push({
						service_name: '正品保障',
						desc: '商品支持正品保障服务'
					});
				}
				
				if (this.shopInfo.shop_erxiaoshi == 1) {
					this.goodsSkuDetail.goods_service.push({
						service_name: '两小时发货',
						desc: '付款后2小时内发货'
					});
				}
				
				if (this.shopInfo.shop_tuihuo == 1) {
					this.goodsSkuDetail.goods_service.push({
						service_name: '退货承诺',
						desc: '退货承诺'
					});
				}
				
				if (this.shopInfo.shop_shiyong == 1) {
					this.goodsSkuDetail.goods_service.push({
						service_name: '试用中心',
						desc: '试用中心'
					});
				}
				
				if (this.shopInfo.shop_shiti == 1) {
					this.goodsSkuDetail.goods_service.push({
						service_name: '实体验证',
						desc: '实体验证'
					});
				}
				
				if (this.shopInfo.shop_xiaoxie == 1) {
					this.goodsSkuDetail.goods_service.push({
						service_name: '消协保证',
						desc: '如有商品质量问题、描述不符或未收到货等，您有权申请退款或退货，来回邮费由卖家承担'
					});
				}
				//媒体
				if (this.goodsSkuDetail.video_url) this.switchMedia = "video";

				if (this.goodsSkuDetail.sku_images) this.goodsSkuDetail.sku_images = this.goodsSkuDetail.sku_images.split(",");
				else this.goodsSkuDetail.sku_images = [];
				
				// 多规格时合并主图
				if (this.goodsSkuDetail.goods_spec_format && this.goodsSkuDetail.goods_image) {
					this.goodsSkuDetail.goods_image = this.goodsSkuDetail.goods_image.split(",");
					this.goodsSkuDetail.sku_images = this.goodsSkuDetail.sku_images.concat(this.goodsSkuDetail.goods_image);
				}

				this.goodsSkuDetail.unit = this.goodsSkuDetail.unit || "件";

				this.goodsSkuDetail.show_price = this.goodsSkuDetail.goods_price;

				// 当前商品SKU规格
				if (this.goodsSkuDetail.sku_spec_format) this.goodsSkuDetail.sku_spec_format = JSON.parse(this.goodsSkuDetail.sku_spec_format);
				// 商品属性
				if (this.goodsSkuDetail.goods_attr_format) {
					let goods_attr_format = JSON.parse(this.goodsSkuDetail.goods_attr_format);
					this.goodsSkuDetail.goods_attr_format = JSON.parse(this.goodsSkuDetail.goods_attr_format);
					this.goodsSkuDetail.goods_attr_format = this.$util.unique(this.goodsSkuDetail.goods_attr_format, "attr_id");
					for (var i = 0; i < this.goodsSkuDetail.goods_attr_format.length; i++) {
						for (var j = 0; j < goods_attr_format.length; j++) {
							if (this.goodsSkuDetail.goods_attr_format[i].attr_id == goods_attr_format[j].attr_id && this.goodsSkuDetail.goods_attr_format[
									i].attr_value_id != goods_attr_format[j].attr_value_id) {
								this.goodsSkuDetail.goods_attr_format[i].attr_value_name += "、" + goods_attr_format[j].attr_value_name;
							}
						}
					}
				}

				// 商品SKU格式
				if (this.goodsSkuDetail.goods_spec_format) this.goodsSkuDetail.goods_spec_format = JSON.parse(this.goodsSkuDetail.goods_spec_format);

				// uni.setNavigationBarTitle({
				// 	title: this.goodsSkuDetail.goods_name
				// });
				this.$langConfig.title(this.goodsSkuDetail.goods_name);

				// 商品详情
				if (this.goodsSkuDetail.goods_content) this.goodsSkuDetail.goods_content = htmlParser(this.goodsSkuDetail.goods_content);
				this.contactData = {
					title: this.goodsSkuDetail.sku_name,
					path: '/promotionpages/pintuan/detail/detail?id=' + this.id,
					img: this.$util.img(this.goodsSkuDetail.sku_image, {
						size: 'big'
					})
				}
				
				if (this.token != '') {
					this.getWhetherCollection();
				}
				
				this.setWechatShare();
				
				// if (this.$refs.goodsPromotion) this.$refs.goodsPromotion.refresh(this.goodsSkuDetail.goods_promotion);

				if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
				
				// #ifdef MP-WEIXIN
				this.goodsSyncToGoodsCircle();
				// #endif
			} else {
				this.$util.redirectTo('/pages/index/index/index', {}, 'reLaunch');
			}
		},
		/**
		 * 刷新商品详情数据
		 * @param {Object} goodsSkuDetail
		 */
		refreshGoodsSkuDetail(goodsSkuDetail) {
			Object.assign(this.goodsSkuDetail, goodsSkuDetail);
			// if (this.$refs.goodsPromotion) this.$refs.goodsPromotion.refresh(this.goodsSkuDetail.goods_promotion);

			// 解决轮播图数量不一致时，切换到第一个
			if (this.swiperCurrent > this.goodsSkuDetail.sku_images.length) {
				this.swiperAutoplay = true;
				this.swiperCurrent = 1;
				setTimeout(() => {
					this.swiperAutoplay = false;
				}, 40);
			}
		},
		goHome() {
			// this.$util.redirectTo('/pages/index/index/index', {}, 'reLaunch');
			this.$util.redirectTo('/otherpages/shop/index/index', {
				site_id: this.shopInfo.site_id
			});
		},
		goCart() {
			this.$util.redirectTo('/pages/goods/cart/cart', {}, 'reLaunch');
		},
		// 预售下单
		presale() {
			if (!uni.getStorageSync('token')) {
				this.$refs.login.open('/promotionpages/presale/detail/detail?id=' + this.id);
				return;
			}
			this.$refs.goodsSku.show("presale", () => {
				this.getCartCount();
			});
		},
		// 去订单列表付尾款
		toOrderDetail() {
			this.$util.redirectTo('/promotionpages/presale/order_list/order_list');
		},
		swiperChange(e) {
			this.swiperCurrent = e.detail.current + 1;
		},

		//-------------------------------------优惠券-------------------------------------
		
		getCoupon() {
			this.$api.sendRequest({
				url: "/coupon/api/coupon/typelists",
				data: {
					site_id: this.shopInfo.site_id,
					goods_id: this.goodsSkuDetail.goods_id
				},
				success: res => {
					let data = res.data;
					if (data) {
						this.couponList = data;
					}
				}
			});
		},
		
		// 打开优惠券弹出层
		openCouponPopup() {
			this.$refs.couponPopup.open();
		},
		// 关闭优惠券弹出层
		closeCouponPopup() {
			this.$refs.couponPopup.close();
		},
		// 领取优惠券
		receiveCoupon(item, index) {
			if (this.preview) return; // 开启预览，禁止任何操作和跳转
			if (this.couponBtnSwitch) return;
			this.couponBtnSwitch = true;
			if (uni.getStorageSync('token')) {
				this.$api.sendRequest({
					url: '/coupon/api/coupon/receive',
					data: {
						site_id: item.site_id,
						coupon_type_id: item.coupon_type_id,
						get_type: 2
					},
					success: res => {
						var data = res.data;
						let msg = res.message;
						if (res.code == 0) {
							msg = '领取成功';
						}
						this.$util.showToast({
							title: msg,
						});
						this.couponBtnSwitch = false;
						// this.$refs.couponPopup.close();
						if (res.data.is_exist) {
							this.refreshCoupon(index);
						}
					},
				});
			} else {
				this.$refs.login.open('/pages/goods/detail/detail?sku_id=' + this.skuId);
				this.couponBtnSwitch = false;
			}
		},
		//更新优惠券信息
		refreshCoupon(index) {
			this.couponList[index].is_lingqu = 1;
			this.$forceUpdate()
		},
		//-------------------------------------服务-------------------------------------

		openMerchantsServicePopup() {
			this.$refs.merchantsServicePopup.open();
		},
		closeMerchantsServicePopup() {
			this.$refs.merchantsServicePopup.close();
		},



		//-------------------------------------属性-------------------------------------

		openAttributePopup() {
			this.$refs.attributePopup.open();
		},
		closeAttributePopup() {
			this.$refs.attributePopup.close();
		},

		//-------------------------------------属性-------------------------------------



		//-------------------------------------评价-------------------------------------
		//商品评论列表
		getGoodsEvaluate() {
			this.$api.sendRequest({
				url: "/api/goodsevaluate/firstinfo",
				data: {
					goods_id: this.goodsSkuDetail.goods_id
				},
				success: res => {
					let data = res.data;
					if (data) {
						this.goodsEvaluate = data;
						if (this.goodsEvaluate.images) this.goodsEvaluate.images = this.goodsEvaluate.images.split(",");
						if (this.goodsEvaluate.is_anonymous == 1) this.goodsEvaluate.member_name = this.goodsEvaluate.member_name.replace(
							this.goodsEvaluate.member_name.substring(1, this.goodsEvaluate.member_name.length - 1), '***')
					}
				}
			});
		},

		// 预览评价图片
		previewEvaluate(index, field) {
			var paths = [];
			for (let i = 0; i < this.goodsEvaluate[field].length; i++) {
				paths.push(this.$util.img(this.goodsEvaluate[field][i]));
			}
			uni.previewImage({
				current: index,
				urls: paths,
			});
		},


		//-------------------------------------关注-------------------------------------

		//获取用户是否关注
		getWhetherCollection() {
			this.$api.sendRequest({
				url: "/api/goodscollect/iscollect",
				data: {
					goods_id: this.goodsSkuDetail.goods_id
				},
				success: res => {
					this.whetherCollection = res.data;
				}
			});
		},

		editCollection() {
			if (this.token != "") {

				//未关注添加关注
				if (this.whetherCollection == 0) {
					this.$api.sendRequest({
						url: "/api/goodscollect/add",
						data: {
							sku_id: this.skuId,
							goods_id: this.goodsSkuDetail.goods_id,
							sku_name: this.goodsSkuDetail.sku_name,
							sku_price: this.goodsSkuDetail.show_price,
							sku_image: this.goodsSkuDetail.sku_image
						},
						success: res => {
							var data = res.data;
							if (data > 0) {
								this.whetherCollection = 1;
							}
						}
					});
				} else {
					//已关注取消关注
					this.$api.sendRequest({
						url: "/api/goodscollect/delete",
						data: {
							goods_id: this.goodsSkuDetail.goods_id
						},
						success: res => {
							var data = res.data;
							if (data > 0) {
								this.whetherCollection = 0;
							}
						}
					});
				}
			} else {
				this.$refs.login.open('/promotionpages/presale/detail/detail?id=' + this.id);
			}
		},
		//获取购物车数量
		getCartCount() {
			this.$api.sendRequest({
				url: "/api/cart/count",
				data: {},
				success: res => {
					this.cartCount = res.data;
				}
			});
		},

		//返回顶部
		goTopClick() {
			uni.pageScrollTo({
				duration: 200,
				scrollTop: 0
			});
		},
		//更新商品信息
		modifyGoodsInfo() {
			//更新商品点击量
			this.$api.sendRequest({
				url: "/api/goods/modifyclicks",
				data: {
					sku_id: this.skuId
				},
				success: res => {}
			});

			//添加足迹
			this.$api.sendRequest({
				url: "/api/goodsbrowse/add",
				data: {
					goods_id: this.goodsSkuDetail.goods_id,
					sku_id: this.skuId
				},
				success: res => {}
			});
		},

		//-------------------------------------满减-------------------------------------
		
		//获取满减信息
		getManjian() {
			this.$api.sendRequest({
				url: "/manjian/api/manjian/info",
				data: {
					goods_id: this.goodsSkuDetail.goods_id
				},
				success: res => {
					let data = res.data;
					if (data) {
						this.manjian = data;
						let limit = data.type == 0 ? '元' : '件';
						Object.keys(data.rule_json).forEach((key) => {
							var item = data.rule_json[key];
							item.limit = data.type == 0 ? parseFloat(item.money).toFixed(2) : parseInt(item.money);
							// 满减
							if (item.discount_money != undefined) {
								if (this.manjian.manjian == undefined) {
									this.manjian.manjian = '满' + item.limit + limit + '减' + item.discount_money + '元';
								} else {
									this.manjian.manjian += '；满' + item.limit + limit + '减' + item.discount_money + '元';
								}
							}
							// 满送
							if (item.point != undefined || item.coupon != undefined) {
								let text = '';
								if (item.point != undefined) {
									text = '送' + item.point + '积分';
								}
								if (item.coupon != undefined && item.coupon_data != undefined) {
									if (item.coupon_data.type == 'discount') {
										if (text == '') text = '送一张' + item.coupon_data.discount + '折优惠券';
										else text += '、送一张' + item.coupon_data.discount + '折优惠券';
									} else {
										if (text == '') text = '送一张' + item.coupon_data.money + '元优惠券';
										else text += '、送一张' + item.coupon_data.money + '元优惠券';
									}
								}
								if (this.manjian.mansong == undefined) {
									this.manjian.mansong = '满' + item.limit + limit + text;
								} else {
									this.manjian.mansong += '；' + '满' + item.limit + limit + text;
								}
							}
							// 包邮
							if (item.free_shipping != undefined) {
								if (this.manjian.free_shipping == undefined) {
									this.manjian.free_shipping = '满' + item.limit + limit + '包邮';
								} else {
									this.manjian.free_shipping += '；满' + item.limit + limit + '包邮';
								}
							}
							// 赠品
							if (item.present != undefined) {
								if (this.manjian.present == undefined) {
									this.manjian.present = '';
								} else {
									this.manjian.present += '有赠品';
								}
							}
						})
					}
				}
			});
		},
		openManjianPopup() {
			this.$refs.manjianPopup.open();
		},
		closeManjianPopup() {
			this.$refs.manjianPopup.close();
		},
		
		
		//-------------------------------------组合套餐-------------------------------------
		
		//获取当前商品关联的组合套餐
		getBundling() {
			this.$api.sendRequest({
				url: "/bundling/api/bundling/lists",
				data: {
					sku_id: this.skuId
				},
				success: res => {
					if (res.data && res.data.length) {
						this.bundling = res.data;
						for (var i = 0; i < this.bundling.length; i++) {
							for (var j = 0; j < this.bundling[i].bundling_goods.length; j++) {
								if (this.bundling[i].bundling_goods[j].sku_id == this.skuId) {
									this.bundling[i].bundling_goods.splice(j, 1);
								}
							}
						}
					}
				}
			});
		},
		// 打开组合套餐弹出层
		openBundlingPopup() {
			this.$refs.bundlingPopup.open();
		},
		// 关闭组合套餐弹出层
		closeBundlingPopup() {
			this.$refs.bundlingPopup.close();
		},
		
		//-------------------------------------分享-------------------------------------
		// 打开分享弹出层
		openSharePopup() {
			this.$refs.sharePopup.open();
		},
		// 关闭分享弹出层
		closeSharePopup() {
			this.$refs.sharePopup.close();
		},
		//-------------------------------------海报-------------------------------------

		// 打开海报弹出层
		openPosterPopup() {
			this.getGoodsPoster();
			this.$refs.sharePopup.close();
			this.$refs.posterPopup.open();
			if (this.poster != '-1') {
				setTimeout(() => {
					let view = uni.createSelectorQuery().in(this).select(".poster-layer .image-wrap");
					view.fields({
						size: true,
					}, data => {
						let posterWhith = data.width;
						let ratio = parseFloat((740 / posterWhith).toFixed(2));
						if (this.token != '') {
							this.posterHeight = parseInt(1100 / ratio);
						} else {
							this.posterHeight = parseInt(1100 / ratio);
						}
					}).exec();
				}, 100);
			}
		},
		// 关闭海报弹出层
		closePosterPopup() {
			this.$refs.posterPopup.close();
		},
		//生成海报
		getGoodsPoster() {
			//活动海报信息
			let qrcode_param = {
				id: this.id
			};
			if (this.memberId) qrcode_param.suid = this.memberId;
			this.$api.sendRequest({
				url: "/presale/api/goods/poster",
				data: {
					page: '/promotionpages/presale/detail/detail',
					qrcode_param: JSON.stringify(qrcode_param)
				},
				success: res => {
					if (res.code == 0) {
						this.poster = res.data.path;
					} else {
						this.posterMsg = res.message;
					}
				}
			});
		},
		// 预览图片
		previewMedia(index) {
			var paths = [];
			for (let i = 0; i < this.goodsSkuDetail.sku_images.length; i++) {
				paths.push(this.$util.img(this.goodsSkuDetail.sku_images[i], {
					size: 'big'
				}));
			}
			uni.previewImage({
				current: index,
				urls: paths,
			});
		},
		swiperImageError(index) {
			this.goodsSkuDetail.sku_images[index] = this.$util.getDefaultImage().default_goods_img;
			this.$forceUpdate();
		},
		// #ifdef MP
		//小程序中保存海报
		saveGoodsPoster() {

			let url = this.$util.img(this.poster);
			uni.downloadFile({
				url: url,
				success: (res) => {
					if (res.statusCode === 200) {
						uni.saveImageToPhotosAlbum({
							filePath: res.tempFilePath,
							success: () => {
								this.$util.showToast({
									title: "保存成功"
								});
							},
							fail: () => {
								this.$util.showToast({
									title: "保存失败，请稍后重试"
								});
							}
						});
					}
				},

				fail: (e) => {
					// this.$util.showToast({
					// 	title: "fail:" + JSON.stringify(e)
					// });
				}
			});
		},
		// #endif
		getMemberId() {
			this.$api.sendRequest({
				url: "/api/member/id",
				success: res => {
					if (res.code >= 0) {
						this.memberId = res.data;
						this.setWechatShare();
					}
				}
			});
		},
		getKekuConfig() {
			this.$api.sendRequest({
				url: '/api/config/servicer',
				success: res => {
					if (res.code == 0) {
						this.kefuConfig = res.data;
						if (this.kefuConfig.system && !this.addonIsExit.servicer) this.kefuConfig.system = 0;
					}
				}
			});
		},
		copyUrl() {
			let text = this.$config.h5Domain + '/promotionpages/presale/detail/detail?id=' + this.id;
			if (this.memberId) text += '&suid=' + this.memberId;
			this.$util.copy(text, () => {
				this.closeSharePopup();
			});
		},
		/**
		 * 设置微信公众号分享
		 */
		setWechatShare(){
			// 微信公众号分享
			// #ifdef H5
			if (this.$util.isWeiXin()) {
				this.$api.sendRequest({
					url: '/wechat/api/wechat/share',
					data : {
						url: window.location.href
					},
					success: res => {
						if (res.code == 0) {
							var wxJS = new Weixin();
							wxJS.init(res.data.jssdk_config);
							
							let shareConfig = res.data.share_config,
								url = this.$config.h5Domain + '/promotionpages/presale/detail/detail?id=' + this.id;
								if (this.memberId) url += '&suid=' + this.memberId;
						
							wxJS.setShareData({
								title: this.goodsSkuDetail.sku_name,
								desc: this.$lang('common.currencySymbol') + this.goodsSkuDetail.show_price + '\r\n' + shareConfig.goods_param_2 + '\r\n' + '收藏热度：★★★★★',
								link: url,
								imgUrl: this.$util.img(this.goodsSkuDetail.sku_image, { size: 'big' })
							})
						}
					}
				})
			}
			// #endif
		},
		getEvaluateConfig() {
			this.$api.sendRequest({
				url: '/api/goodsevaluate/config',
				success: res => {
					if (res.code == 0) {
						var data = res.data;
						this.evaluateConfig = data;
						if (this.evaluateConfig.evaluate_show == 1) {
							//商品评论
							this.getGoodsEvaluate();
						}
					}
				}
			});
		},
		// #ifdef MP-WEIXIN
		/**
		 *	将商品同步到微信圈子 
		 */
		goodsSyncToGoodsCircle(){
			this.$api.sendRequest({
				url: '/goodscircle/api/goods/sync',
				data: {
					goods_id: this.goodsSkuDetail.goods_id
				},
				success: res => {
					if (res.code == 0) {
						this.goodsCircle = true;
					}
				}
			})
		},
		/**
		 * 将商品推荐到微信圈子
		 */
		openBusinessView(){
			if (wx.openBusinessView) {
				wx.openBusinessView({
					businessType: 'friendGoodsRecommend',
					extraData: {
						product: {
							item_code: this.goodsSkuDetail.goods_id,
							title: this.goodsSkuDetail.sku_name,
							image_list: this.goodsSkuDetail.sku_images.map((ele) => {
								return this.$util.img(ele);
							})
						}
					},
					success: function (res) {
						console.log('success', res);
					},
					fail: function (res){
						console.log('fail', res);
					}
				})
			}
		}
		// #endif

	}
}
