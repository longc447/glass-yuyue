<template>
	<view class="nc-address-content" :data-theme="themeStyle">
		<mescroll-uni ref="mescroll" @getData="getListData">
			<block slot="list">
				<view class="address-list">
					<template v-if="addressList.length !== 0">
						<view class="address-item" v-for="(item, index) in addressList" :key="index">
							<view class="address-item-top" @click="setDefault(item.id)">
								<view class="address-top-info">
									<view class="address-name">{{ item.name }}</view>
									<view class="address-tel">{{ item.mobile }}</view>
								</view>
								<view class="address-info">{{ item.full_address }}{{ item.address }}</view>
							</view>
							<view class="address-item-bottom">
								<view class="address-default">
									<view class="iconfont" :class="item.is_default == 1 ? 'iconyuan_checked color-base-text' : 'iconyuan_checkbox'"></view>
									<text class="default" :class="{ 'color-base-text': item.is_default == 1 }" @click="setDefault(item.id)">{{ $lang('defaultAddress') }}</text>
								</view>
								<view class="address-btn">
									<text class="edit" @click="addAddress('edit', item.id)">
										<text class="iconfont iconbianji"></text>
										{{ $lang('modify') }}
									</text>
									<text class="delete" v-if="item.is_default != 1" @click="deleteAddress(item.id, item.is_default)">
										<text class="iconfont iconicon7"></text>
										{{ $lang('del') }}
									</text>
								</view>
							</view>
						</view>
						<view class="btn-add">
							<!-- #ifdef MP-WEIXIN -->
							<view class="wx-add" @click="getChooseAddress()" v-if="local != 1">
								<text class="">{{ $lang('getAddress') }}</text>
							</view>
							<!-- #endif -->
							<!-- #ifdef H5 -->
							<button type="primary" class="add-address" @click="getChooseAddress()" v-if="$util.isWeiXin() && local != 1">{{ $lang('getAddress') }}</button>
							<!-- #endif -->
							<button type="primary" class="add-address" @click="addAddress('add')">
								<text class="iconfont iconadd1"></text>
								{{ $lang('newAddAddress') }}
							</button>
						</view>
					</template>
					<view v-if="addressList.length == 0 && showEmpty" class="empty-box cart-empty">
						<ns-empty text="??????????????????" :isIndex="isIndex" :fixed="!1"></ns-empty>
					</view>
					<view class="button-wrap" v-if="addressList.length == 0 && showEmpty">
						<!-- #ifdef H5 -->
						<button type="primary" class="add-address" @click="getChooseAddress()" v-if="$util.isWeiXin() && local != 1">{{ $lang('getAddress') }}</button>
						<!-- #endif -->
						<!-- #ifdef MP-WEIXIN || MP-BAIDU || MP-TOUTIAO -->
						<view class="wx-add" @click="getChooseAddress()" v-if="local != 1">
							<text class="">{{ $lang('getAddress') }}</text>
						</view>
						<!-- <button type="primary" class="add-wx color-base-text" @click="getChooseAddress()">{{ $lang('getAddress') }}</button> -->
						<!-- #endif -->

						<button type="primary" class="add-address" @click="addAddress('add')">
							<text class="iconfont iconadd1"></text>
							{{ $lang('newAddAddress') }}
						</button>
					</view>
				</view>
			</block>
		</mescroll-uni>
		<loading-cover ref="loadingCover"></loading-cover>
	</view>
</template>

