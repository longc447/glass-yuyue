<template>
	<view class="apply">
		<block>
			<!-- 导航栏 -->
			<!-- #ifdef H5 -->
			<view class="head-nav color-base-bg"></view>
			<!-- #endif -->
			<view>


				<view class="apply-wrap">
					<view class="app-info">
						<view class="info">
							<view class="info-title">
								<view class="title">RD信息</view>
							</view>
							<view class="apply-item">
								<view class="title">S</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入S值'" v-model="rd_s"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item">
								<view class="title">C</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入C值'" v-model="rd_c"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item">
								<view class="title">Ax</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入Ax值'" v-model="rd_ax"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item">
								<view class="title">P</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入P值'" v-model="rd_p"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item">
								<view class="title">PD</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入PD值'" v-model="rd_pd"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item">
								<view class="title">B</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入B值'" v-model="rd_b"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item">
								<view class="title">V</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入V值'" v-model="rd_v"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item-2">
								<view class="title">备注</view>
								<textarea class="input" type="textarea" maxlength="300" :placeholder="'请输入备注'"
									v-model="rd_remark" />
							</view>

						</view>
					</view>


				</view>

				<view class="apply-wrap">
					<view class="app-info">
						<view class="info">
							<view class="info-title-2">
								<view class="title">LD信息</view>
							</view>
							<view class="apply-item">
								<view class="title">S</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入S值'" v-model="ld_s"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item">
								<view class="title">C</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入C值'" v-model="ld_c"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item">
								<view class="title">Ax</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入Ax值'" v-model="ld_ax"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item">
								<view class="title">P</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入P值'" v-model="ld_p"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item">
								<view class="title">PD</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入PD值'" v-model="ld_pd"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item">
								<view class="title">B</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入B值'" v-model="ld_b"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item">
								<view class="title">V</view>
								<input class="input" type="text" maxlength="30" :placeholder="'请输入V值'" v-model="ld_v"
									placeholder-class="pla-cla" />
							</view>
							<view class="apply-item-2">
								<view class="title">备注</view>
								<textarea class="input" type="textarea" maxlength="300" :placeholder="'请输入备注'"
									v-model="ld_remark" />
							</view>

						</view>
					</view>

					<view class="apply-btn">
						<button @click="formSubmit" class="color-base-bg">保存信息</button>
					</view>
				</view>
			</view>

		</block>

	</view>
