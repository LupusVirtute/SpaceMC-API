import { Injectable } from '@nestjs/common'
import { NestCrawlerService } from 'nest-crawler'
import fetch from 'node-fetch'
const url =
	'https://lista-serwerow.emecz.pl/votes/server/707cb592-5290-4f48-930e-9061efc945c1'
// let lastNumberOfVotes: number
// const selector =
// 	'div.col-xs-12:nth-child(2) > div:nth-child(1) > div:nth-child(2) > h4:nth-child(1)'

const votedLimit = []
@Injectable()
export class VoteService {
	constructor(private readonly crawler: NestCrawlerService) {}
	async getVotes() {
		return (await fetch(url)).json()
	}
	async didGuyVotedToday(nickname: string) {
		const votes = await this.getVotes()
		const now = new Date(Date.now())
		if (
			votedLimit[nickname] != undefined &&
			now.getDate() === votedLimit[nickname]
		) {
			return VoteResult.VOTE_TIME
		}
		for (const i of votes) {
			const createdAt = new Date(i.createdAt.replace('+02:00', ''))
			if (
				i.nickname === nickname &&
				createdAt.getDate() === now.getDate()
			) {
				votedLimit[nickname] = now.getDate()
				return VoteResult.VOTED_TODAY
			}
		}
		return VoteResult.NO_VOTE
	}
}

export enum VoteResult {
	NO_VOTE = 'BAD_VOTE',
	VOTED_TODAY = 'GOOD_VOTE',
	VOTE_TIME = 'VOTE_TIME'
}
