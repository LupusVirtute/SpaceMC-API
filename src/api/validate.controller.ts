import { getTokenFromRequest, getUserSession } from 'src/services/User'
import { Controller, Get, Post, Req, Res, UseInterceptors } from '@nestjs/common'
import { RateLimit, RateLimiterInterceptor } from 'nestjs-rate-limiter'
@UseInterceptors(RateLimiterInterceptor)
@Controller('/api/validate')
export class ValidateController {
	constructor() {}
	@Post()
	async validate(@Req() request, @Res() response) {
		const authorization = await getTokenFromRequest(request)
		if (!authorization) {
			return response.status(401).send('BAD_TOKEN')
		}
		try {
			const userAuth = await getUserSession(authorization)
			const authResponse = (
				userAuth != null || userAuth != undefined
			).toString()
			return response.status(200).send(authResponse)
		} catch (err) {
			return response.status(200).send('false')
		}
	}
}
