<template>
	<view>
		<times @change="getTime" :appointTime="appointTime" :isMultiple="true" :isSection="false" :disableTimeSlot = "disableTimeSlot"></times>
	</view>
</template>

<script>
	import times from '@/components/pretty-times/pretty-times.vue'
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
				}
			}
		},
		methods: {
			getTime(e) {
				console.log(e)
			}
		}
	}
</script>

<style>
</style>
