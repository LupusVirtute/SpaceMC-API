import { Module } from '@nestjs/common'
import { UserController } from './api/user.controller'
import { VoteController } from './api/vote/vote.controller'
import { NestCrawlerModule } from 'nest-crawler'
import { UIDController } from './api/uid/UID.controller'
import { HttpModule } from '@nestjs/axios'
import { InvitedController } from './api/invited.controller'
import { LoginController } from './api/login.controller'
import { ValidateController } from './api/validate.controller'
import { ServerLoginController } from './api/server-login.controller'
import { VoteService } from './api/vote/vote.service'
import { OreTopService } from './api/top/oreTop.service'
import { OreTop } from './api/top/oreTop.controller'
import { RateLimiterInterceptor, RateLimiterModule } from 'nestjs-rate-limiter'
import { APP_INTERCEPTOR } from '@nestjs/core'


@Module({
	imports: [NestCrawlerModule, HttpModule, RateLimiterModule],
	controllers: [
		UserController,
		VoteController,
		InvitedController,
		LoginController,
		ValidateController,
		ServerLoginController,
		UIDController,
		OreTop
	],
	providers: [
		VoteService,
		OreTopService,
		{
			provide: APP_INTERCEPTOR,
			useClass: RateLimiterInterceptor
		}
	]
})
export class AppModule {}