<script>
	import globalConfig from '@/common/js/golbalConfig.js';
	import {
		Weixin
	} from 'common/js/wx-jssdk.js';

	export default {
		data() {
			return {
				addressList: [],
				back: '', // ?????????
				redirect: 'redirectTo', // ????????????
				isIndex: false,
				showEmpty: false,
				local: 0, //??????????????????
			};
		},
		mixins: [globalConfig],
		onLoad(option) {
			if (option.back) {
				this.back = option.back;
				uni.setStorageSync('addressBack', option.back);
			}
			if (option.redirect) this.redirect = option.redirect;

			if (option.local) this.local = option.local;

			if (uni.getStorageSync('addressBack')) {
				this.back = uni.getStorageSync('addressBack');
			}
		},
		onShow() {
			// ???????????????
			this.$langConfig.refresh();
			if (this.$refs.mescroll) this.$refs.mescroll.refresh();
			uni.removeStorageSync('addressInfo');
		},
		methods: {
			getListData(mescroll) {
				this.showEmpty = false;
				this.$api.sendRequest({
					url: '/api/memberaddress/page',
					data: {
						page: mescroll.num,
						page_size: mescroll.size
					},
					success: res => {
						this.showEmpty = true;
						let newArr = [];
						let msg = res.message;
						if (res.code == 0 && res.data) {
							newArr = res.data.list;
						} else {
							this.$util.showToast({
								title: msg
							});
						}
						mescroll.endSuccess(newArr.length);
						//??????????????????
						if (mescroll.num == 1) this.addressList = []; //???????????????????????????????????????
						this.addressList = this.addressList.concat(newArr); //???????????????
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
					},
					fail: res => {
						mescroll.endErr();
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
					}
				});
			},

			/* ???????????? */
			addAddress(type, id) {
				let data = {};
				if (type == 'edit') data.id = id;
				if (this.back) data.back = this.back;

				this.$util.redirectTo('/otherpages/member/address_edit/address_edit', data);
			},
			/* ?????????????????? */
			deleteAddress(id, is_default) {
				uni.showModal({
					title: '????????????',
					content: '??????????????????????????????',
					success: res => {
						if (res.confirm) {
							if (is_default == 1) {
								this.$util.showToast({
									title: '???????????????????????????'
								});
								return;
							}
							this.$api.sendRequest({
								url: '/api/memberaddress/delete',
								data: {
									id: id
								},
								success: res => {
									if (res.code == 0) {
										this.$util.showToast({
											title: '????????????'
										});
									} else {
										this.$util.showToast({
											title: '????????????'
										});
									}
									this.$refs.mescroll.refresh();
								},
								fail: res => {
									mescroll.endErr();
								}
							});
						}
					}
				});
			},
			setDefault(id) {
				this.$api.sendRequest({
					url: '/api/memberaddress/setdefault',
					data: {
						id
					},
					success: res => {
						if (res.data > 0) {
							this.$refs.mescroll.refresh();
							if (this.back != '') {
								let jump = true;
								let arr = getCurrentPages().reverse();
								for (let i = 0; i < arr.length; i++) {
									if (this.back.indexOf(arr[i].route) != -1) {
										jump = false;
										uni.navigateBack({
											delta: i
										});
										break;
									}
								}
								if (jump) {
									this.$util.redirectTo(this.back, {}, 'redirectTo');
								}
							} else {
								this.$refs.mescroll.refresh();
								this.$util.showToast({
									title: '????????????????????????'
								});
							}
						} else {
							this.$util.showToast({
								title: res.message
							});
						}
					}
				});
			},
			/**
			 * ??????????????????
			 */
			getChooseAddress() {
				// #ifdef H5
				if (this.$util.isWeiXin()) {
					if (uni.getSystemInfoSync().platform == 'ios') {
						var url = uni.getStorageSync('initUrl');
					} else {
						var url = location.href;
					}
					// ??????jssdk??????
					this.$api.sendRequest({
						url: '/wechat/api/wechat/jssdkconfig',
						data: {
							url: url
						},
						success: jssdkRes => {
							if (jssdkRes.code == 0) {
								var wxJS = new Weixin();
								wxJS.init(jssdkRes.data);

								wxJS.openAddress(res => {
									if (res.errMsg == 'openAddress:ok') {
										this.saveAddress({
											name: res.userName, // ???????????????,
											mobile: res.telNumber, // ?????????
											province: res.provinceName, // ???
											city: res.cityName, // ???
											district: res.countryName, // ???
											address: res.detailInfo, // ????????????
											full_address: res.provinceName + '-' + res.cityName + '-' + res.countryName
										});
									} else {
										this.$util.showToast({
											title: res.errMsg
										});
									}
								});
							} else {
								this.$util.showToast({
									title: jssdkRes.message
								});
							}
						}
					});
				}
				// #endif

				// #ifdef MP-WEIXIN || MP-BAIDU || MP-TOUTIAO
				uni.chooseAddress({
					success: res => {
						if (res.errMsg == 'chooseAddress:ok') {
							this.saveAddress({
								name: res.userName, // ???????????????,
								mobile: res.telNumber, // ?????????
								province: res.provinceName, // ???
								city: res.cityName, // ???
								district: res.countyName, // ???
								address: res.detailInfo, // ????????????
								full_address: res.provinceName + '-' + res.cityName + '-' + res.countyName
							});
						} else {
							this.$util.showToast({
								title: res.errMsg
							});
						}
					}
				});
				// #endif
			},
			/**
			 * ??????????????????
			 * @param {Object} params
			 */
			saveAddress(params) {
				this.$api.sendRequest({
					url: '/api/memberaddress/addthreeparties',
					data: params,
					success: res => {
						if (res.code >= 0) {
							this.$refs.mescroll.refresh();
						} else {
							this.$util.showToast({
								title: res.message
							});
						}
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	/deep/ .fixed {
		position: relative;
		top: 0;
	}

	.cart-empty {
		padding-top: 104px !important;
	}

	.address-list {
		width: 100%;
		height: 100%;

		.local {
			display: flex;
			align-items: center;
			margin: $margin-updown $margin-both;
			background-color: #fff;
			padding: 30rpx;
			border-radius: $border-radius;

			text {
				margin-right: 10rpx;
			}
		}

		.address-item {
			margin: $padding 30rpx 0;
			display: flex;
			flex-direction: column;
			background-color: #ffffff;
			padding: 30rpx;
			box-sizing: border-box;
			border-radius: 20rpx;

			.address-item-top {
				display: flex;
				flex-direction: column;
				border-bottom: 1rpx solid $color-line;

				.address-top-info {
					display: flex;
					justify-content: flex-start;

					.address-name {
						color: #000000;
						font-size: $font-size-toolbar;
					}

					.address-tel {
						color: #000000;
						font-size: $font-size-toolbar;
						margin-left: 26rpx;
					}
				}

				.address-info {
					font-size: $font-size-base;
					color: $color-tip;
					margin-top: 10rpx;
					margin-bottom: 28rpx;
				}
			}

			.address-item-bottom {
				display: flex;
				justify-content: space-between;
				padding-top: 30rpx;

				.address-default {
					display: flex;
					align-items: center;
					font-size: $font-size-base;
					line-height: 1;

					.default {
						padding-left: 10rpx;
					}

					.iconfont {
						line-height: 1;
					}
				}

				.address-btn {
					font-size: $font-size-base;
					line-height: 1;
					display: flex;
					align-items: center;

					.edit {
						text {
							vertical-align: center;
							margin-right: 10rpx;
							font-size: 30rpx;
						}
					}

					.delete {
						padding-left: 40rpx;

						text {
							margin-right: 10rpx;
							font-size: 26rpx;
						}
					}
				}
			}
		}

		.btn-add {
			margin-top: 60rpx;
			bottom: 0px;
			margin-left: 30rpx;
			margin-right: 30rpx;
			width: calc(100% - 60rpx);

			.add-address {
				height: 80rpx;
				line-height: 80rpx;
				border-radius: 80rpx;
				margin: 30rpx 0 30rpx;

				text {
					margin-right: 10rpx;
					font-size: $font-size-base;
				}
			}
		}

		.wx-add {
			margin-top: 30rpx;
			margin-bottom: 30rpx;
			text-align: center;
			height: 80rpx;
			line-height: 80rpx;
			border: 1px solid #cccccc;
			border-radius: 80rpx;
		}
	}

	.button-wrap {
		height: 250rpx;
		margin: auto;
		margin-top: 30rpx;
		width: calc(100% - 60rpx);

		z-index: 9;
		text-align: center;
		overflow: hidden;

		.add-address {
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 80rpx;
			margin: 30rpx 0 30rpx;

			text {
				margin-right: 10rpx;
				font-size: $font-size-base;
			}
		}

		.add-wx {
			background-color: none;
			margin-top: 30rpx;
			margin-bottom: 30rpx;
			width: 100%;
			text-align: center;
			height: 92rpx;
			line-height: 92rpx;
			border: 1px solid #cccccc;
			border-radius: 92rpx;
		}
	}
</style>
