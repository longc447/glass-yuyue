<template>
	<view class="content">
		<my-issue key="1" @submit="submit" :score="3" />
	</view>
</template>

<script>
	import myIssue from '@/components/myIssue.vue'
	export default {
		components: {
			myIssue
		},
		data() {
			return {
				title: 'Hello',
				id:0
			}
		},
		onLoad(e) {
			console.log(e)
			this.id = e.order
		},
		methods: {
			scoreChange(e) {
				console.log(e)
				
			},
			submit(e){
				let score = e.score
				let textareaValue = e.textareaValue
				
				this.$api.sendRequest({
					url: '/api/yuyue/evluateinfo',
					data: {
						order_id: this.id,
						score,
						textareaValue
					},
					success: res => {
							this.$util.showToast({
								title: '评价成功'
							});
							setTimeout(function(){
								uni.navigateBack({
									
								})
							},1000)
						// let newArr = [];
						// let msg = res.message;
						// if (res.code == 0 && res.data) {
						// 	newArr = res.data.list;
						// } else {
						// 	this.$util.showToast({
						// 		title: msg
						// 	});
						// }
						// //设置列表数据
						// this.list = newArr; //追加新数据
				
					},
					fail: () => {
						//联网失败的回调
					}
				});
			}
		}
	}
</script>

<style>
	.content {
		height: 100%;
	}
</style>
