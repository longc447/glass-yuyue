<template>
	<view :data-theme="themeStyle" :style="{ backgroundColor: bgColor, backgroundImage: bgImg, minHeight: 'calc(100vh - 55px)' }" class="page_img">
		<!-- #ifndef H5 -->
		<view class="page-header">
			<ns-navbar
				:is-back="!1"
				:background="bgNav"
				:title-color="textNavColor"
				:border-bottom="false"
				:globalS="diyData.global"
				z-index="1001"
				:type="index"
				type="index"
				ref="topNav"
			></ns-navbar>
		</view>
		<!-- #endif -->

		<diy-index-page
			ref="indexPage"
			:value="topIndexValue"
			:minHeight="minHeight"
			:scrollHeight="scrollHeight"
			:scrollTopHeight="scrollTopHeight"
			:bgUrl="bgUrl"
			v-if="topIndexValue"
		>
			<diy-group :diyData="diyData" :name="name" :siteId="siteId" v-if="diyData.value" :height="scrollTopHeight"></diy-group>
			<view class="padding-bottom"><ns-copyright></ns-copyright></view>
		</diy-index-page>

		<scroll-view scroll-y="true" show-scrollbar="false" :style="{ height: 'calc(100vh - headerHeight - 55px)' }" v-else>
			<view class="bg-index" :style="backgroundUrl">
					<diy-group v-if="diyData.value && isChangeCity" :diyData="diyData" :name="name" :siteId="siteId" :city="city" :websiteInfoStatus="websiteInfoStatus"></diy-group>
				
				
				<view class="padding-bottom"><ns-copyright></ns-copyright></view>
			</view>
		</scroll-view>

		<template v-show="diyData.global.popWindow && diyData.global.popWindow.count != -1 && diyData.global.popWindow.imageUrl">
			<view @touchmove.prevent.stop>
				<uni-popup ref="uniPopupWindow" type="center" class="wap-floating" :maskClick="false">
					<view class="image-wrap">
						<image
							:src="$util.img(diyData.global.popWindow.imageUrl)"
							:style="{ height: (480 * diyData.global.popWindow.imgHeight) / diyData.global.popWindow.imgWidth + 'rpx' }"
							@click="redirectTo(diyData.global.popWindow.link)"
						></image>
					</view>
					<text class="iconfont iconroundclose" @click="closePopupWindow"></text>
				</uni-popup>
			</view>
		</template>

		<!-- ?????????????????? -->
		<view @touchmove.prevent.stop class="PopWindow">
			<uni-popup ref="uniPopupClose" type="center" class="wap-floating" :maskClick="false">
				<view class="popup-box">
					<view class="close_title margin-top">????????????</view>
					<view class="close_content">
						<scroll-view scroll-y="true" class="close_content_box">{{ webSiteInfo.close_reason }}</scroll-view>
					</view>
				</view>
			</uni-popup>
		</view>

		<!-- ??????tabBar -->
		<view class="tabBar-fill"></view>
		<template v-if="openBottomNav">
			<diy-bottom-nav></diy-bottom-nav>
		</template>

		<!-- ?????? -->
		<uni-popup ref="collectPopupWindow" type="top" class="wap-floating wap-floating-collect">
			<view v-if="showTip" class="collectPopupWindow" :style="{ marginTop: collectTop + statusBarHeight + 'px' }">
				<image :src="$util.img('/upload/uniapp/collect2.png')" mode="aspectFit"></image>
				<text @click="closeCollectPopupWindow">????????????</text>
			</view>
		</uni-popup>

		<loading-cover ref="loadingCover"></loading-cover>
	</view>
</template>

