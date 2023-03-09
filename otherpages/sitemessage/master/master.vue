<template>
	<view class="container">
		<view class="master-seed">
			<view class="all-read" @click="getEditallSeed()">
				<text class="iconfont iconqingchu font-size-tag color-tip"></text>
				<text class="font-size-tag color-tip">全部已读</text>
			</view>
		</view>
		<block v-for="(item, index) in masterLists" :key="index">
			<view class="master-item-wrap" v-if="masterLists.length > 0">
				<view class="master-item-box" :style="[Tactive == index ? leftStyle : '']" @click="toDetail(item.sub_type,item.id,item.site_id)">
					<view class="master-item"
						@touchstart="touchS($event, index, item, item.id)"
						@touchmove="touchMove($event, index, item, item.id)"
						@touchend="touchE($event, index, item, item.id)"
						:class="item.id == touchId ? moveClass : '' "
					>
						<view class="item-icon iconfont"
							@click="toDetail(item.sub_type,item.id,item.site_id)"
							:class="[{'order': item.sub_type == 'order'}, {'servicer': item.sub_type == 'servicer'}, {'delivery': item.sub_type == 'delivery'}, {'group': item.sub_type == 'group'}, {'promotion': item.sub_type == 'promotion'}, {'account': item.sub_type == 'account'}]"
						></view>
						
						<view class="item-detail" >
							<view class="master-detail">
								<text v-if="item.sub_type == 'servicer'">{{item.title}}</text>
								<text v-else-if="item.sub_type == 'account'">{{staticdata.account}}</text>
								<text v-else-if="item.sub_type == 'delivery' ">{{staticdata.delivery}}</text>
								<text v-else-if="item.sub_type == 'group' ">{{staticdata.group}}</text>
								<text v-else-if="item.sub_type == 'order' ">{{staticdata.order}}</text>
								<text v-else-if="item.sub_type == 'promotion' ">{{staticdata.promotion}}</text>
								<text class="time font-size-tag color-tip" v-if="item.send_time != '' ">{{item.time}}</text>
							</view>

							<view class="master-presentation">
								<u-parse v-if="item.sub_type == 'servicer'" class="richText" :content="item.content"></u-parse>
								<text v-else class="font-size-tag color-sub">{{item.content}}</text>
								
								<view v-if="item.remind_num > 0" class="order-unread color-base-bg">{{item.remind_num}}</view>
								<view v-else-if="item.remind_num > 99" class="order-unread color-base-bg">99+</view>
							</view>
						</view>
					</view>
					<view @click.stop="getDeleteMemberMessage(item.id, item.site_id)" class="delete color-base-bg">删除</view>
				</view>
			</view>
			<view class="empty" v-else>
				<view class="empty_img">
					<image :src="$util.img('upload/uniapp/sitemessage/empty.png')" mode="aspectFit"></image>
				</view>
				<view class="color-tip margin-top margin-bottom">暂无信息</view>
			</view>
		</block>
	</view>
</template>

