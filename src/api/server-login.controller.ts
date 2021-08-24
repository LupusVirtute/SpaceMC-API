import { getTokenFromRequest, getUserSession } from 'src/services/User'
import { Rcon } from 'rcon-client'
import serverConfig from '$config/server'
import { Controller, Get, Req, Res, UseInterceptors } from '@nestjs/common'
import { RateLimiterInterceptor } from 'nestjs-rate-limiter'

@UseInterceptors(RateLimiterInterceptor)
@Controller('/api/server-login')
export class ServerLoginController {
	@Get()
	async processRequest(@Req() request, @Res() response) {
		const token = await getTokenFromRequest(request)
		if (!token) {
			return response.status(401).send('BAD_TOKEN')
		}
		const session = await getUserSession(token)
		if (!session) {
			return response.status(401).send('BAD_TOKEN')
		}

		const login = session.login
		const conn = await Rcon.connect(serverConfig.credentials)
		await conn.send('authme forcelogin' + login)
		conn.end()
		return response.status(200).send('OK')
	}
}
