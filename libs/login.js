import axios from 'axios'

export async function requestLogin({ account, message, signature, chain, signKeys, node, localstoragePrefix }) {
	try {
		const { data: rs } = await axios.post(`${node}/api/v1/users`, {
			chain,
			address: account,
			message,
			signature,
			public_key: signKeys.publicKey.replace(/^0x/, '')
		})

		return rs
	} catch (e) {
		console.log(e)
	}
}