<script>
import uniPopup from '@/components/uni-popup/uni-popup.vue';
import diyBottomNav from '@/components/diy-bottom-nav/diy-bottom-nav.vue';
import WxMap from 'common/js/map-wx-jssdk.js';
import diyIndexPage from '@/components/diy-index-page/diy-index-page.vue';
import diyGroup from '@/components/diy-group/diy-group.vue';
import nsNavbar from '@/components/ns-navbar/ns-navbar.vue';
import { Weixin } from 'common/js/wx-jssdk.js';
import globalConfig from '@/common/js/golbalConfig.js';
import nsCopyRight from '@/components/ns-copyright/ns-copyright.vue';
let systemInfo = uni.getSystemInfoSync();
export default {
	components: {
		uniPopup,
		diyBottomNav,
		nsNavbar,
		diyIndexPage,
		diyGroup,
		nsCopyRight
	},
	data() {
		return {
			diyData: {
				global: {
					title: '',
					popWindow: {
						imageUrl: '',
						count: -1,
						link: {}
					}
				}
			},
			navTitle: '',
			webSiteInfo: null,
			memberId: 0,
			name: '',
			city: '',
			city_first: 0,//????????????
			siteId: 0,
			isIphoneX: false,
			pageHeight: '0',
			headerHeight: '0',
			bottomHeight: '0',
			topIndexValue: null,
			statusBarHeight: systemInfo.statusBarHeight,
			collectTop: 44,
			showTip: false,
			mpCollect: false,
			websiteInfoStatus:1,
			isChangeCity: 0
		};
	},
	mixins: [globalConfig],
	computed: {
		top() {
			let top = 0;
			// #ifndef h5
			top = this.isIphoneX ? 180 : 140;
			// #endif
			// #ifdef H5
			top = 90;
			// #endif
			return top;
		},
		bgColor() {
			let str = '';
			if (this.diyData && this.diyData.global) {
				str = this.diyData.global.bgColor;
			}
			return str;
		},
		bgImg() {
			let str = '';
			if (this.diyData && this.diyData.global) {
				str = this.diyData.global.topNavbg ? 'url(' + this.$util.img(this.diyData.global.bgUrl) + ')' : this.diyData.global.bgColor;
			}
			return str;
		},
		bgUrl() {
			let str = '';
			if (this.diyData && this.diyData.global) {
				str = this.diyData.global.topNavbg ? 'transparent' : this.diyData.global.bgUrl;
			}
			return str;
		},
		bgNav() {
			if (this.diyData.global.topNavColor) {
				return { background: this.diyData.global.topNavColor };
			} else {
				return { background: '#ffffff' };
			}
		},
		backgroundUrl() {
			var str = this.bgUrl ? 'background:' + 'url(' + this.$util.img(this.bgUrl) + ') no-repeat 0 0/100%' : '';
			return str;
		},
		scrollHeight() {
			if (this.pageHeight != undefined && this.headerHeight != undefined && this.bottomHeight != undefined) {
				return 'calc(' + this.pageHeight + 'px - ' + this.headerHeight + ' - ' + this.bottomHeight + ')';
			} else {
				return '100vh';
			}
		},
		scrollTopHeight() {
			if (this.pageHeight != undefined && this.headerHeight != undefined && this.bottomHeight != undefined) {
				return 'calc(' + this.pageHeight + 'px - ' + this.headerHeight + ' - ' + this.bottomHeight + ' - 80rpx)';
			} else {
				return '100vh';
			}
		},
		textNavColor() {
			if (this.diyData.global.textNavColor) {
				return this.diyData.global.textNavColor;
			} else {
				return '#ffffff';
			}
		},
		openBottomNav() {
			let str = false;
			if (this.diyData && this.diyData.global) {
				str = this.diyData.global.openBottomNav;
			}
			return str;
		},
		minHeight() {
			if (this.pageHeight != undefined && this.headerHeight != undefined && this.bottomHeight != undefined) {
				return 'calc(100vh - ' + this.headerHeight + ' - ' + this.bottomHeight + ' - 80rpx)';
			} else {
				return '100vh';
			}
		},
		globalS() {
			return this.diyData.global;
		}
	},
	//????????????
	async onPullDownRefresh() {
		await this.getDiyInfo();
	},
	async onLoad(data) {
		uni.hideTabBar();
		this.name = data.name || '';
		this.siteId = data.site_id || 0;
		this.isIphoneX = this.$util.uniappIsIPhoneX();
		
		if(this.name == 'DIY_VIEW_CITY_INDEX' && this.siteId && !this.city_first){
			this.getCityId(this.siteId);
		}
		if (this.name) {
			if (data.suid) uni.setStorageSync('suid', data.suid);
			// ?????????????????????
			if (data.scene) {
				var sceneParams = decodeURIComponent(data.scene);
				sceneParams = sceneParams.split('&');
				if (sceneParams.length) {
					sceneParams.forEach(item => {
						if (item.indexOf('suid') != -1) uni.setStorageSync('suid', item.split('-')[1]);
					});
				}
			}
		} else {
			this.$util.redirectTo('/pages/index/index/index', {}, 'reLaunch');
		}
		if(this.name == 'DIY_VIEW_CITY_INDEX') await this.refresh();
	},
	onHide() {
		// ???????????????????????????
		this.$store.commit('setDiySeckillInterval', null);
		this.isChangeCity = 0;
	},
	async onShow() {
		if(this.name == 'DIY_VIEW_CITY_INDEX' && this.city_first){
			await this.refresh();
			
			if(uni.getStorageSync('websiteInfoStatus')){
				this.websiteInfoStatus = uni.getStorageSync('websiteInfoStatus');
			}
		}else if(this.name != 'DIY_VIEW_CITY_INDEX'){
			await this.refresh();
		}
		this.getHeight();
		this.$store.commit('setDiySeckillInterval', 1);
	},
	onPageScroll(e) {
		if (this.$refs.topNav) {
			if (e.scrollTop >= 20) {
				this.$refs.topNav.navTopBg();
			} else {
				this.$refs.topNav.unSetnavTopBg();
			}
		}
	},
	onUnload(){
		
	},
	methods: {
		//????????????id
		getCityId(value) {
			this.$api.sendRequest({
				url: '/api/website/getWebsiteInfo',
				data: {
					site_id: value
				},
				success: res => {
					if (res.code >= 0) {
						this.selectCity({id:res.data.site_area_id});
					}
				}
			})
		},
		//??????
		async selectCity(data) {
			this.$api.sendRequest({
				url: '/api/website/getWebsiteidByAddress',
				data: {
					web_city: data.id
				},
				success: async res => {
					if (res.code >= 0) {
						if (res.data) {
							uni.setStorage({
								key: 'city',
								data: {id:res.data.site_area_id,title:res.data.site_area_name},
								success: () => {
								}
							})
							uni.setStorage({
								key: 'website_id',
								data: res.data.site_id,
								success: () => {
									
								}
							})
							await this.refresh();
							this.city_first = 1;
							this.websiteInfoStatus = res.data.status;
						} else {
							this.$util.showToast({
								title: '?????????????????????????????????????????????'
							});
							
							setTimeout(() => {
								uni.setStorage({
									key: 'city',
									data: {id: 0, title: '??????'},
									success: () => {
										this.$util.goBack();
									}
								})
								uni.setStorage({
									key: 'website_id',
									data: 0,
									success: () => {
										
									}
								})
							}, 1500)
						}
					}
				}
			})
		},
		async refresh() {
			this.$langConfig.refresh();

			if (uni.getStorageSync('token')) {
				this.getMemberId();
			}
			this.siteId = uni.getStorageSync('website_id') || 0;
			if(this.siteId == 0){
				if(this.name == 'DIY_VIEW_CITY_INDEX'){
					this.name = 'DIY_VIEW_INDEX';
				}else{
					this.name =  this.name
				}
				
			}else{
				this.name = 'DIY_VIEW_CITY_INDEX';
			}
			this.$store.dispatch('defaultImg');
			this.$store.dispatch('getThemeStyle');
			this.getWebSitefo();

			if (uni.getStorageSync('city')) {
				this.city = uni.getStorageSync('city').title;
			} else {
				uni.setStorageSync('city', {
					id: 0,
					title: '??????'
				});
				this.city = '??????';
				this.getLocation();
			}
			await this.getDiyInfo();
			
		},
		//????????????
		getHeight() {
			var self = this;
			//?????????????????????????????????
			uni.getSystemInfo({
				success: res => {
					this.pageHeight = res.screenHeight;
				}
			});
			// #ifdef MP || APP-PLUS
			this.$nextTick(() => {
				const query = uni.createSelectorQuery().in(this);
				query
					.select('.page-header')
					.boundingClientRect(data => {
						this.headerHeight = data.height + 'px';
					})
					.exec();
			});
			// #endif
			this.$nextTick(() => {
				const query = uni.createSelectorQuery().in(this);
				query
					.select('.page-bottom')
					.boundingClientRect(data => {
						this.bottomHeight = 55 + 'px';
					})
					.exec();
			});
		},
		async getDiyInfo() {
			this.$api.sendRequest({
				url: '/api/diyview/info',
				data: {
					name: this.name,
					website_id: this.siteId
				},
				async: true,
				success: res => {
					if (res.code != 0 || !res.data) {
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
						this.diyData = {};
						return;
					}
					
					let diyDatavalue = res.data;
					//??????????????????input????????????????????? -- ???????????????
					diyDatavalue.value = diyDatavalue.value.replace(/\@/g, "'");
					if (diyDatavalue.value) {
						this.diyData = JSON.parse(diyDatavalue.value);
						this.isChangeCity = 1;
						this.$langConfig.title(this.diyData.global.title);
						this.navTitle = this.diyData.global.title;
						this.mpCollect = this.diyData.global.mpCollect;
						if (this.diyData.global.popWindow && this.diyData.global.popWindow.imageUrl) {
							// ??????????????????????????? 1??????????????? 0
							setTimeout(() => {
								if (this.diyData.global.popWindow.count == 1) {
									var diy_popwindow_count = uni.getStorageSync('diy_popwindow_count');
									if ((this.$refs.uniPopupWindow && diy_popwindow_count == '') || (this.$refs.uniPopupWindow && diy_popwindow_count == 1)) {
										this.$refs.uniPopupWindow.open();
										uni.setStorageSync('diy_popwindow_count', 1);
									}
								} else if (this.diyData.global.popWindow.count == 0) {
									this.$refs.uniPopupWindow.open();
									uni.setStorageSync('diy_popwindow_count', 0);
								}
							}, 500);
						}

						for (var i = 0; i < this.diyData.value.length; i++) {
							if (this.diyData.value[i].controller == 'TopCategory') {
								this.topIndexValue = this.diyData.value[i];
							}
						}

						// #ifdef MP
						//???????????????
						if (!uni.getStorageSync('isCollect') && this.diyData.global.mpCollect) {
							this.$refs.collectPopupWindow.open();
							// uni.setStorageSync('isCollect', true);
							// uni.getStorageSync('isCollect',true);
							this.showTip = true;
						}
						// #endif
					}
					uni.stopPullDownRefresh();
					// setTimeout(() => {
					if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
					// }, 1200);
				},
				fail: res => {
					uni.stopPullDownRefresh();
					if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
				}
			});
		},
		closePopupWindow() {
			this.$refs.uniPopupWindow.close();
			uni.setStorageSync('diy_popwindow_count', -1);
		},
		closeCollectPopupWindow() {
			this.$refs.collectPopupWindow.close();
			uni.setStorageSync('isCollect', true);
		},
		redirectTo(link) {
			this.$util.diyRedirectTo(link);
		},
		getMemberId() {
			this.$api.sendRequest({
				url: '/api/member/id',
				success: res => {
					if (res.code >= 0) {
						this.memberId = res.data;
					}
				}
			});
		},
		getWebSitefo() {
			this.webSiteInfo = uni.getStorageSync('web_site_info');
			if (this.webSiteInfo) this.webSiteInfo = JSON.parse(this.webSiteInfo);
			this.$api.sendRequest({
				url: '/api/website/info',
				success: res => {
					let data = res.data;
					if (data) {
						this.webSiteInfo = data;
						if (this.webSiteInfo.wap_status) return;
						this.$refs.uniPopupClose.open();
						uni.setStorageSync('web_site_info', JSON.stringify(this.webSiteInfo));
					}
				}
			});
		},
		// ??????????????????
		getLocation() {
			const map = new WxMap({
				key: this.$config.mpKey
			});
			uni.getLocation({
				type: 'gcj02',
				success: res => {
					map.reverseGeocoder({
						location: {
							latitude: res.latitude,
							longitude: res.longitude
						},
						success: res => {
							this.$api.sendRequest({
								url: '/api/address/citybyname',
								data: {
									city: res.result.address_component.city
								},
								success: res => {
									if (res.data) {
										this.city = res.data.title;
										uni.setStorageSync('city', res.data);
									}
								}
							});
						},
						fail: res => {}
					});
				}
			});
		},
		// #ifdef MP-WEIXIN
		// ????????????????????????
		onShareTimeline() {
			let query = '';
			if (this.memberId) query = 'suid=' + this.memberId;
			return {
				title: '',
				query: query,
				imageUrl: ''
			};
		}
		// #endif
	},
	onShareAppMessage(res) {
		var title = '';
		if (this.webSiteInfo) title = this.webSiteInfo.title;
		var path = '/otherpages/diy/diy/diy?name=' + this.name;
		if (this.memberId) path += '&suid=' + this.memberId;
		return {
			title: title,
			path: path,
			success: res => {},
			fail: res => {}
		};
	},
	onReady() {
		// ?????????????????????
		// #ifdef H5
		if (this.$util.isWeiXin()) {
			this.$api.sendRequest({
				url: '/wechat/api/wechat/share',
				data: {
					url: window.location.href
				},
				success: res => {
					if (res.code == 0) {
						var wxJS = new Weixin();
						wxJS.init(res.data.jssdk_config);

						let shareConfig = res.data.share_config,
							url = this.$config.h5Domain + '/otherpages/diy/diy/diy?name=' + this.name;
						if (this.memberId) url += '&suid=' + this.memberId;

						wxJS.setShareData({
							title: shareConfig.shop_param_1 + shareConfig.site_name,
							desc: shareConfig.shop_param_2 + '\r\n' + shareConfig.shop_param_3 + '\r\n' + '??????????????????????????????',
							link: url,
							imgUrl: this.$util.img(shareConfig.site_logo)
						});
					}
				}
			});
		}
		// #endif
	}
};
</script>

