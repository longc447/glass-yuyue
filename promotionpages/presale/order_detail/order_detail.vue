<template>
	<view class="detail-container" :class="{ 'safe-area': isIphoneX }" :data-theme="themeStyle">
		<!-- 订单状态 -->
		<view class="status-wrap color-base-bg" :style="{ backgroundImage: 'url(' + $util.img('upload/uniapp/order/status-wrap-bg.png') + ')' }">
			<view class="order-status-left">
				<!-- <image :src="$util.img(action.icon)"></image> -->
				<view class="status-name">
					<block v-if="orderData.refund_status == 1">
						<view class="name">退款中</view>
					</block>
					<block v-else>
						<view class="name">{{ orderData.order_status_name }}</view>
						<block v-if="orderData.order_status == 1">
							<view class="desc" v-if="orderData.pay_start_time > timestamp">尾款开始支付时间：{{ $util.timeStampTurnTime(orderData.pay_start_time) }}</view>
							<view class="desc" v-else="orderData.pay_start_time < timestamp && orderData.pay_end_time > timestamp">尾款支付结束时间：{{ $util.timeStampTurnTime(orderData.pay_end_time) }}</view>
						</block>
					</block>
				</view>
			</view>
		</view>

		<!-- 店铺 -->
		<view class="site-wrap">
			<view class="site-body">
				<view class="goods-wrap">
					<view class="goods-img" @click="goDetail">
						<image :src="$util.img(orderData.sku_image, { size: 'mid' })" @error="imageError()" mode="aspectFill"></image>
					</view>
					<view class="goods-info">
						<view @click="goDetail" class="goods-name">{{ orderData.sku_name }}</view>
						<view class="goods-sub-section">
							<view>
								<text class="goods-price color-base-text">
									<text class="unit">{{ $lang('common.currencySymbol') }}</text>
									<text class="font-size-base">{{ orderData.price }}</text>
								</text>
							</view>
							<view>
								<text class="font-size-base">
									<text class="iconfont iconclose"></text>
									{{ orderData.num }}
								</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 订单概况 -->
		<view class="order-summary">
			<view class="order-cell">
				<text class="tit">订单编号：</text>
				<view class="box">
					<text class="color-title">{{ orderData.order_no }}</text>
					<view class="copy" @click="$util.copy(orderData.order_no)">复制</view>
				</view>
			</view>
			<view class="order-cell">
				<text class="tit">创建时间：</text>
				<view class="box">
					<text class="color-title">{{ $util.timeStampTurnTime(orderData.create_time) }}</text>
				</view>
			</view>
			<view class="order-cell" v-if="orderData.close_time > 0">
				<text class="tit">关闭时间：</text>
				<view class="box">
					<text class="color-title">{{ $util.timeStampTurnTime(orderData.close_time) }}</text>
				</view>
			</view>
			<block v-if="orderData.pay_deposit_time > 0">
				<view class="hr"></view>
				<view class="order-cell">
					<text class="tit">定金支付方式：</text>
					<view class="box">
						<text class="color-title">{{ orderData.deposit_pay_type_name }}</text>
					</view>
				</view>
				<view class="order-cell">
					<text class="tit">定金支付时间：</text>
					<view class="box">
						<text class="color-title">{{ $util.timeStampTurnTime(orderData.pay_deposit_time) }}</text>
					</view>
				</view>
			</block>
			<block v-if="orderData.pay_final_time > 0">
				<view class="hr"></view>
				<view class="order-cell">
					<text class="tit">尾款支付方式：</text>
					<view class="box">
						<text class="color-title">{{ orderData.final_pay_type_name }}</text>
					</view>
				</view>
				<view class="order-cell">
					<text class="tit">尾款支付时间：</text>
					<view class="box">
						<text class="color-title">{{ $util.timeStampTurnTime(orderData.pay_final_time) }}</text>
					</view>
				</view>
			</block>
			<view class="order-cell" v-if="orderData.delivery_type_name">
				<text class="tit">配送方式：</text>
				<view class="box">
					<text class="color-title">{{ orderData.delivery_type_name }}</text>
				</view>
			</view>
			<block v-if="orderData.is_invoice > 0">
				<view class="hr"></view>
				<view class="order-cell">
					<text class="tit">发票类型：</text>
					<view class="box">
						<text class="color-title">{{ orderData.invoice_type ==1 ? '纸质发票' : '电子发票'  }}</text>
					</view>
				</view>
				<view class="order-cell">
					<text class="tit">发票抬头类型：</text>
					<view class="box">
						<text class="color-title">{{ orderData.invoice_title_type ==1 ? '个人' : '企业' }}</text>
					</view>
				</view>
				<view class="order-cell">
					<text class="tit">发票抬头：</text>
					<view class="box">
						<text class="color-title">{{ orderData.invoice_title }}</text>
					</view>
				</view>
				
				<view class="order-cell">
					<text class="tit">发票内容：</text>
					<view class="box">
						<text class="color-title">{{ orderData.invoice_content }}</text>
					</view>
				</view>
				<view class="order-cell" v-if="orderData.invoice_type ==1">
					<text class="tit">发票邮寄地址：</text>
					<view class="box">
						<text class="color-title">{{ orderData.invoice_full_address }}</text>
					</view>
				</view>
				<view class="order-cell" v-else>
					<text class="tit">发票接收邮件：</text>
					<view class="box">
						<text class="color-title">{{ orderData.invoice_email }}</text>
					</view>
				</view>
			</block>
			<view class="order-cell" v-if="orderData.buyer_message != ''">
				<text class="tit">买家留言：</text>
				<view class="box">
					<text class="color-title">{{ orderData.buyer_message }}</text>
				</view>
			</view>
			<!-- 联系客服 -->
			<view class="kefu">
				<!-- #ifdef MP -->
				<button type="default" hover-class="none" open-type="contact" v-if="kefuConfig.weapp == 1">
					<text class="iconfont iconziyuan"></text>
					<text>联系客服</text>
				</button>
				<view v-else-if="kefuConfig.system == 1" @click="goConnect">
					<text class="iconfont iconziyuan"></text>
					<text>联系客服</text>
				</view>
				<!-- #endif -->
				<!-- #ifndef MP -->
				<view v-if="kefuConfig.open == 1" @click="goConnect">
					<text class="iconfont iconziyuan"></text>
					<text>联系客服</text>
				</view>
				<view v-else-if="kefuConfig.system == 1" @click="goConnect">
					<text class="iconfont iconziyuan"></text>
					<text>联系客服</text>
				</view>
				<!-- #endif -->
			</view>
		</view>
		
		<view class="order-money presale-process">
			<view class="order-cell">
				<view class="tit" :class="{'color-base-text': orderData.pay_deposit_time == 0 }">
					<text class="font-size-base">阶段一：付定金</text>
					<text class="font-size-base" v-if="orderData.pay_deposit_time > 0">（已付）</text>
				</view>
				<view class="box align-right">
					<text :class="{'color-base-text': orderData.pay_deposit_time == 0 }">
						<text class="font-size-tag">{{ $lang('common.currencySymbol') }}</text>
						<text class="font-size-base">{{ orderData.presale_deposit_money }}</text>
					</text>
				</view>
			</view>
			<view class="order-cell">
				<view class="tit" :class="{'color-base-text': orderData.pay_deposit_time > 0 && orderData.pay_final_time >= 0}">
					<text class="font-size-base">阶段二：付尾款</text>
					<text class="font-size-base" v-if="orderData.pay_final_time > 0">（已付）</text>
				</view>
				<view class="box align-right">
					<text :class="{'color-base-text': orderData.pay_deposit_time > 0 && orderData.pay_final_time >= 0}">
						<text class="font-size-tag">{{ $lang('common.currencySymbol') }}</text>
						<text class="font-size-base">{{ orderData.final_money }}</text>
					</text>
				</view>
			</view>
		</view>

		<!-- 订单金额 -->
		<view class="order-money">
			<view class="order-cell">
				<text class="tit">商品金额</text>
				<view class="box align-right">
					<text class="color-title">
						<text class="font-size-goods-tag">{{ $lang('common.currencySymbol') }}</text>
						{{ orderData.goods_money }}
					</text>
				</view>
			</view>
			<view class="order-cell" v-if="presaleDiscount > 0">
				<text class="tit">定金膨胀</text>
				<view class="box align-right">
					<text class="color-base-text">
						<text class="operator">-</text>
						<text class="font-size-goods-tag">{{ $lang('common.currencySymbol') }}</text>
						<text>{{ presaleDiscount }}</text>
					</text>
				</view>
			</view>
			<view class="order-cell">
				<text class="tit">运费</text>
				<view class="box align-right">
					<text class="color-base-text">
						<!-- <text class="operator">+</text> -->
						<text class="font-size-goods-tag">{{ $lang('common.currencySymbol') }}</text>
						<text>{{ orderData.delivery_money }}</text>
					</text>
				</view>
			</view>
			<view class="order-cell" v-if="orderData.invoice_money > 0">
				<text class="tit">
					税费
					<text class="color-base-text">({{ orderData.invoice_rate }}%)</text>
				</text>
				<view class="box align-right">
					<text class="color-base-text">
						<text class="operator">+</text>
						<text class="font-size-goods-tag">{{ $lang('common.currencySymbol') }}</text>
						<text>{{ orderData.invoice_money }}</text>
					</text>
				</view>
			</view>
			<view class="order-cell" v-if="orderData.invoice_delivery_money > 0">
				<text class="tit">发票邮寄费</text>
				<view class="box align-right">
					<text class="color-base-text">
						<text class="operator">+</text>
						<text class="font-size-goods-tag">{{ $lang('common.currencySymbol') }}</text>
						<text>{{ orderData.invoice_delivery_money }}</text>
					</text>
				</view>
			</view>
			<view class="order-cell" v-if="orderData.promotion_money > 0">
				<text class="tit">优惠</text>
				<view class="box align-right">
					<text class="color-base-text">
						<text class="operator">-</text>
						<text class="font-size-goods-tag">{{ $lang('common.currencySymbol') }}</text>
						<text>{{ orderData.promotion_money }}</text>
					</text>
				</view>
			</view>
			<view class="order-cell" v-if="orderData.coupon_money > 0">
				<text class="tit">优惠券</text>
				<view class="box align-right">
					<text class="color-base-text">
						<text class="operator">-</text>
						<text class="font-size-goods-tag">{{ $lang('common.currencySymbol') }}</text>
						<text>{{ orderData.coupon_money }}</text>
					</text>
				</view>
			</view>
			<view class="order-cell" v-if="balanceMoney > 0">
				<text class="tit">使用余额</text>
				<view class="box align-right">
					<text class="color-base-text">
						<text class="operator">-</text>
						<text class="font-size-goods-tag">{{ $lang('common.currencySymbol') }}</text>
						<text>{{ balanceMoney }}</text>
					</text>
				</view>
			</view>
			<view class="order-cell" v-if="orderData.point_money > 0">
				<text class="tit">积分抵扣</text>
				<view class="box align-right">
					<text class="color-base-text">
						<text class="operator">-</text>
						<text class="font-size-goods-tag">{{ $lang('common.currencySymbol') }}</text>
						<text>{{ orderData.point_money }}</text>
					</text>
				</view>
			</view>
			<view class="order-cell">
				<view class="box align-right">
					<text>合计：</text>
					<text class="color-base-text">
						<text class="font-size-goods-tag">{{ $lang('common.currencySymbol') }}</text>
						<text class="font-size-base">{{ orderData.order_money }}</text>
					</text>
				</view>
			</view>

			<view class="order-action" :class="{ 'bottom-safe-area': isIphoneX }" v-if="orderData.action.length > 0">
				<block v-for="(operationItem, operationIndex) in orderData.action" :key="operationIndex">
					<block v-if="operationItem.action == 'orderPayFinal'">
						<block  v-if="orderData.refund_status == 0 || orderData.refund_status == -1">
							<view class="order-box-btn color-base-border color-base-text" @click="operation(operationItem.action,isBalance)" v-if="orderData.pay_start_time < timestamp && orderData.pay_end_time > timestamp">{{ operationItem.title }}</view>
							<view class="order-box-btn disabled" v-else>{{ operationItem.title }}</view>
						</block>
						<view class="order-box-btn disabled" v-else>{{ operationItem.title }}</view>
					</block>
					<block v-else-if="operationItem.action == 'refundDeposit' && orderData.is_deposit_back == 0">
						<view class="order-box-btn" v-if="orderData.refund_status == 0" @click="operation(operationItem.action,isBalance)">{{ operationItem.title }}</view>
					</block>
					<view class="order-box-btn" @click="operation(operationItem.action,isBalance)" v-else>{{ operationItem.title }}</view>
				</block>
			</view>
		</view>

		<!-- 选择支付方式弹窗 -->
		<ns-payment ref="choosePaymentPopup" 
			:payMoney="payMoney" 
			@confirm="pay"
			@useBalance="useBalance"></ns-payment>
		<loading-cover ref="loadingCover"></loading-cover>
	</view>