</template>
<script>
	export default {
		data() {
			return {
				id:'',
				rd_s: '',
				rd_c: '',
				rd_ax: '',
				rd_p: '',
				rd_pd: '',
				rd_b: '',
				rd_v: '',
				rd_remark: '',
				ld_s: '',
				ld_c: '',
				ld_ax: '',
				ld_p: '',
				ld_pd: '',
				ld_b: '',
				ld_v: '',
				ld_remark: '',
				order_id: '',
				member_id:'',
				user_id:''
			}
		},
		onLoad(e) {
			console.log(e)
			if (e.id) {
				this.order_id = e.id
				this.member_id = e.member_id
				this.user_id = e.user_id
				this.init()
			}

		},
		methods: {
			init() {
				var _this = this
				_this.$api.sendRequest({
					url: '/fenxiao/api/apply/getapplyLog',
					data: {
						order_id: _this.order_id,
					},
					success: res => {
						for (let i in res) {
							this[i] = res[i];
						}
					}
				});
			},

			formSubmit: function(e) {
				var _this = this
				uni.showModal({
					title: '提示',
					content: '确认输入的信息是否正确完整',
					success: function(res) {
						if (res.confirm) {
							_this.$api.sendRequest({
								url: '/fenxiao/api/apply/applyLog',
								data: {
									id: _this.id,
									order_id: _this.order_id,
									rd_s: _this.rd_s,
									rd_c: _this.rd_c,
									rd_ax: _this.rd_ax,
									rd_p: _this.rd_p,
									rd_pd: _this.rd_pd,
									rd_b: _this.rd_b,
									rd_v: _this.rd_v,
									rd_remark: _this.rd_remark,
									ld_s: _this.ld_s,
									ld_c: _this.ld_c,
									ld_ax: _this.ld_ax,
									ld_p: _this.ld_p,
									ld_pd: _this.ld_pd,
									ld_b: _this.ld_b,
									ld_v: _this.ld_v,
									ld_remark: _this.ld_remark,
									user_id: _this.user_id,//用户信息
									member_id: _this.member_id,//技师信息
								},
								success: res => {
									if (res.code == 0) {
										uni.showToast({
											title: '保存成功',
											duration: 2000
										});
										setTimeout(function(){
											uni.navigateBack({
												
											})
										},1000)
										
									} else {
										uni.showToast({
											icon: "error",
											title: '保存失败',
											duration: 2000
										});
									}
								}
							});
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});

			},
			formReset: function(e) {
				console.log('清空数据')
			}
		}
	}
</script>


<style lang="scss">
	.info-title {
		background: #409EFF;
		width: 100%;
		text-align: center;

		.title {
			font-weight: bold;
			color: #FFFFFF;
		}
	}

	.info-title-2 {
		background: #67C23A;
		width: 100%;
		text-align: center;

		.title {
			font-weight: bold;
			color: #FFFFFF;
		}
	}

	.image {
		width: 100%;
	}

	/deep/.uni-scroll-view {
		background-color: #fff;
	}

	/deep/.uni-scroll-view::-webkit-scrollbar {
		/* 隐藏滚动条，但依旧具备可以滚动的功能 */
		display: none;
	}

	.head-nav {
		width: 100%;
		height: var(--status-bar-height);
	}

	.head-nav.active {
		padding-top: 40rpx;
	}

	.head-return {
		height: 90rpx;
		line-height: 90rpx;
		color: #fff;
		font-weight: 600;
		font-size: $font-size-base;
		position: relative;
		text-align: center;

		text {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			left: 20rpx;
			display: inline-block;
			margin-right: 10rpx;
			font-size: 32rpx;
		}
	}

	input::placeholder {
		text-align: right;
	}

	.apply {
		.bg {
			height: 160rpx;
			display: flex;
			justify-content: space-between;
			padding: 30rpx 80rpx 44rpx 80rpx;
			align-items: center;

			.bg-title {
				color: #ffffff;
				font-size: 36rpx;
			}

			.bg-img {
				width: 150rpx;
				height: 150rpx;

				image {
					width: 100%;
					height: 100%;
				}
			}
		}

		.apply-adv {
			width: 100%;
		}

		.apply-wrap {
			margin-top: 50rpx;

			.app-info {
				position: relative;
				top: -28rpx;
				width: 692rpx;
				margin: 0 auto;
				border-radius: 10rpx;
				background-color: #ffffff;

				.info {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;

					.apply-item {
						display: flex;
						align-items: center;
						justify-content: space-between;
						width: calc(100% - 100rpx);
						background-color: #f8f8f8;
						padding: 20rpx 10rpx;
						margin: 4rpx 10rpx;
						background-color: #ffffff;
						border-bottom: 1rpx solid #f1f1f1;

						.title {
							color: #000;
							font-size: 28rpx;
						}

						.input {
							width: 70%;
							text-align: right;
							height: 40rpx;
							padding-left: 30rpx;
							font-size: $font-size-tag;
							color: #a7a7a7;
						}

						.pla-cla {
							color: #babbc1;
						}

						.shuru {
							padding-left: 30rpx;
						}
					}

					.apply-item-2 {
						// display: flex;
						// align-items: center;
						// justify-content: space-between;
						width: calc(100% - 100rpx);
						background-color: #f8f8f8;
						padding: 20rpx 10rpx;
						margin: 4rpx 10rpx;
						background-color: #ffffff;
						border-bottom: 1rpx solid #f1f1f1;

						.title {
							color: #000;
							font-size: 28rpx;
						}

						.input {
							width: 90%;
							height: 120rpx;
							padding-left: 10rpx;
							font-size: $font-size-tag;
							color: #a7a7a7;
						}

						.pla-cla {
							color: #babbc1;
						}

						.shuru {
							padding-left: 30rpx;
						}
					}

					.apply-xy {
						display: flex;
						margin-top: 30rpx;
						color: #838383;
						align-items: center;
						font-size: 26rpx;

						text {
							color: #a7a7a7;
						}

						.iconyuan_checkbox {
							font-size: 36rpx;
							color: #838383;
							margin-right: 14rpx;
							line-height: 1;
						}

						.iconyuan_checked {
							font-size: 36rpx;
							margin-right: 14rpx;
							line-height: 1;
						}
					}
				}
			}

			.apply-btn {
				margin: 50rpx auto 70rpx auto;
				border-radius: 40rpx;
				width: 90%;

				button {
					color: #ffffff;
					width: 100%;
					margin: 0;
				}
			}

			.apply-message-wrap {
				margin-bottom: 100rpx;
				width: 100%;
				padding: 10rpx;
				display: flex;
				justify-content: center;

				.apply-message {
					width: 85%;
					display: flex;
					flex-direction: column;

					.apply-message-title {
						line-height: 1;
						font-size: $font-size-tag;
						position: relative;
						padding-left: $padding;
						box-sizing: border-box;
					}

					.apply-message-title::before {
						content: '';
						display: block;
						position: absolute;
						width: 6rpx;
						height: 100%;
						left: 0;
						top: 0;
						border-radius: 6rpx;
					}

					.apply-message-info {
						padding-top: $padding;
						line-height: 1.2;
						color: $color-tip;
					}
				}
			}
		}

		.again-btn {
			display: flex;
			justify-content: center;
			width: auto;
			border-radius: 40rpx;
			margin-top: 20rpx;
			color: #ffffff;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 10rpx 60rpx;
			box-sizing: border-box;
		}

		.conten-box {
			padding: 0 30rpx;
			box-sizing: border-box;
			height: 812rpx;
			width: 580rpx;
			border-radius: 10rpx;

			text {
				margin-top: 25rpx;
				float: right;
				line-height: 1;
			}

			.title {
				width: 100%;
				font-size: 36rpx;
				font-weight: bold;
				display: flex;
				align-items: center;
				justify-content: center;
				border-bottom: 1px solid #e0e0e0;
				line-height: 1;
				padding-bottom: 28rpx;
			}

			.content-con {
				width: 100%;
				height: 680rpx;
				box-sizing: border-box;
			}

			.con {
				width: 100%;
				height: 100%;
			}

			.sure {
				width: 100%;
				height: 100rpx;
				display: flex;
				justify-content: center;
				align-items: center;

				.sure-btn {
					width: 100%;
					height: 60rpx;
					border-radius: 60rpx;
					color: #ffffff;
					text-align: center;
					line-height: 60rpx;
				}
			}
		}

		.empty {
			width: 100%;
			margin-top: 200rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			image {
				width: 300rpx;
				height: 176rpx;
				margin-bottom: 50rpx;
			}

			text {
				font-size: $font-size-goods-tag;
				font-weight: 600;
			}
		}
	}
</style>

<style>
	/deep/ .uni-popup__wrapper-box {
		border-radius: 20rpx;
	}
</style>
