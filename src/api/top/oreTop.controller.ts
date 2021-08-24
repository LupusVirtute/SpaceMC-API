import { getTopPlayers } from '$util/User';
import { Controller, Get, UseInterceptors } from '@nestjs/common'
import { RateLimit, RateLimiterInterceptor } from 'nestjs-rate-limiter';
import { OreTopService } from './oreTop.service';

@UseInterceptors(RateLimiterInterceptor)
@Controller('/api/top')
export class OreTop {
	constructor(protected readonly oreService: OreTopService) {}
	@RateLimit({
		keyPrefix: 'top',
		points: 20,
		duration: 20
	})
	@Get('/ore')
	async getOreTop() {
		return await getTopPlayers('ore')
	}
	@RateLimit({
		keyPrefix: 'top',
		points: 20,
		duration: 20
	})
	@Get('/invite')
	async getInviteTop() {
		return await getTopPlayers('invites')
	}
	@RateLimit({
		keyPrefix: 'top',
		points: 20,
		duration: 20
	})
	@Get('/kills')
	async getKills() {
		return await getTopPlayers('kills')
	}
	@RateLimit({
		keyPrefix: 'top',
		points: 20,
		duration: 20
	})
	@Get('/deaths')
	async getDeaths() {
		return await getTopPlayers('deaths')
	}
	@RateLimit({
		keyPrefix: 'top',
		points: 20,
		duration: 20
	})
	@Get('/time')
	async getTime() {
		return await getTopPlayers('time')
	}
	@RateLimit({
		keyPrefix: 'top',
		points: 20,
		duration: 20
	})
	@Get('/votes')
	async getVotes() {
		return await getTopPlayers('votes')
	}
}
