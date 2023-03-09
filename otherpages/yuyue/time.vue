<template>
	<view>
		<times @change="getTime" :appointTime="appointTime" :isMultiple="false" :isSection="false"
			:disableTimeSlot="disableTimeSlot"></times>
	</view>
</template>

<script>
	import times from '@/components/pretty-times/pretty-times.vue'
	import globalConfig from '@/common/js/golbalConfig.js';
	export default {
		components: {
			times
		},
		data() {
			return {
				appointTime: ["2021-11-16 15:30:00"],
				disableTimeSlot: {
					begin_time: "2021-11-17 11:00:00",
					end_time: "2021-11-17 16:00:00"
				},
				data: ''
			}
		},
		mixins: [globalConfig],
		onLoad(e) {
			console.log(JSON.parse(decodeURIComponent(e.sn)))
			this.data = JSON.parse(decodeURIComponent(e.sn))
		},
		methods: {
			getTime(e) {
				var that = this
				var time = new Date(e)
				this.data['time'] = e
				console.log(this.data)

				this.$api.sendRequest({
					url: '/api/yuyue/save',
					data: this.data,
					success: res => {
						this.$util.showToast({
							title: '预约成功！'
						});
						setTimeout(function() {
							that.$util.redirectTo('/otherpages/yuyue/yuyue')
						}, 1000);
					}
				});
			}
		}
	}
</script>

<style>
</style>