<script>
	import uParse from '@/components/u-parse/u-parse.vue';
	export default {
		components: {
			uParse
		},
		data() {
			return {
				masterLists: [],
				staticdata: {},
				deleteMemberMessage: {},
				recordsSeed: {},
				seed: {},
				touchId: '',
				flag: true,
				moveClass: '',
				statusList: [],
				orderStatus: 0,
				nav_type: 'other',
				time: '',
				
				startX: null, //起始位置
				startM: null,
				startE: null, //结束位置
				left: 0,
				deleteBtn: 120,
				leftStyle: {},
				rightStyle: {},
				Tactive: 0,
				selectIndex: 0,
				isLeftSide: 0
			}
		},
		onShow() {
			this.getSitemessageLists()
			this.getStaticdata()
			this.getOrderStatus()
		},
		methods: {
			getOrderStatus() {
				this.statusList = [{
						status: 0,
						name: '服务号',
						id: 'status_0',
						sub_type: 'other'
					},
					{
						status: 1,
						name: '官方客服',
						id: 'status_0',
						sub_type: 'servicer'
					}
				];
			},
			init() {
				this.leftStyle = {};
				this.rightStyle = {};
			},
			// 手指触摸事件 用于菜单左滑
			touchS(e, index, item, id) {
				this.Tactive = index;
				this.startX = e.touches[0].clientX;
				this.left = 0;
				this.init();
				
				// if (this.selectIndex == index && this.isLeftSide == 1) {
				// 	this.leftStyle = {left: -120 + 'rpx'};
				// } else {
				// 	this.init();
				// }
			},
			touchMove(e, index, item, id) {
				this.startM = e.touches[0].clientX;
				this.left = this.startM - this.startX;
				
				//左滑
				if (this.left < 0 && this.left < this.deleteBtn) {
					if (-this.left >= this.deleteBtn) {
						this.left = -this.deleteBtn;
					}
					
					this.leftStyle = { left: this.left + 'rpx' };
				}
			},
			touchE(e, index, item, id) {
				if (-this.left >= this.deleteBtn) {
					this.left = -120;
					this.leftStyle = { left: this.left + 'rpx' };
					this.isLeftSide = 1;
				}
				
				if (-this.left >= (this.deleteBtn / 2)) {
					this.left = -120;
					this.leftStyle = { left: this.left + 'rpx' };
					this.isLeftSide = 1;
				} else {
					this.leftStyle = { left: 0 + 'rpx' };
					this.isLeftSide = 0;
				}
				
				this.selectIndex = index;
			},
			// 获取列表
			getSitemessageLists() {
				this.$api.sendRequest({
					url: '/sitemessage/api/sitemessage/lists',
					success: res => {
						if (res.code == 0 && res.data) {
							for (var i = 0; i < res.data.list.length; i++) {
								res.data.list[i].send_time = this.$util.timeStampTurnTime(res.data.list[i].send_time)
								res.data.list[i].time = this.$util.getSitemessageDate(res.data.list[i].send_time)
							}
							this.masterLists = res.data.list
						}
					}
				});
			},
			getStaticdata() {
				this.$api.sendRequest({
					url: '/sitemessage/api/sitemessage/staticdata',
					success: res => {
						if (res.code == 0) {
							this.staticdata = res.data.sub_type
						}
					}
				});
			},
			// 删除会员分类消息
			getDeleteMemberMessage(id, site_id) {
				uni.showModal({
					title: '提示',
					content: '确认删除该消息吗',
					success: res => {
						if (res.confirm) {
							this.$api.sendRequest({
								url: '/sitemessage/api/sitemessage/deleteMemberMessage',
								data: {
									id: id,
									site_id: site_id
								},
								success: res => {
									if (res.code == 0) {
										this.deleteMemberMessage = res.data.sub_type
										this.getSitemessageLists()
									}
								}
							});
						}
					}
				});
			},

			// 全部消息已读
			getEditallSeed() {
				let arr = [];
				for (var i = 0; i < this.masterLists.length; i++) {
					arr.push(this.masterLists[i].sub_type)
				}
				this.$api.sendRequest({
					url: '/sitemessage/api/sitemessage/editallseed',
					data: {
						sub_type: arr
					},
					success: res => {
						if (res.code == 0) {
							this.editallSeed = res.data
							this.getSitemessageLists()
						}
					}
				});
			},

			// 跳转
			toDetail(sub_type, id, site_id) {
				if (sub_type == 'servicer') {
					this.$util.redirectTo('/otherpages/chat/room/room', {
						sub_type,
						id,
						site_id
					});
					this.getEditallSeed()
				} else {
					this.$util.redirectTo('/otherpages/sitemessage/' + sub_type + '/' + sub_type, {
						sub_type,
						id,
						site_id
					});
				}
			},
		}
	}
</script>

