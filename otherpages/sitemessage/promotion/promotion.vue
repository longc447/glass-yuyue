<template>
	<view class="site-msg-order">
		<mescroll-uni ref="mescroll" @getData="getSiteMemberSubMessagePromotionList">
			<block slot="list">
				<view class="item-wrap" v-for="(item, index) in promotionList" :key="index" @click.stop="toPromotionDetail(item.message_json)" v-if="promotionList.length > 0">
					<view class="order-item">
						<view class="order-title">{{item.title}}</view>
						
						<view class="order-detail">
							<view class="order-img">
								<image v-if="item.image" :src="$util.img(item.image.split(',')[0])" mode="aspectFill"></image>
								<image v-else :src="$util.img('upload/uniapp/sitemessage/default_img.png')" mode="aspectFill"></image>
							</view>
							<view class="order-content">
								<view class="order-text color-tip font-size-tag">{{item.content}}</view>
							</view>
						</view>
						
						<view class="time">
							<text class="font-size-tag color-tip">{{item.time}}</text>
							<text class="font-size-tag color-tip" @click.stop="getDeleteMemberSubMessage(item.id, item.site_id)">删除</text>
						</view>
					</view>
				</view>
				<view class="empty" v-else>
					<view class="empty_img">
						<image :src="$util.img('upload/uniapp/sitemessage/empty.png')" mode="aspectFit"></image>
					</view>
					<view class="color-tip margin-top margin-bottom">暂无信息</view>
				</view>
			</block>
			<loading-cover ref="loadingCover"></loading-cover>
		</mescroll-uni>
	</view>
</template>

