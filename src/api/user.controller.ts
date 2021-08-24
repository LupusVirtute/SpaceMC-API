import { getPlayer, getTokenFromRequest, getUser } from 'src/services/User'
import {
	Controller,
	Get,
	Req,
	Request,
	Res,
	UseInterceptors
} from '@nestjs/common'
import { RateLimiterInterceptor } from 'nestjs-rate-limiter'

@UseInterceptors(RateLimiterInterceptor)
@Controller('/api/user')
export class UserController {
	@Get()
	async userRequest(
		@Req() request: Request,
		@Res() response
	): Promise<object> {
		const sessionId = await getTokenFromRequest(request)

		if (!sessionId || sessionId.length < 63) return response.status(400)
		const user = await getUser(sessionId)
		return response.status(200).send({
			user: user
		})
	}
	@Get('/*')
	async playerRequest(@Req() request, @Res() response) {
		const user = request.params['0']
		const player = await getPlayer(user)
		return response.status(200).json(player)
	}
}
