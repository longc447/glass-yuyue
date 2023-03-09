<template>
	<view :data-theme="themeStyle" class="yuyue">
		<view v-if="token != ''">
			<view class="recharge-box">
				<view>
					<view style="display: flex;justify-content: space-between;padding: 0 30rpx;">
						<view style="text-align: center;line-height:0;color: #797979;">
							<view>
								<image src="https://yuyue.shengshengsc.cn/public/static/wxapp/1.png" style="width: 80rpx;height: 80rpx;"></image>
							</view>
							<view style="color: #797979;">
								预约
							</view>
						</view>
						<view style="text-align: center;line-height:0;color: #797979;padding-top: 20rpx;">
							<view>
								<image src="https://yuyue.shengshengsc.cn/public/static/wxapp/buzhou.png" style="width: 50rpx;height: 30rpx;"></image>
							</view>
							<view style="color: #797979;">

							</view>
						</view>
						<view style="text-align: center;line-height:0;color: #797979;">
							<view>
								<image src="https://yuyue.shengshengsc.cn/public/static/wxapp/2.png" style="width: 80rpx;height: 80rpx;"></image>
							</view>
							<view style="color: #797979;">
								上门
							</view>
						</view>
						<view style="text-align: center;line-height:0;color: #797979;padding-top: 20rpx;">
							<view>
								<image src="https://yuyue.shengshengsc.cn/public/static/wxapp/buzhou.png" style="width: 50rpx;height: 30rpx;"></image>
							</view>
							<view style="color: #797979;">

							</view>
						</view>
						<view style="text-align: center;line-height:0;">
							<view>
								<image src="https://yuyue.shengshengsc.cn/public/static/wxapp/3.png" style="width: 80rpx;height: 80rpx;"></image>
							</view>
							<view style="color: #797979;">
								报告
							</view>
						</view>
						<view style="text-align: center;line-height:0;color: #797979;padding-top: 20rpx;">
							<view>
								<image src="https://yuyue.shengshengsc.cn/public/static/wxapp/buzhou.png" style="width: 50rpx;height: 30rpx;"></image>
							</view>
							<view style="color: #797979;">

							</view>
						</view>
						<view style="text-align: center;line-height:0;color: #797979;">
							<view>
								<image src="https://yuyue.shengshengsc.cn/public/static/wxapp/4.png" style="width: 80rpx;height: 80rpx;"></image>
							</view>
							<view style="color: #797979;">
								配镜
							</view>
						</view>
					</view>
				</view>
				<view style="width:350rpx;height:70rpx;color: #FFFFFF;background: linear-gradient(90deg, #7BB7FF 0%, #3383EE 100%);
		opacity: 1;
		border-radius: 22px;text-align: center;margin: 70rpx auto 0;line-height: 70rpx;" @click="toAdd()">立即预约</view>
			</view>
			<!--预约数据-->
			<view style="">
				<view v-for="(item,index) in yuyueInfo" >

					<view class="explain">
						<view
							style="background-color: #f9ae3d;color: #FFFFFF;padding:  0rpx 10rpx;border-radius: 10rpx;margin: 10rpx 0;"
							v-if="item.status==2"> 验光师傅正在赶来</view>
						<view class="title" style="display: flex;justify-content: space-between;">
							<view>{{item.order_no}}</view>
							<view
								style="background-color: #3c9cff;color: #FFFFFF;padding:  0 10rpx;border-radius: 10rpx;"
								v-if="item.status==1"> 预约中</view>
							<view
								style="background-color: #5ac725;color: #FFFFFF;padding:  0 10rpx;border-radius: 10rpx;"
								v-if="item.status==4"> 完成</view>
							<view
								style="background-color: #f9ae3d;color: #FFFFFF;padding:  0 10rpx;border-radius: 10rpx;"
								v-if="item.status==2"> 已分配</view>
							<view
								style="background-color: #797979;color: #FFFFFF;padding:  0 10rpx;border-radius: 10rpx;"
								v-if="item.status==3"> 取消</view>
								
						</view>
						<view class="explain_list">
							<view>
								客户名称：
								<text>{{item.member_name}}</text>
							</view>
						</view>
						<view class="explain_list">
							<view>
								客户地址：
								<text>{{item.full_address}}</text>
							</view>
						</view>
						<view class="explain_list">
							<view>
								服务时间：
								<text>{{item.time| formatDate('-')}}</text>
							</view>
						</view>
						<view class="explain_list" v-if="item.status==2">
							<view>
								服务人员：
								<text>{{item.name}}</text>
							</view>
						</view>
						<view class="explain_list" v-if="item.status==2">
							<view>
								服务手机号：
								<text>{{item.phone}}</text>
							</view>
						</view>
						<view
							style="background-color: #18b566 ;color: #FFFFFF;padding:  0 10rpx;border-radius: 10rpx;"
							v-if="item.is_pj==0&&item.status==4"
							@tap="toPingjia(item)"> 评价</view>
							<view
								style="background-color: #797979;color: #FFFFFF;padding:  0 10rpx;border-radius: 10rpx;"
								v-if="item.is_pj==1&&item.status==4"
								> 已评价</view>
					</view>
				</view>
				<view v-show="0">
					<ns-empty text="暂无预约" :isIndex="false" :emptyBtn='emptyBtn'></ns-empty>
				</view>

			</view>
		</view>
		
		<view class="cart-empty" v-else>
			<image :src="$util.img('upload/uniapp/common-empty.png')" mode="aspectFit"></image>
			<view class="color-tip margin-top margin-bottom"></view>

			<button type="primary" size="mini" class="button" @click="toLogin">去登录</button>
		</view>
		<view style="height: 100rpx;"></view>
		<!-- 底部tabBar -->
		<ns-login ref="login"></ns-login>
		<diy-bottom-nav type="shop"></diy-bottom-nav>
		<loading-cover ref="loadingCover"></loading-cover>
	</view>
