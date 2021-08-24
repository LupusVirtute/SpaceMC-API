import { HttpService } from '@nestjs/axios'
import { Controller, Get, Injectable, Req, Res, UseInterceptors } from '@nestjs/common'
import { NestCrawlerService } from 'nest-crawler'
import { RateLimiterInterceptor } from 'nestjs-rate-limiter'
import { lastValueFrom, Observable, tap } from 'rxjs'
import { map } from 'rxjs/operators'
@UseInterceptors(RateLimiterInterceptor)
@Injectable()
@Controller('/api/uid')
export class UIDController {
	constructor(private http: HttpService) {}
	@Get('/*')
	async getRequest(@Req() request, @Res() response) {
		const nick = request.params['0']
		const url = 'http://minecraft-api.com/api/uuid/' + nick
		const finalData = await lastValueFrom(
			this.http.get<string>(url).pipe(map((response) => response.data))
		)
		return response.status(200).send(finalData)
	}
}