<script>
	import leftSlideOperation from '@/components/left-slide-operation/left-slide-operation.vue';
	export default {
		components: {
			leftSlideOperation
		},
		data() {
			return {
				promotionList: [],
				message: [],
				seed: {},
				id: '',
				site_id: '',
				sub_type: '',
				time: '',
				timeNow: '' //当前时间戳
			}
		},
		onShow() {
			this.getEditallSeed()
		},
		onLoad(param) {
			this.sub_type = param.sub_type
			this.id = param.id
			this.site_id = param.site_id
		},
		onUnload() {
			this.getEditallSeed()
		},
		methods: {
			getSiteMemberSubMessagePromotionList(mescroll) {
				this.$api.sendRequest({
					url: '/sitemessage/api/sitemessage/getSiteMemberSubMessagePromotionList',
					data: {
						page: mescroll.num,
						page_size: mescroll.size
					},
					success: res => {
						let newArr = [];
						let msg = res.message;
						if (res.code == 0) {
							for (var i = 0; i < res.data.list.length; i++) {
								res.data.list[i].sended_time = this.$util.timeStampTurnTime(res.data.list[i].sended_time)
								res.data.list[i].time = this.$util.getSitemessageDate(res.data.list[i].sended_time);
								
								res.data.list[i].message_json = JSON.parse(res.data.list[i].message_json);
								this.message = res.data.list[i].message_json;
								res.data.list[i].del = false;
							}
							
							newArr = res.data.list;
						} else {
							this.$util.showToast({
								title: msg
							});
						}
						mescroll.endSuccess(newArr.length);
						
						this.timeNow = Date.parse(new Date()) / 1000;
						
						//设置列表数据
						if (mescroll.num == 1) this.promotionList = []; //如果是第一页需手动制空列表
						this.promotionList = this.promotionList.concat(newArr); //追加新数据
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
						
						// if (res.code == 0) {
						// 	for (var i = 0; i < res.data.list.length; i++) {
						// 		res.data.list[i].sended_time = this.$util.timeStampTurnTime(res.data.list[i].sended_time)
						// 		res.data.list[i].time = this.$util.getSitemessageDate(res.data.list[i].sended_time);
								
						// 		res.data.list[i].message_json = JSON.parse(res.data.list[i].message_json);
						// 		this.message = res.data.list[i].message_json;
						// 		res.data.list[i].del = false;
						// 	}
						// 	this.promotionList = res.data.list;
						// 	// 获取当前时间
						// 	this.timeNow = Date.parse(new Date()) / 1000;
						// }
					},
					fail: res => {
						mescroll.endErr();
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
					}
				});
			},
			// 删除单条信息
			getDeleteMemberSubMessage(id, site_id) {
				uni.showModal({
					title: '删除',
					content: '请问要删除本条消息吗？',
					success: res => {
						if (res.confirm) {
							this.$api.sendRequest({
								url: '/sitemessage/api/sitemessage/deletemembersubmessage',
								data: {
									id: id,
									site_id: site_id
								},
								success: res => {
									if (res.code == 0) {
										this.deletemembersubmessage = res.data
										this.$refs.mescroll.refresh();
										this.$forceUpdate()
									}
								}
							});
						}
					}
				});
			},
			
			// 消息主表点击已接收
			getSeed(id, site_id) {
				this.$api.sendRequest({
					url: '/sitemessage/api/sitemessage/seed',
					data: {
						id: id,
						site_id: site_id
					},
					success: res => {
						if (res.code == 0) {
							this.seed = res.data
						}
					}
				});
			},
			
			// 全部消息已读
			getEditallSeed() {
				this.$api.sendRequest({
					url: '/sitemessage/api/sitemessage/editallseed',
					data: {
						sub_type: this.sub_type,
						site_id: this.site_id
					},
					success: res => {
						if (res.code == 0) {
							this.editallSeed = res.data
						}
					}
				});
			},
			
			toPromotionDetail(message_json) {
				if (this.timeNow - message_json.start_time > 0 && message_json.end_time - this.timeNow > 0) {
					if (message_json.promotion_type == "groupbuy") {
						this.$util.redirectTo('/promotionpages/groupbuy/detail/detail', {
							groupbuy_id: message_json.promotion_id
						});
					} else if (message_json.promotion_type == "pintuan") {
						this.$util.redirectTo('/promotionpages/pintuan/detail/detail', {
							pintuan_id: message_json.promotion_id
						});
					} else if (message_json.promotion_type == "seckill") {
						this.$util.redirectTo('/promotionpages/seckill/detail/detail', {
							seckill_id: message_json.promotion_id
						});
					} else if (message_json.promotion_type == "bargain") {
						this.$util.redirectTo('/promotionpages/bargain/detail/detail', {
							bargain_id: message_json.promotion_id
						});
					} else if (message_json.promotion_type == "presale") {
						this.$util.redirectTo('/promotionpages/presale/detail/detail', {
							presale_id: message_json.promotion_id
						});
					} else if (message_json.promotion_type == "topics") {
						this.$util.redirectTo('/promotionpages/topics/detail/detail', {
							topics_id: message_json.promotion_id
						});
					} else if (message_json.promotion_type == "discount") {
						this.$util.redirectTo('/pages/goods/detail/detail', {
							sku_id: message_json.goods_id
						});
					}
				}
				
				if (message_json.promotion_type == "bundling") {
					this.$util.redirectTo('/promotionpages/combo/detail/detail', {
						bl_id: message_json.promotion_id
					});
				}
			},
		}
	}
</script>

<style lang="scss">
	.empty {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: $padding;
		box-sizing: border-box;
		justify-content: center;
		padding-top: 80rpx;

		.empty_img {
			width: 63%;
			height: 450rpx;

			image {
				width: 100%;
				height: 100%;
			}
		}
	}

	.item-wrap {
		margin-top: 20rpx;
		padding: 0 30rpx;
	}
	
	.order-item {
		padding: 30rpx;
		background-color: #fff;
		border-radius: $border-radius;
	}
	
	.order-title {
		line-height: 1;
	}
	
	.order-detail {
		margin-top: 20rpx;
		border-radius: $border-radius;
		background-color: #FAFAFA;
		width: 100%;
		height: 120rpx;
		display: flex;
		align-items: center;
	}
	
	.order-img {
		width: 120rpx;
		height: 120rpx;
		border-radius: $border-radius;
		overflow: hidden;
		flex-shrink: 0;
		margin-right: 20rpx;
	}
	
	.order-img image {
		width: 100%;
		height: 100%;
	}
	
	.order-content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		
		view {
			text-overflow: -o-ellipsis-lastline;
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			white-space: normal;
			word-break: break-all;
			line-height: 36rpx;
		}
	}
	
	.time {
		margin-top: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		line-height: 1;
	}
</style>