</template>

<script>
	import globalConfig from '@/common/js/golbalConfig.js';
	import nsPayment from '@/components/payment/payment.vue';
	import diyBottomNav from '@/components/diy-bottom-nav/diy-bottom-nav.vue';

	export default {
		data() {
			return {
				list: [],
				balanceInfo: {
					balance: 0,
					balance_money: 0
				},
				isIndex: -1,
				recharge_id: '',
				amount: '',
				payMoney: 0,
				keywordsInfo: {
					price: 0,
					minPrice: 1,
					maxPrice: 30
				},
				emptyBtn: {
					text: '去预约',
					url: '/otherpages/yuyue/yuyue'
				},
				token: '',
				yuyueInfo: ''
			};
		},
		components: {
			nsPayment,
			diyBottomNav
		},
		filters: {
			// 时间戳处理
			formatDate: function(value, spe = '/') {
				value = value * 1000
				let data = new Date(value);
				let year = data.getFullYear();
				let month = data.getMonth() + 1;
				let day = data.getDate();
				let h = data.getHours();
				let mm = data.getMinutes();
				let s = data.getSeconds();
				month = month > 10 ? month : "0" + month;
				day = day > 10 ? day : "0" + day;
				h = h > 10 ? h : "0" + h;
				mm = mm > 10 ? mm : "0" + mm;
				s = s > 10 ? s : "0" + s;
				return `${year}${spe}${month}${spe}${day} ${h}:${mm}:${s}`;
			}
		},
		onShow() {
			// 刷新多语言
			this.$langConfig.refresh();
			this.getUserInfo();
			this.getData();
		},
		mixins: [globalConfig],

		methods: {
			toPingjia(e){
				console.log(e)
				uni.navigateTo({
					url:"../pingjia/pingjia?order="+e.id
				})
			},
			toAdd() {
				this.$util.redirectTo('/otherpages/yuyue/address');
			},
			toLogin() {
				this.$refs.login.open();
			},
			openRecharge() {
				this.isIndex = -1;
				this.payMoney = 0;
				this.keywordsInfo.price = 0;
				this.recharge_id = '';
				this.$refs.rechargePopup.open()
			},
			toOrderList() {
				this.$util.redirectTo('/otherpages/recharge/order_list/order_list');
			},
			itemClick(index, id, buy_price) {
				if (this.amount) this.amount = '';
				this.isIndex = index;
				this.recharge_id = id;
				this.payMoney = parseFloat(buy_price);
				this.openChoosePayment();
			},
			keywordsDown(val) {
				var that = this
				var temp = this.keywordsInfo.price == 0 ? val : this.keywordsInfo.price + '' + val,
					tempamount = temp
				this.keywordsInfo.price = temp;
				this.payMoney = tempamount;
			},
			delPrice() {
				var temp = this.keywordsInfo.price.toString(),
					that = this
				if (temp.length) {
					this.keywordsInfo.price = temp.slice(0, temp.length - 1)
					var tempamount = temp
					if (this.keywordsInfo.price.length > 0) {
						this.payMoney = this.keywordsInfo.price;
					} else {
						this.payMoney = '';
					}
				}
			},
			keywordsPayment() {
				if (this.keywordsInfo.price > 0) {
					this.amount = this.payMoney;
					this.$refs.rechargePopup.close()
					this.openChoosePayment()
				} else {
					this.$util.showToast({
						title: "请输入充值金额"
					})
				}

			},
			//输入框聚焦
			cumberFocus() {
				this.isIndex = -1;
			},
			getUserInfo() {
				this.$api.sendRequest({
					url: '/api/memberaccount/info',
					data: {
						account_type: 'balance,balance_money'
					},
					success: res => {
						if (res.data) {
							this.balanceInfo = res.data;
							this.token = uni.getStorageSync('token');
						} else {
							this.token = '';
						}
					}
				});
			},
			getData() {
				this.$api.sendRequest({
					url: '/api/yuyue/lists',
					data: {
						page_size: 100,
						page: 1
					},
					success: res => {
						console.log(res)
						this.yuyueInfo = res.data
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
						// let newArr = [];
						// let msg = res.message;
						// if (res.code == 0 && res.data) {
						// 	newArr = res.data.list;
						// } else {
						// 	this.$util.showToast({
						// 		title: msg
						// 	});
						// }
						// //设置列表数据
						// this.list = newArr; //追加新数据

					},
					fail: () => {
						//联网失败的回调
					}
				});
			},
			toPay() {
				if (this.recharge_id !== '') {
					this.$api.sendRequest({
						url: '/memberrecharge/api/ordercreate/create',
						data: {
							recharge_id: this.recharge_id
						},
						success: res => {
							if (res.data && res.code == 0) {
								this.$refs.choosePaymentPopup.getPayInfo(res.data);
							} else {
								this.$util.showToast({
									title: res.message
								});
							}
						}
					});
				} else if (this.amount !== '') {
					this.$api.sendRequest({
						url: '/memberrecharge/api/ordercreate/create',
						data: {
							recharge_id: 0,
							face_value: this.amount
						},
						success: res => {
							if (res.data && res.code == 0) {
								this.$refs.choosePaymentPopup.getPayInfo(res.data);
							} else {
								this.$util.showToast({
									title: res.message
								});
							}
						}
					});
				} else {
					this.$util.showToast({
						title: '请选择套餐'
					});
				}
			},
			// 显示选择支付方式弹框
			openChoosePayment() {
				uni.setStorageSync('paySource', 'recharge');
				if (this.amount !== '') this.payMoney = parseFloat(this.amount);
				this.$refs.choosePaymentPopup.open();
			}
		}
	};
