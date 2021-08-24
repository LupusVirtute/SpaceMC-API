import { getUserSession, getTokenFromRequest, increaseVoteCount } from 'src/services/User'
import { Rcon } from 'rcon-client'
import serverConfig from '$config/server'
import {
	Controller,
	Get,
	Injectable,
	Post,
	Req,
	Request,
	UseInterceptors
} from '@nestjs/common'
import { VoteService, VoteResult } from './vote.service'
import { RateLimit, RateLimiterInterceptor } from 'nestjs-rate-limiter'
@UseInterceptors(RateLimiterInterceptor)
@Controller('/api/vote')
export class VoteController {
	constructor(private readonly voteService: VoteService) {}
	@Post()
	async processRequest(@Req() request: Request): Promise<string> {
		const token = await getTokenFromRequest(request)
		if (!token) {
			return 'BAD_TOKEN'
		}
		const session = await getUserSession(token)
		if (!session) {
			return 'BAD_TOKEN'
		}

		const didGuyVoted = await this.voteService.didGuyVotedToday(
			session.login
		)
		if (
			didGuyVoted == VoteResult.NO_VOTE ||
			VoteResult.VOTE_TIME == didGuyVoted
		) {
			return didGuyVoted
		}
		await increaseVoteCount(token)
		const conn = await Rcon.connect(serverConfig.credentials)
		await conn.send(
			'bc &b' +
				session.login +
				' &7Oddał głos na spacemc i otrzymał rangę &eGold&a+!'
		)
		await conn.send(
			'lp user ' +
				session.login +
				' permission settemp group.gold+ true 1d accumulate'
		)
		conn.end()

		return 'GOOD_VOTE'
	}
}
