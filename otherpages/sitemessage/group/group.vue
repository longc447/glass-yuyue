<template>
	<view class="site-msg-order">
		<mescroll-uni ref="mescroll" @getData="getSiteMemberSubMessageGroupList">
			<block slot="list">
				<view class="flex-row-center" v-for="(item, index) in groupList" :key="index" v-if="groupList.length > 0">
					<view class="left-slide-operation-item-view">
						<view class="time"><text>{{item.time}}</text></view>
						
						<!-- 左边滑动可操作的item -->
						<left-slide-operation
							ref="slideRef"
							:index="index"
							:itemData="item"
							:wrapHeight="item.image ? 360 : 150"
							@itemClickCallBack="itemClick"
							@operationCallBack="operationCallBack"
							@itemTouchStart="itemTouchStart"
							@itemTouchEnd="itemTouchEnd"
						>
							<view class="flex-row-center" :style="{'height': item.image ? 360 + 'rpx' : 150 + 'rpx'}" @click.stop="getSeed(item.id, item.site_id)">
								<view class="order-item" @click.stop="toGroup_text(item.event_type, item.link, item.id)">
									<view class="order-img" v-if="item.image != ''">
										<image :src="$util.img(item.image)" mode="aspectFill"></image>
									</view>
									<view class="order-detail">
										<view class="order-title">{{item.title}}</view>
										<view class="order-content">
											<view class="order-text color-tip font-size-tag">{{item.content}}</view>
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
</template>

<script>
	import leftSlideOperation from '@/components/left-slide-operation/left-slide-operation.vue';
	export default {
		components: {
			leftSlideOperation
		},
		data() {
			return {
				groupList: [],
				seed: {},
				id: '',
				site_id: '',
				sub_type: '',
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
			
			getSiteMemberSubMessageGroupList(mescroll) {
				this.$api.sendRequest({
					url: '/sitemessage/api/sitemessage/getSiteMemberSubMessageGroupList.html',
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
						if (mescroll.num == 1) this.groupList = []; //如果是第一页需手动制空列表
						this.groupList = this.groupList.concat(newArr); //追加新数据
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
						
						// if (res.code == 0) {
						// 	for (var i = 0; i < res.data.list.length; i++) {
						// 		res.data.list[i].sended_time = this.$util.timeStampTurnTime(res.data.list[i].sended_time)
						// 		res.data.list[i].time = this.$util.getSitemessageDate(res.data.list[i].sended_time)
						// 		res.data.list[i].sended_time = this.$util.timeStampTurnTime(res.data.list[i].sended_time)
						// 		res.data.list[i].del = false
						// 	}
						// 	this.groupList = res.data.list
						// }
					},
					fail: res => {
						mescroll.endErr();
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
					}
				});
			},
			
			toGroup_text(event_type, link, id) {
				if (event_type == 'text') {
					this.$util.redirectTo('/otherpages/sitemessage/group_detail/group_detail', {
						id
					});
				} else if (event_type == 'link') {
					var obj = {
						wap_url: link,
					};
					this.$util.diyRedirectTo(obj);
				}
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

	.time {
		text-align: center;
		margin: 10rpx 0;
		color: #7e7e7e;
	}

	.promotion-list {
		background-color: #FFFFFF;
		height: 200rpx;
		border-radius: 20rpx;
		margin-bottom: 40rpx;
		padding: 10rpx 25rpx 40rpx;
		margin-top: 70rpx;
	}

	.promotion-img {
		// border-top-right-radius: 20rpx;
		// border-top-left-radius: 20rpx; 
		width: 140rpx !important;
		height: 140rpx;
		// width: 100%; 
		// height: 50%;
	}

	.promotion-img image {
		width: 140rpx !important;
		height: 100%;
	}

	.del-none {
		position: absolute;
		top: -50rpx;
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
			border-radius: $border-radius;
			overflow: hidden;
		}
	}
	
	.order-item {
		
	}
	
	.order-title {
		margin-top: 20rpx;
		margin-bottom: 12rpx;
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
		padding: 0 30rpx;
		width: 100%;
		height: 150rpx;
		box-sizing: border-box;
	}
	
	.order-img {
		width: 100%;
		height: 210rpx;
		flex-shrink: 0;
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
</style>