<style lang="scss">
	.padding-bottom {
		position: fixed;
		bottom: 0;
		left: 38%;
		padding-bottom: 0 !important; 
	}
.collectPopupWindow {
	position: relative;
	height: 113rpx;
	width: 510rpx;
	margin-left: calc(100% - 530rpx);

	image {
		width: 100%;
		height: 100%;
	}

	text {
		color: #ff4544 !important;
		font-size: 24rpx !important;
		position: absolute;
		top: 48rpx;
		right: 25rpx;
	}
}
.zhezhao {
	width: 100vw;
	height: 100vh;
	background-color: transparent;
}
image {
	max-width: 100% !important;
	max-height: 100% !important;
}
.diy-wrap {
	/* #ifdef H5 */
	height: calc(100vh - 44px);
	/* #endif */
	/* #ifdef MP-WEIXIN */
	height: 100vh;
	/* #endif */
}
.page_img {
	background-size: contain !important;
	background-repeat: no-repeat !important;
}
.bg-index {
	width: 100%;
	height: 100%;
	padding: 0 30rpx;
	box-sizing: border-box;
}
.closeCity{
	line-height: 500rpx;
	text-align: center;
}
.wap-floating {
	.image-wrap {
		width: 480rpx;

		image {
			width: 100%;
			border-radius: 40rpx;
		}
	}

	text {
		display: block;
		font-size: 60rpx;
		color: #ffffff;
		text-align: center;
	}
}

