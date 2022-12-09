import Axios from 'axios'
import { setupCache, buildWebStorage } from 'axios-cache-interceptor'
import { v4 as uuidv4 } from 'uuid'
import template from 'lodash.template'
import { createPopper } from '@popperjs/core'

import { hashString, insertStyle } from './libs/common'
import { AUTH_MESSAGE } from './libs/authorize'
import { sign, generateKeyPair, saveToken, clearToken } from './libs/sign_client'
import { requestLogin } from './libs/login'
import {
	defaultOptions,
	AUTO_UPDATE_INTERVAL,
	nodes,
	likeSvg,
	defaultAvatar1,
	defaultAvatar2,
	defaultAvatar3
} from './const'
import style from './style'

const storage = buildWebStorage(sessionStorage, 'echo-reaction-cache:')
const axios = setupCache(Axios, {
	storage,
	generateKey: function({ headers, url }) {
		return hashString(url + (headers.Authorization || ''))
	}
})

const numberFormatter = Intl.NumberFormat('en', { notation: 'compact' })

const requiredParams = [ 'targetUri' ]

function pickAvatar(address) {
	address = address.split('.')[0].split('')
	const lastLetter = address[address.length - 1]
	if (/[0-5]$/.test(lastLetter)) {
		return defaultAvatar1
	} else if (/[6-9a]/.test(lastLetter)) {
		return defaultAvatar2
	} else {
		return defaultAvatar3
	}
}

export default class EchoButton {
	constructor(options = {}) {
		requiredParams.forEach((one) => {
			if (!options[one]) {
				throw new Error(`ECHO: ${one} is required`)
			}
		})
		this.options = Object.assign({}, defaultOptions, options)

		if (nodes[this.options.node]) {
			this.options.node = nodes[this.options.node]
		}

		// @todo get all data in a request and cache them
		this.batchTargetUris = options.batch_target_uris || []

		// each node's data saved in different key
		this.localstoragePrefix = `echo_${hashString(this.options.node)}_`
		this.TOKEN_KEY = `${this.localstoragePrefix}token`
		this.USER_INFO_KEY = `${this.localstoragePrefix}user_info`

		this.hasLogined = false
		this.token = ''
		this.userInfo = {}

		this.isPopoverHover = false

		this.hasLiked = false
		this.likers = []
		this.likingPower = 0
		this.likingCount = 0

		this.init().then(() => {})

		return this
	}

	setUpdateTimer() {
		this.updateTimer = setInterval(() => {
			this.getReaction(0)
		}, AUTO_UPDATE_INTERVAL)
	}

	onVisibilityChange() {
		if (document.hidden) {
			this.updateTimer && clearInterval(this.updateTimer)
		} else {
			this.setUpdateTimer()
		}
	}