</template>

<script>
import globalConfig from '@/common/js/golbalConfig.js';
import orderMethod from '../public/js/orderMethod.js';
import nsPayment from '@/components/payment/payment.vue';

export default {
	data() {
		return {
			isIphoneX: false,
			orderId: 0,
			orderData: {
				action: []
			},
			kefuConfig: {
				weapp: '',
				system: '',
				open: '',
				open_url: ''
			},
			timestamp: 0,
			payMoney: 0,
			payType: '',
			memberBalance: 0,
			isBalance: 0,
			isSub: false
		};
	},
	mixins: [globalConfig, orderMethod],
	components: {
		nsPayment
	},
	onLoad(option) {
		if (option.order_id) this.orderId = option.order_id;
		this.getKekuConfig();
	},
	computed:{
		balanceMoney(){
			return this.orderData.balance_deposit_money + this.orderData.balance_final_money;
		},
		balanceDeduct(){
			// if (this.orderData.order_status == 1 && this.memberBalance > 0) {
			if (this.memberBalance > 0) {
				let payMoney = this.orderData.order_money - this.orderData.presale_deposit_money;
				return (this.memberBalance > payMoney ? payMoney : this.memberBalance).toFixed(2);
			} else {
				return 0; 
			}
		},
		presaleDiscount(){
			return (parseFloat(this.orderData.presale_money) - parseFloat(this.orderData.presale_deposit_money)).toFixed(2);
		}
	},
	onShow() {
		// 刷新多语言
		this.$langConfig.refresh();

		this.isIphoneX = this.$util.uniappIsIPhoneX();

		if (uni.getStorageSync('token')) {
			this.getOrderData();
		} else {
			this.$util.redirectTo('/pages/login/login/login', { back: '/pages/order/detail/detail?order_id=' + this.orderId });
		}
		this.getMmemberBalance();
	},
	methods: {
		getMmemberBalance(){
			this.$api.sendRequest({
				url: '/api/memberaccount/info',
				data: {
					account_type: 'balance,balance_money'
				},
				success: res => {
					if (res.data) {
						this.memberBalance = parseFloat(res.data.balance) + parseFloat(res.data.balance_money);
					} 
				}
			});
		},
		//联系客服
		goConnect() {
			if (uni.getStorageSync('token')) {
				let data = {
					order_id: this.orderId
				};
				// #ifdef MP
				if (this.kefuConfig.system == 1) {
					this.$util.redirectTo('/otherpages/chat/room/room', data);
					return false;
				}
				// #endif
				// #ifndef MP

				if (this.kefuConfig.open == 1) {
					this.$util.redirectTo('/otherpages/webview/webview', { link: encodeURIComponent(this.kefuConfig.open_url) });
					return false;
				}
				if (this.kefuConfig.system == 1) {
					this.$util.redirectTo('/otherpages/chat/room/room', data);
					return false;
				}
				// #endif
			} else {
				this.$refs.login.open('/pages/goods/detail/detail?sku_id=' + this.orderData.sku_id);
				return;
			}
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
		goDetail() {
			this.$util.redirectTo('/promotionpages/presale/detail/detail', { id: this.orderData.presale_id });
		},
		getOrderData() {
			this.$api.sendRequest({
				url: '/presale/api/order/detail',
				data: {
					order_id: this.orderId
				},
				success: res => {
					this.timestamp = res.timestamp;
					uni.stopPullDownRefresh();
					if (res.code >= 0) {
						this.orderData = res.data;
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
					} else {
						this.$util.showToast({
							title: '未获取到订单信息！'
						});
						setTimeout(() => {
							this.$util.redirectTo('/promotionpages/presale/list/list');
						}, 1500);
					}
				},
				fail: res => {
					uni.stopPullDownRefresh();
					if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
				}
			});
		},
		/**
		 * 下拉刷新
		 */
		onPullDownRefresh() {
			this.getOrderData();
		},
		operation(action) {
			switch (action) {
				case 'deleteOrder': // 删除
					this.deleteOrder(this.orderData.id,() => {
						this.getOrderData();
					});
					break;
				case 'orderClose': //关闭
					this.orderClose(this.orderData.id, () => {
						this.getOrderData();
					});
					break;
				case 'orderPayDeposit'://定金支付
					this.openPaymentPopup(this.orderData, 'presale_deposit_money');
					break;
				case 'refundDeposit'://退定金
					this.refundDeposit(this.orderData.id, () => {
						this.getOrderData();
					});
					break;
				case 'orderPayFinal': //支付尾款
					this.openPaymentPopup(this.orderData, 'final_money');
					break;
			}
		},
		imageError() {
			this.orderData.sku_image = this.$util.getDefaultImage().default_goods_img;
			this.$forceUpdate();
		},
		pay(){
			if (this.isSub) return;
			this.isSub = true;
			if (this.payType == 'final_money') {
				this.orderPayFinal(this.orderData, () => {
					this.getOrderData();
				})
			} else if (this.payType == 'presale_deposit_money') {
				this.orderPayDeposit(this.orderData, () => {
					this.getOrderData();
				})
			}
		},
		useBalance() {
			if (this.isBalance) {
				this.isBalance = 0;
				this.payMoney += parseFloat(this.balanceDeduct);
			} else {
				this.isBalance = 1;
				this.payMoney -= parseFloat(this.balanceDeduct);
			}
		}
	},
	filters: {
		abs(value) {
			return Math.abs(parseFloat(value)).toFixed(2);
		}
	}
};
</script>

<style lang="scss">
@import '../public/css/order_detail.scss';
</style>
