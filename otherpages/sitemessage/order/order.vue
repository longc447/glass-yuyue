<template>
	<view>
		<view class="site-msg-order">
			<mescroll-uni ref="mescroll" @getData="getSiteMemberSubMessageOrderList">
				<block slot="list">
					<view class="flex-row-center" v-for="(item, index) in OrderList" :key="index" v-if="OrderList.length > 0">
						<view class="left-slide-operation-item-view">
							<view class="time"><text>{{item.time}}</text></view>
							
							<!-- 左边滑动可操作的item -->
							<left-slide-operation
								ref="slideRef"
								:index="index"
								:itemData="item"
								:wrapHeight="260"
								@itemClickCallBack="itemClick"
								@operationCallBack="operationCallBack"
								@itemTouchStart="itemTouchStart"
								@itemTouchEnd="itemTouchEnd"
							>
								<view class="flex-row-center" @click.stop="getSeed(item.id, item.site_id)">
									<view class="order-item" @click.stop="toOrderDetail(item.message_json.order_id, item.message_json.order_type)">
										<view class="order-title">{{item.title}}</view>
										<view class="order-detail">
											<view class="order-img">
												<image :src="$util.img(item.image)" mode="aspectFill"></image>
											</view>
											<view class="order-content">
												<view class="order-text color-tip font-size-tag">{{item.content}}</view>
												<view class="view-order color-base-border color-base-text" type="default">查看订单</view>
											</view>
										</view>
									</view>
								</view>
							</left-slide-operation>
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
				OrderList: [],
				seed: {},
				deletemembersubmessage: {},
				id: '',
				site_id: '',
				sub_type: '',
				touchId: '',
				flag: true,
				isAction: false, // 是否操作删除
				startX: '', // 触摸开始位置
				moveClass: '',
				endX: '', // 触摸结束位置
				time: ''
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
			operationCallBack(item) {
				let that = this;
				uni.showModal({
					title: '删除',
					content: '请问要删除本条消息吗？',
					success: res => {
						if (res.confirm) {
							that.getDeleteMemberSubMessage(item.id, item.site_id)
						}
					}
				});
			},
			
			itemTouchStart(item) {
				var index = item.lastSlideIndex;
				if (index < 0) {
					return;
				}
				this.$refs.slideRef[index].init();
			},
			
			itemTouchEnd(item) {
				
			},
			
			itemClick(item) {
				var index = item.lastSlideIndex;
				if (index < 0) {
					return;
				}
				this.$refs.slideRef[index].init();
			},
			
			// 获取订单消息
			getSiteMemberSubMessageOrderList(mescroll) {
				this.$api.sendRequest({
					url: '/sitemessage/api/sitemessage/getSiteMemberSubMessageOrderList',
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
								res.data.list[i].time = this.$util.getSitemessageDate(res.data.list[i].sended_time)
								
								res.data.list[i].message_json = JSON.parse(res.data.list[i].message_json)
								res.data.list[i].del = false
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
						if (mescroll.num == 1) this.OrderList = []; //如果是第一页需手动制空列表
						this.OrderList = this.OrderList.concat(newArr); //追加新数据
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
						
						// if (res.code == 0) {
						// 	for (var i = 0; i < res.data.list.length; i++) {
						// 		res.data.list[i].sended_time = this.$util.timeStampTurnTime(res.data.list[i].sended_time)
						// 		res.data.list[i].time = this.$util.getSitemessageDate(res.data.list[i].sended_time)
								
						// 		res.data.list[i].message_json = JSON.parse(res.data.list[i].message_json)
						// 		res.data.list[i].del = false
						// 	}
						// 	this.OrderList = res.data.list
						// }
					},
					fail: res => {
						mescroll.endErr();
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
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
			
			// 删除单条信息
			getDeleteMemberSubMessage(id, site_id) {
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
			},
			toOrderDetail(order_id, order_type) {
				this.OrderList.is_seed == 1
				// this.$util.redirectTo('/pages/order/detail/detail', {
				// 	order_id
				// });
				switch (order_type) {
					case 2:
						// 自提订单/门店订单
						this.$util.redirectTo('/pages/order/detail_pickup/detail_pickup', {
							order_id
						});
						break;
					case 3:
						// 本地配送订单
						this.$util.redirectTo('/pages/order/detail_local_delivery/detail_local_delivery', {
							order_id
						});
						break;
					case 4:
						// 虚拟订单
						this.$util.redirectTo('/pages/order/detail_virtual/detail_virtual', {
							order_id
						});
						break;
					default:
						this.$util.redirectTo('/pages/order/detail/detail', {
							order_id
						});
						break;
				}
			},
		}
	}
</script>

<style lang="scss">
	.site-msg-order {
		padding: 0 30rpx 70rpx;
	}
	
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
	
	.left-slide-operation-item-view {
		padding: 0 30rpx;
		
		.time {
			width: 100%;
			height: 70rpx;
			line-height: 70rpx;
			text-align: center;
			
			text {
				padding: 8rpx 20rpx;
				border-radius: 4rpx;
				display: inline-block;
				line-height: 1;
				background-color: rgba(0, 0, 0, .2);
				color: #fff;
				font-size: $font-size-tag;
			}
		}
		
		.flex-row-center {
			width: 100%;
			height: 260rpx;
			padding: 30rpx;
			box-sizing: border-box;
			overflow: hidden;
		}
	}

	.order-item {
		
	}

	.order-title {
		margin-bottom: 20rpx;
		line-height: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		text {
			color: red;
			font-size: 36rpx;
			line-height: 28rpx;
		}
	}

	.order-detail {
		display: flex;
		justify-content: space-around;
	}

	.order-img {
		width: 150rpx;
		height: 150rpx;
		margin-right: 20rpx;
		border-radius: $border-radius;
		flex-shrink: 0;
	}

	.order-img image {
		width: 150rpx;
		height: 150rpx;
		border-radius: 10rpx;
	}

	.order-content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.order-text {
		text-overflow: -o-ellipsis-lastline;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		white-space: normal;
		word-break: break-all;
	}

	.view-order {
		border: 1rpx solid;
		width: 160rpx;
		height: 50rpx;
		line-height: 46rpx;
		border-radius: 30rpx;
		box-sizing: border-box;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete {
		position: absolute;
		top: 70rpx;
		right: -120rpx;
		background-color: #31bb6d;
		width: 80rpx;
		height: 150rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.del-none {
		position: absolute;
		top: 20rpx;
		right: 45%;
		border-radius: 10rpx;
		color: #FFFFFF;
		background-color: #000000;
		width: 90rpx;
		height: 50rpx;
		text-align: center;
		z-index: 99;
	}

	.border-arrow {
		width: 0;
		height: 0;
		font-size: 0;
		line-height: 0;
		position: absolute;
		left: 20rpx;
		top: 44rpx;
	}

	.border-arrow em,
	.border-arrow ins {
		width: 0;
		height: 0;
		display: block;
		position: absolute;
		border: 8px solid transparent;
		border-style: solid dashed dashed dashed;
		transform: rotateX(180deg);
	}

	.border-arrow em {
		border-bottom-color: #000000;
	}

	.border-arrow ins {
		border-bottom-color: #000000;
		top: 1px;
	}

	.move-left {
		transform: translateX(-15%);
		-webkit-transform: translateX(-15%);
	}
</style>