<style lang="scss">
	.container {
		width: 100%;
		overflow: hidden;
	}
	
	.master-seed {
		height: 60rpx;
		padding: 0 30rpx;
		margin-bottom: 20rpx;
		background-color: #FFFFFF;
		display: flex;
		
		.all-read {
			display: flex;
			align-items: center;
			
			text.iconfont {
				margin-right: 10rpx;
			}
		}
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
	
	.master-item-wrap {
		width: 100%;
		overflow: hidden;
	}
	
	.master-item-box {
		position: relative;
	}

	.master-item {
		position: relative;
		padding: 0 30rpx;
		width: 100%;
		height: 140rpx;
		box-sizing: border-box;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		background-color: #FFFFFF;
	}

	.order-nav {
		width: 100vw;
		height: 90rpx;
		flex-direction: row;
		/* #ifdef H5 */
		// padding-top: 14rpx;
		/* #endif */
		/* #ifndef APP-PLUS */
		white-space: nowrap;
		/* #endif */
		background: #fff;
		display: flex;
		justify-content: space-around;
		// border-bottom-left-radius: 24rpx;
		// border-bottom-right-radius: 24rpx;
		// padding-bottom: 30rpx;
		/* #ifdef H5 */
		// padding-bottom: 20rpx;
		/* #endif */
		// position: fixed;
		left: 0;
		z-index: 998;
	}

	.uni-tab-item-title {
		font-size: $font-size-base;
		display: block;
		height: 86rpx;
		line-height: 90rpx;
		border-bottom: 1px solid #fff;
		padding: 0 10rpx;
		flex-wrap: nowrap;
		/* #ifndef APP-PLUS */
		white-space: nowrap;
		/* #endif */
		text-align: center;
		font-size: 30rpx;
	}

	.uni-tab-item-title-active {
		display: block;
		height: 86rpx;
		border-bottom: 2px solid #f00;
		padding: 0 10rpx;
	}

	.item-icon {
		flex-shrink: 0;
		width: 100rpx;
		height: 100rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 50rpx;
		color: #FFFFFF;
		background-color: #ff405b;
		margin-right: 10rpx;
		border-radius: 50%;
	}

	.order {
		background-color: #3acbe1;
	}

	.servicer {
		background-color: #4091ff;
	}

	.account {
		background-color: #ff882e;
	}

	.delivery {
		background-color: #00ae66;
	}

	.group {
		background-color: red;
	}

	.promotion {
		background-color: #ff405b;
	}

	.promotion::before {
		content: "\e6d3";
	}

	.group::before {
		content: "\e66a";
	}

	.delivery::before {
		content: "\e70f";
	}

	.account::before {
		content: "\e619";
	}

	.order::before {
		content: "\e61c";
	}

	.servicer::before {
		content: "\e686";
	}

	.item-detail {
		padding-left: 10rpx;
		width: calc(100% - 120rpx);
		height: 140rpx;
		font-size: 14px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		border-bottom: 1rpx solid $color-line;
		box-sizing: border-box;
	}

	.master-detail {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.master-presentation {
		display: flex;
		justify-content: space-between;
		align-items: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		
		text:first-child {
			flex: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.order-unread {
		flex-shrink: 0;
		color: #FFFFFF;
		border-radius: 50%;
		background-color: #31bb6d;
		width: 28rpx;
		height: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20rpx;
		margin-left: 30rpx;
	}

	.delete {
		position: absolute;
		top: 0;
		right: -120rpx;
		width: 120rpx;
		height: 140rpx;
		text-align: center;
		line-height: 140rpx;
		color: #fff;
	}

	.move-left {
		transform: translateX(-15%);
		-webkit-transform: translateX(-15%);
	}
	
	.richText {
		width: 100%;
		display: flex;
		align-items: center;
	}
	
	.richText /deep/ image {
		max-width: 40rpx;
		max-height: 40rpx;
	}
	
	rich-text image {
		max-width: 100%;
	}
	
	.richText /deep/ view.p {
		display: flex;
		align-items: center;
	}
	
	.richText /deep/ view {
		display: inline-block;
		font-size: $font-size-tag;
		color: $color-sub;
	}
	
	.richText /deep/ view.text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
