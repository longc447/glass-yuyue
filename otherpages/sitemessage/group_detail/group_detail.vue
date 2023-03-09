<template>
	<view class="group-detail">
		<u-parse class="richText" :content="info.text"></u-parse>
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
				info:[],
				seed:{},
				id:'',
				site_id:''
			}
		},
		onShow() {
			this.getSiteMessageRecordsInfo()
		},
		onLoad(param) {
			this.id = param.id
			this.site_id = param.site_id
		},
	methods: {
		getSiteMessageRecordsInfo() {
			this.$api.sendRequest({
				url: '/sitemessage/api/sitemessage/getSiteMessageRecordsInfo',
				data:{
					id : this.id
				},
				success: res => {
					if (res.code == 0) {
						this.info = res.data
						this.getSeed(res.data.id,res.data.site_id)
					}
				}
			});
		},
		// 消息主表点击已接收
		getSeed(id,site_id) {
			this.$api.sendRequest({
				url: '/sitemessage/api/sitemessage/seed',
				data: {
					id : id,
					site_id: site_id
				},
				success: res => {
					if (res.code == 0) {
						this.seed = res.data
					}
				}
			});
		},
	},
	}
</script>

<style lang="scss">
	.group-detail {
		padding: 30rpx;
	}
	
	.richText /deep/ image {
		max-width: 100% !important;
	}
	
	rich-text image {
		max-width: 100%;
	}
</style>