.wap-floating-collect .uni-popup__mask {
	background: transparent;
}

::-webkit-scrollbar {
	width: 0;
	height: 0;
	color: transparent;
}

.popup-box {
	width: 450rpx;
	background: #ffffff;
	border-radius: $border-radius;
	overflow: hidden;

	.close_title {
		width: 100%;
		text-align: center;
		height: 70rpx;
		line-height: 70rpx;
		font-size: $font-size-base;
	}

	.close_content {
		width: 100%;
		max-height: 500rpx;
		padding: $padding;
		box-sizing: border-box;
	}

	.close_content_box {
		width: 100%;
		max-height: 460rpx;
		line-height: 1.3;
	}
}

.noStore-text {
	color: #000000 !important;
}

.isStore-top {
	margin-bottom: 10rpx;
}

.tabBar-fill {
	height: calc(constant(safe-area-inset-bottom) + 56px);
	height: calc(env(safe-area-inset-bottom) + 56px);
}
.keep-on-record {
	text-align: center;
	padding-bottom: 20rpx;
	image {
		width: 150rpx;
		height: 60rpx;
	}
}
/deep/::-webkit-scrollbar {
	width: 0;
	height: 0;
	background-color: transparent;
	display: none;
}
</style>

<style scoped>
.wap-floating >>> .uni-popup__wrapper.uni-custom .uni-popup__wrapper-box {
	background: none !important;
}

/* .noStore-bg /deep/ .search-box {
	background: #ffffff;
}

.noStore-bg /deep/ .single-graph {
	background: #ffffff;
} */
/deep/ .placeholder {
	height: 0;
}
</style>
