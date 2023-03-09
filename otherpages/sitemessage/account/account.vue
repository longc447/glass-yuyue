<template>
	<view class="site-msg-order">
		
		
		<mescroll-uni ref="mescroll" @getData="getSiteMemberSubMessageAccountList">
			<block slot="list">
				<view class="flex-row-center" v-for="(item, index) in AccountList" :key="index" v-if="AccountList.length > 0">
					<view class="left-slide-operation-item-view">
						<view class="time"><text>{{item.time}}</text></view>
						
						<!-- 左边滑动可操作的item -->
						<left-slide-operation
							ref="slideRef"
							:index="index"
							:itemData="item"
							:wrapHeight="130"
							@itemClickCallBack="itemClick"
							@operationCallBack="operationCallBack"
							@itemTouchStart="itemTouchStart"
							@itemTouchEnd="itemTouchEnd"
						>
							<view class="flex-row-center" @click="getSeed(item.id, item.site_id)">
								<view class="order-item">
									<view class="order-title">{{item.title}}</view>
									<view class="order-content">
										<view class="order-text color-tip font-size-tag">{{item.content}}</view>
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
</template>

<script>
	import leftSlideOperation from '@/components/left-slide-operation/left-slide-operation.vue';
	export default {
		components: {
			leftSlideOperation
		},
		data() {
			return {
				AccountList: [],
				seed: {},
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
			
			getSiteMemberSubMessageAccountList(mescroll) {
				this.$api.sendRequest({
					url: '/sitemessage/api/sitemessage/getSiteMemberSubMessageAccountList',
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
						if (mescroll.num == 1) this.AccountList = []; //如果是第一页需手动制空列表
						this.AccountList = this.AccountList.concat(newArr); //追加新数据
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
						
						// if (res.code == 0) {
						// 	for (var i = 0; i < res.data.list.length; i++) {
						// 		res.data.list[i].sended_time = this.$util.timeStampTurnTime(res.data.list[i].sended_time)
						// 		res.data.list[i].time = this.$util.getSitemessageDate(res.data.list[i].sended_time)
						// 		res.data.list[i].del = false
						// 	}
						// 	this.AccountList = res.data.list
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
			
			toAccountDetail(id) {
				this.$util.redirectTo("/otherpages/sitemessage/account_detail/account_detail", {id: id});
			}
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

	.main {
		padding: 50rpx 40rpx;
	}

	.account-item {
		margin-bottom: 20rpx;
	}

	.account-time {
		text-align: center;
		margin-bottom: 20rpx;
		color: #7e7e7e;
	}

	.account-box {
		background-color: #FFFFFF;
		border-radius: 10rpx;
		padding: 20rpx;
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
	
	.site-msg-order {
		padding: 0 30rpx 70rpx;
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
			height: 130rpx;
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
	}
	
	.order-content {
		display: flex;
		align-items: center;
		
		view {
			line-height: 1;
			max-width: calc(100% - 32rpx);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		
		text {
			line-height: 1;
			display: inline-block;
			width: 16rpx;
		}
	}
</style>