	watchPageVisibility() {
		document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this))
	}

	appendMessageEl() {
		const id = 'echo-message'
		let $message = document.querySelector(`#${id}`)
		if (!$message) {
			$message = document.createElement('div')
			$message.id = id
			document.body.appendChild($message)
		}
		this.$message = $message
	}

	appendLoadingEl() {
		const id = 'echo-loading'
		let $loadingMessage = document.querySelector(`#${id}`)
		if (!$loadingMessage) {
			$loadingMessage = document.createElement('div')
			$loadingMessage.id = id
			document.body.appendChild($loadingMessage)
		}
		$loadingMessage.innerHTML = '<div class="echo-loading__loader"></div>'
		this.$loadingMessage = $loadingMessage
	}

	showMessage(type, text) {
		this.$message.className = ''
		this.$message.classList.add(`echo-${type}`)
		this.$message.innerHTML = text
		this.$message.style.display = 'block'
		setTimeout(() => {
			this.$message.style.display = 'none'
		}, 1500)
	}

	showPopover() {
		this.hidePopoverTimeout && clearTimeout(this.hidePopoverTimeout)
		this.$popover.setAttribute('data-show', '')
		this.popper.update()
	}

	hidePopover(from) {
		if (from === 'popover') {
			this.isPopoverHover = false
		}
		this.hidePopoverTimeout = setTimeout(() => {
			if (this.isPopoverHover) {
				return
			}
			this.$popover.removeAttribute('data-show')
		}, 200)
	}

	async init() {
		insertStyle(style(this.options), 'echo-popover-style')

		this.getPopoverTemplate()
		this.createPopover()
		this.loadUserInfo()
		this.appendMessageEl()
		this.appendLoadingEl()
		this.event()
		this.setUpdateTimer()
	}

	event() {
		document.body.addEventListener('logout', () => {
			this.logout(true)
			this.showMessage('success', 'Logout successfully!')
		})

		document.body.addEventListener('login', () => {
			this.loadUserInfo()
			this.setLogined(true)
		})
	}

	getCommonHeader() {
		return {
			Authorization: `Bearer ${this.token}`
		}
	}

	getPopoverTemplate() {
		this.compilePopoverTemplate = template(
			`
    <div>
      <ul class="echo-popover__liker-list"></ul>
      
      <div
        class="echo-popover__power"
        title="Estimated Total Value of all Liking Address">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#FFAA02"><path fill="none" d="M0 0h24v24H0z"/><path d="M13 10h7l-9 13v-9H4l9-13z"/></svg>
        <span class="echo-popover__power-label">Liking Power: </span>
        <span class="echo-popover__power-value">$0</span>
      </div>

      <div class="echo-popover__bottom">
        <div class="echo-popover__partner">
          <a class="echo-popover__homelink" href="https://0xecho.com" targer="_blank">
						ECHO
					</a>
          ${this.options.partnerName ? '<span> x ' + this.options.partnerName + '</span>' : ''}
        </div>
        
        <div class="echo-popover__connect" title="Connect Wallet">
          Connect Wallet
        </div>
        
        <div class="echo-popover__logout" title="Logout">
          <span class="echo-popover__login-info"></span>
          <svg class="echo-popover__logout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="#929AB2"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2a9.985 9.985 0 0 1 8 4h-2.71a8 8 0 1 0 .001 12h2.71A9.985 9.985 0 0 1 12 22zm7-6v-3h-8v-2h8V8l5 4-5 4z"/></svg>
        </div>
      </div>

      <div class="echo-popover__arrow" data-popper-arrow></div>
    </div> 

   `,
			{
				interpolate: /{{([\s\S]+?)}}/g
			}
		)
	}

	setLogined(from) {
		this.hasLogined = true
		window.__ECHO_HAS_LOGINED = true

		this.updateUserInfo()

		this.$logout.style.display = 'flex'
		this.$connectEl.style.display = 'none'

		// re-fetch reactions
		this.getReaction(0, () => {
			if (from === 'AFTER-LOGIN' && !this.hasLiked) {
				this.handleClick()
			}
		})
	}

	logout(fromEvent = false) {
		this.hasLogined = false
		window.__ECHO_HAS_LOGINED = false

		this.userInfo = {}
		localStorage.setItem(this.USER_INFO_KEY, '')
		localStorage.setItem(this.TOKEN_KEY, '')

		this.$logout.style.display = 'none'
		this.$connectEl.style.display = 'inline'

		this.updateUserInfo()
		this.setHasNotLiked()
	}

	createPopover() {
		const div = document.createElement('div')
		div.className = 'echo-popover'
		div.innerHTML = this.compilePopoverTemplate({})
		document.body.appendChild(div)

		this.$popover = div
		this.$logout = this.$popover.querySelector('.echo-popover__logout')
		this.$connectEl = this.$popover.querySelector('.echo-popover__connect')

		if (!this.options.alwaysShowPopover) {
			const showEvents = [ 'mouseenter', 'focus' ]
			const hideEvents = [ 'mouseleave', 'blur' ]

			showEvents.forEach((event) => {
				div.addEventListener(event, () => {
					this.hidePopoverTimeout && clearTimeout(this.hidePopoverTimeout)
					this.isPopoverHover = true
				})
			})

			hideEvents.forEach((event) => {
				div.addEventListener(event, this.hidePopover.bind(this, 'popover'))
			})
		} else {
			this.$popover.style.display = 'block'
		}

		this.$logout.addEventListener('click', () => {
			this.logout()
			const event = new Event('logout')
			document.body.dispatchEvent(event)
		})

		this.$connectEl.addEventListener('click', this.connectWallet.bind(this, 'JUST-LOGIN'))
	}

	mount(el) {
		if (!el) {
			throw new Error('Mount element not found')
		}
		if (typeof el === 'string') {
			el = document.querySelector(el)
			if (!el) {
				throw new Error('Mount element not found')
			}
		}

		el.innerHTML = `<div class="echo-like">
			${likeSvg.replace(/{{size}}/g, this.options.buttonSize).replace('<svg ', `<svg class="echo-like__icon"`)}
      <span class="echo-like__count" style="display:none"></span>
    </div>`
		this.$el = el
		this.$echo = this.$el.querySelector('.echo-like')
		this.$el.addEventListener('click', this.handleClick.bind(this))

		this.popper = createPopper(this.$echo, this.$popover, {
			placement: 'top',
			modifiers: [
				{
					name: 'offset',
					options: {
						offset: [ 0, 10 ]
					}
				},
				...(this.options.popoverAutoFlip
					? []
					: [
							{
								name: 'flip',
								options: {
									fallbackPlacements: ['bottom', 'left', 'right']
								}
							}
						])
			]
		})

		const showEvents = [ 'mouseenter', 'focus' ]
		const hideEvents = [ 'mouseleave', 'blur' ]

		showEvents.forEach((event) => {
			this.$echo.addEventListener(event, this.showPopover.bind(this))
		})

		hideEvents.forEach((event) => {
			this.$echo.addEventListener(event, this.hidePopover.bind(this))
		})

		if (this.options.theme === 'dark') {
			this.$el.classList.add('echo-theme-dark')
			this.$popover.classList.add('echo-theme-dark')
		}

		this.getReaction()

		return this
	}

	getReaction(ttl = 0, callback) {
		this.reactionAPI = `${this.options.node}/api/v1/reactions?target_uri=${encodeURIComponent(
			this.options.targetUri
		)}&page=1&sub_type=like`

		const cacheKey = 'echo-reaction-cache:' + hashString(this.reactionAPI + this.getCommonHeader().Authorization)
		if (ttl <= 0) {
			axios.storage.remove(cacheKey)
		}
		axios
			.get(this.reactionAPI, {
				headers: this.getCommonHeader(),
				cache: {
					ttl
				}
			})
			.then((res) => {
				if (res.data.data.target_summary.has_liked) {
					this.setHasLiked()
				}

				const likeCounts = res.data.data.target_summary.like_counts

				this.likingCount = likeCounts
				this.likingPower = res.data.data.target_summary.like_power

				this.likers = res.data.data.list.map((one) => {
					if (!one.author.avatar) {
						one.author.avatar = pickAvatar(one.author.address)
					}
					return one
				})

				// if element has been destroyed
				if (!this.$popover) {
					return
				}

				this.$popover.querySelector('.echo-popover__power-value').innerHTML =
					'$' + this.formatNumber(res.data.data.target_summary.like_power)

				if (this.likers.length) {
					let likersHTML = template(`<% likers.forEach(function(liker) { %>
					<li class="echo-popover__liker-item">
						<img
							class="echo-popover__liker-image"
							alt="<%- liker.author.dotbit || liker.author.ens || liker.author.address %>"
							title="<%- liker.author.dotbit || liker.author.ens || liker.author.address %>"
							width="16"
							src="<%- liker.author.avatar %>">
					</li>
					<% }); %>`)(
						{
							likers: this.likers.slice(0, this.options.maxDisplayLikers)
						},
						{
							interpolate: /{{([\s\S]+?)}}/g
						}
					)

					if (likeCounts > this.options.maxDisplayLikers) {
						const left = likeCounts - this.options.maxDisplayLikers
						likersHTML += `<li class="echo-popover__liker-more">+${left}</li>`
					}

					this.$popover.querySelector('.echo-popover__liker-list').innerHTML = likersHTML
					this.$popover.querySelector('.echo-popover__liker-list').style.display = 'flex'
				} else {
					this.$popover.querySelector('.echo-popover__liker-list').style.display = 'none'
				}

				this.updateCount()

				if (callback) {
					callback()
				}
			})
			.catch((e) => {
				console.log(e)
			})
	}

	setHasLiked() {
		this.hasLiked = true
		this.$el.className += ' echo-has-liked'
	}

	setHasNotLiked() {
		if (this.$el) {
			this.$el.classList.remove('echo-has-liked')
		}
		this.hasLiked = false
	}

	processName(name) {
		if (!/\.bit|\.eth/.test(name)) {
			const length = name.length
			return /^0x/.test(name) ? '0x...' + name.slice(length - 4) : name.slice(length - 4)
		}
		return name
	}

	updateUserInfo() {
		const $el = this.$popover.querySelector('.echo-popover__login-info')
		$el.innerHTML = `${this.processName(this.userInfo.dotbit || this.userInfo.ens || this.userInfo.address || '')} `
	}

	loadUserInfo() {
		try {
			const token = localStorage.getItem(this.TOKEN_KEY)
			const userInfo = localStorage.getItem(this.USER_INFO_KEY)
			if (token && userInfo) {
				this.token = token
				this.userInfo = JSON.parse(userInfo)
				this.setLogined()
			} else {
				this.logout()
			}
		} catch (e) {
			console.log(e)
			this.logout()
		}
	}

	async connectWallet(from) {
		const getAuthMessage = (chain, address) => {
			const signKeys = generateKeyPair(this.localstoragePrefix)
			return {
				message: AUTH_MESSAGE.replace('ADDRESS', `${chain}/${address}`)
					.replace('TIMESTAMP', new Date().getTime())
					.replace('PUBLIC_KEY', signKeys.publicKey.replace(/^0x/, '')),
				signKeys
			}
		}

		if (window.ethereum) {
			this.$loadingMessage.style.display = 'block'
			try {
				let accounts = []

				try {
					const fullAccounts = await ethereum.request({
						method: 'wallet_requestPermissions',
						params: [ { eth_accounts: {} } ]
					})
					accounts = fullAccounts[0].caveats[0].value
				} catch (e) {
					// reject
					if (e.code === 4001) {
					} else {
						if (!accounts.length) {
							accounts = await ethereum.request({ method: 'eth_accounts' })
						}
					}
				}

				if (!accounts.length) {
					this.$loadingMessage.style.display = 'none'
					return
				}

				const account = accounts[0]
				const { message, signKeys } = getAuthMessage('EVM', accounts[0])
				try {
					const signature = await window.ethereum.request({
						method: 'personal_sign',
						params: [ message, account ]
					})
					const res = await requestLogin({
						account,
						message,
						signature,
						chain: 'EVM',
						signKeys,
						node: this.options.node,
						localstoragePrefix: this.localstoragePrefix
					})

					if (res.data && res.data.address) {
						this.showMessage('success', 'Login successfully!')
						this.token = res.data.token
						this.userInfo = res.data
						delete this.userInfo.token

						localStorage.setItem(this.TOKEN_KEY, this.token)
						localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(this.userInfo))
						this.setLogined(from || 'AFTER-LOGIN')

						const event = new Event('login')
						document.body.dispatchEvent(event)
					}
				} catch (e) {
					console.log(e)
					this.$loadingMessage.style.display = 'none'
				}
			} catch (e) {
			} finally {
				this.$loadingMessage.style.display = 'none'
			}
		} else {
			this.showMessage('error', 'Please install MetaMask first')
		}
	}

	updateCount() {
		const type = this.options.numberType
		let count = 0
		if (type === 'count') {
			count = this.likingCount
		} else if (type === 'power') {
			count = this.likingPower
		}

		if (count === 0) {
			this.$el.querySelector('.echo-like__count').style.display = 'none'
		} else {
			this.$el.querySelector('.echo-like__count').style.display = 'inline'
		}
		this.$el.querySelector('.echo-like__count').innerHTML =
			count === 0 ? '' : this.formatNumber(count, type === 'power' ? '$' : '')
	}

	async handleClick(e) {
		if (!this.hasLogined) {
			if (window.__ECHO_HAS_LOGINED) {
				this.loadUserInfo()
			} else {
				this.connectWallet()
				return
			}
		}

		const body = {
			type: 'reaction',
			sub_type: this.hasLiked ? '-like' : 'like',
			target_uri: this.options.targetUri,
			protocol_version: '0.1',
			id: uuidv4(),
			from_uri: this.options.from_uri || null
		}

		const signed = sign(body, this.localstoragePrefix)

		body.public_key = signed.publicKey
		body.signature = signed.signature

		try {
			const rs = await axios.post(`${this.options.node}/api/v1/posts`, body, {
				headers: this.getCommonHeader()
			})
			if (this.hasLiked) {
				this.setHasNotLiked()
			} else {
				this.setHasLiked()
			}
			this.getReaction(0)
		} catch (e) {
			console.log(e)
			if (e.response && e.response.data && e.response.data.msg) {
				this.showMessage('error', e.response.data.msg)
			} else {
				this.showMessage('error', 'Sorry. Something wrong happens.')
			}
		}
	}

	formatNumber(number, symbol = '') {
		return symbol + '' + numberFormatter.format(number)
	}

	destroy() {
		this.popper && this.popper.destroy()

		this.updateTimer && clearInterval(this.updateTimer)
		document.removeEventListener('visibilitychange', this.onVisibilityChange.bind(this))

		this.$popover = null
		this.$el = null
		this.$logout = null
		this.$message = null
	}
}
