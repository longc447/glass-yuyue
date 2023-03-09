<template>
	<view :data-theme="themeStyle">
		 <!-- v-if="addonIsExit.presale" -->
		<mescroll-uni @getData="getData" ref="mescroll" :size="10" v-if="addonIsExit.presale">
			<block slot="list">
					<!-- <image :src="$util.img('upload/default/diy_view/index_presale.png')" mode="widthFix"></image> -->
				<ns-adv keyword="NS_PRESALE"></ns-adv>
				<view class="goods-list single-column" v-if="dataList.length">
					<view class="goods-item margin-bottom" v-for="(item, index) in dataList" :key="index">
						<view class="goods-img" @click="toDetail(item)">
							<image :src="goodsImg(item.goods_image)" mode="widthFix" @error="imgError(index)"></image>
							<view class="color-base-bg goods-tag" v-if="goodsTag(item) != '' ">{{ goodsTag(item) }}</view>
						</view>
						<view class="info-wrap">
							<view class="name-wrap">
								<view class="goods-name" @click="toDetail(item)">{{ item.goods_name }}</view>
								<view class="presale-info">
									<text class="color-base-text" v-if="item.presale_price > 0">定金{{ $lang('common.currencySymbol') }}{{ item.presale_deposit }}可抵{{ $lang('common.currencySymbol') }}{{ item.presale_price }}</text>
								</view>
							</view>
							<view class="pro-info">
								<view class="discount-price">
									<text class="unit color-base-text font-size-tag">{{ $lang('common.currencySymbol') }}</text>
									<text class="price color-base-text font-size-toolbar">{{ showPrice(item) }}</text>
								</view>
								<view @click="toDetail(item)"><button type="primary" size="mini">去付定金</button></view>
							</view>
						</view>
					</view>
				</view>
				<view v-if="!dataList.length">
					<ns-empty :fixed="!1" text="暂无预售商品"></ns-empty>
				</view>
			</block>
		</mescroll-uni>
		<loading-cover ref="loadingCover"></loading-cover>
		<!-- <ns-show-toast></ns-show-toast> -->
	</view>
</template>

<script>
import globalConfig from '@/common/js/golbalConfig.js';
import nsAdv from '@/components/ns-adv/ns-adv.vue';
// import nsShowToast from '@/components/ns-show-toast/ns-show-toast.vue'

export default {
	components: {
		nsAdv
		// nsShowToast
	},
	data() {
		return {
			dataList: []
		};
	},
	mixins:[globalConfig],
	onLoad(options) {
		if(uni.getStorageSync('presaleOrderCreateData').site_id){
			this.site_id = uni.getStorageSync('presaleOrderCreateData').site_id
		}
	},
	onShow() {
		// 刷新多语言
		if(!this.addonIsExit.presale){
			this.$util.showToast({
				title: '预售插件未安装',
				mask: true,
				duration: 2000
			})
			setTimeout(() => {
				this.$util.redirectTo('/pages/index/index/index',{},'redirectTo')
			}, 2000)
			return;
		}
		this.$langConfig.refresh();
	},
	methods: {
		getData(mescroll) {
			this.$api.sendRequest({
				url: '/presale/api/goods/page',
				data: {
					page_size: mescroll.size,
					page: mescroll.num
				},
				success: res => {
					let newArr = [];
					let msg = res.message;
					if (res.code == 0 && res.data) {
						newArr = res.data.list;
					} else {
						if (this.addonIsExit.presale) {
							this.$util.showToast({ title: msg });
						}
					}
					mescroll.endSuccess(newArr.length);
					//设置列表数据
					if (mescroll.num == 1) this.dataList = []; //如果是第一页需手动制空列表
					this.dataList = this.dataList.concat(newArr); //追加新数据
					if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
				},
				fail() {
					//联网失败的回调
					mescroll.endErr();
					if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
				}
			});
		},
		toDetail(e) {
			this.$util.redirectTo('/promotionpages/presale/detail/detail', {
				id: e.presale_id
			});
		},
		imgError(index) {
			this.dataList[index].goods_image = this.$util.getDefaultImage().default_goods_img;
			this.$forceUpdate();
		},
		goodsImg(imgStr) {
			let imgs = imgStr.split(',');
			return imgs[0] ? this.$util.img(imgs[0], {
				size: 'mid'
			}) : this.$util.getDefaultImage().default_goods_img;
		},
		goodsTag(data) {
			switch (data.recommend_way) {
				case 1:
					return '新品';
					break;
				case 2:
					return '精品';
					break;
				case 3:
					return '推荐';
					break;
				default:
					return '';
			}
		},
		showPrice(data) {
			let price = data.price;
			if (data.member_price && parseFloat(data.member_price) < parseFloat(price)) price = data.member_price;
			return price;
		}
	}
};
</script>

<style lang="scss">
	@import '../public/css/list.scss';
</style>