</script>

<style lang="scss">
	/deep/ .mescroll-uni-fixed {
		bottom: 280rpx !important;
	}

	page {
		background: url(https://yuyue.shengshengsc.cn/public/static/wxapp/bg.png ) no-repeat fixed top;
		background-size: 100%;
		background-color: #f8f8f8
	}

	.explain {
		margin: $margin-updown $margin-both;
		padding: $padding 30rpx;
		background-color: #fff;
		border-radius: $border-radius;
		box-shadow: 1px 3px 30rpx -20rpx rgba(0, 0, 0, 0.5);

		.title {
			font-size: $color-sub;
		}

		.explain_list {

			view {
				font-size: $font-size-sub;
				color: $color-tip;
			}
		}
	}

	.rechargeList {
		.tip {
			padding: $margin-both;
			text-align: center;
			font-size: $font-size-toolbar;
		}

		.input {
			text-align: center;

			text {
				margin-left: 10rpx;
			}

			margin-bottom: $margin-updown;
		}

		// 键盘
		.keywords {
			display: flex;
			border-top: 1px solid $color-line;
			margin-top: $margin-updown;

			.keywords-left {
				flex: 1;
				display: flex;
				flex-wrap: wrap;

				>view {
					width: calc((100% - 3px) / 3);
					text-align: center;
					height: 112rpx;
					line-height: 112rpx;
					border-right: 1px solid $color-line;
					border-bottom: 1px solid $color-line;
					font-size: 40rpx;

					&.active:active {
						background-color: rgba($color: #000000, $alpha: 0.5);
					}
				}
			}

			.keywords-right {
				display: flex;
				flex-wrap: wrap;
				flex-direction: column;
				width: 200rpx;

				text-align: center;

				>view {
					flex: 1;
					line-height: 200rpx;

					&:last-child {
						color: #fff
					}
				}
			}
		}
	}

	.recharge-price {
		width: calc(100% - 60rpx);
		background-color: #ffffff;
		margin: 20rpx 30rpx 0;
		border-radius: 10rpx;
		padding: 30rpx 30rpx 25rpx;
		box-sizing: border-box;

		.recharge-price-title {
			font-size: $font-size-base;
			color: $color-title;
			line-height: 1;
		}

		.recharge-price-custom {
			border-bottom: 1px solid #dddddd;
			padding-bottom: 20rpx;
			display: flex;
			align-items: center;
			margin-top: 45rpx;

			text {
				font-size: 54rpx;
				color: $color-title;
				line-height: 1;
			}

			input {
				font-size: 54rpx;
				line-height: 1;
			}
		}

		.recharge-price-desc {
			display: flex;
			margin-top: 16rpx;
			align-items: center;

			image {
				width: 34rpx;
				height: 34rpx;
				margin-right: 13rpx;
			}

			text {
				font-size: $font-size-sub;
				color: $color-tip;
				line-height: 1;
			}
		}
	}

	.recharge-box {
		margin: $margin-updown $margin-both 0;
		padding: 36rpx 30rpx;
		background: #fff;
		height: 100%;
		box-sizing: border-box;
		border-radius: 10rpx;

		.recharge-box-title {
			font-size: $font-size-base;
			color: $color-title;
			line-height: 1;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.box-title {
			text-align: center;
			font-size: $font-size-toolbar;
		}

		.box-custom {
			width: 226rpx;
			border-bottom: 1px solid #dddddd;
			margin: 0 auto;
			margin-top: 49rpx;
			line-height: 1;
			padding-bottom: 10rpx;
			box-sizing: border-box;

			.pla-number {
				font-size: 30rpx;
			}

			input {
				height: 97rpx;
				width: 100%;
				font-size: 62rpx;
				color: #000;
				text-align: center;
				line-height: 1;
			}
		}

		.box-content {
			width: 100%;
			box-sizing: border-box;
			display: flex;
			flex-wrap: wrap;
			max-height: 50vh;
			overflow-y: scroll;

			.content-item {
				width: calc((100% - 48rpx) / 3);
				margin-right: 24rpx;
				height: 142rpx;
				margin-top: 25rpx;
				border-radius: 5rpx;
				border: 2rpx solid #eeeeee;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				color: $color-title;
				box-sizing: border-box;
				text-align: center;

				&:nth-child(3n) {
					margin-right: 0;
				}

				.price1 {
					font-size: $font-size-base;
					display: flex;
					align-items: flex-end;

					text:first-child {
						font-size: 40rpx;
						line-height: 1;
					}

					text:nth-child(2) {
						font-size: $font-size-base;
						line-height: 1;
					}
				}

				.price2 {
					font-size: $font-size-tag;
					color: $color-title;
					line-height: 1;
					margin-top: 16rpx;
				}

				&.color-base-bg {

					.price1,
					.price2 {
						color: #ffffff !important;
					}
				}
			}
		}

		.box-text {
			margin-top: 40rpx;
			font-size: $font-size-sub;
			color: $color-tip;
		}
	}

	.cart-empty {
		text-align: center;
		padding: 250rpx $padding 80rpx $padding;

		image {
			width: 43%;
			height: 450rpx;
		}

		button {
			min-width: 300rpx;
			margin-top: 100rpx;
			height: 70rpx;
			line-height: 70rpx !important;
			font-size: $font-size-base;
		}
	}
</style>
