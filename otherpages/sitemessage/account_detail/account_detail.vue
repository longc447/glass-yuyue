<template>
	<view class="account-detail">
		<view class="title">{{account_info.title}}</view>
		<view class="con font-size-tag color-tip">{{account_info.content}}</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				account_id: 0,
				account_info: {}
			}
		},
		onShow() {
			this.getSiteMemberSubMessageAccountList()
		},
		onLoad(param) {
			this.account_id = param.id
		},
		methods: {
			getSiteMemberSubMessageAccountList() {
				this.$api.sendRequest({
					url: '/sitemessage/api/sitemessage/getSiteMemberSubMessageAccountList',
					success: res => {
						if (res.code == 0) {
							let arr = res.data.list;
							
							for (let i = 0; i < arr.length; i++) {
								if (arr[i].id == this.account_id) {
									this.account_info = arr[i];
								}
							}
						}
					}
				});
			},
		}
	}
</script>

<style lang="scss">
	.account-detail {
		padding: 30rpx;
		
		.title {
			text-align: center;
			line-height: 2;
		}
		
		.con {
			line-height: 2;
		}
	}
</style>
