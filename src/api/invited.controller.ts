import {
	getUserSession,
	getTokenFromRequest,
	getUser,
	getPlayer,
	addInvite,
	isSameIPForPlayers
} from 'src/services/User'
import serverConfig from '$config/server'
import { Rcon } from 'rcon-client'
import { Controller, Post, Req, Res, UseInterceptors } from '@nestjs/common'
import { RateLimiterInterceptor } from 'nestjs-rate-limiter'

@UseInterceptors(RateLimiterInterceptor)
@Controller('/api/invited')
export class InvitedController {
	// eslint-disable-next prettier/prettier
	@Post()
	async invite(@Req() request, @Res() response) {
		const token = await getTokenFromRequest(request)
		if (!token) {
			return response.status(400).send('BAD_TOKEN')
		}

		const session = await getUserSession(token)
		const user = await getUser(session.session)

		if (user.invited) {
			return response.status(400).send('ALREADY_INVITED')
		}

		if (!user) {
			return response.status(400).send('BAD_TOKEN')
		}

		const nick = request.body.nick

		if (nick.length > 24) {
			return response.status(400).send('BAD_PLAYER')
		}

		if (nick.toLowerCase() === user.nick.toLowerCase()) {
			return response.status(400).send('SAME_PLAYER')
		}

		const player = await getPlayer(nick)

		if (!player) {
			return response.status(400).send('BAD_PLAYER')
		}
		if (await isSameIPForPlayers(player.nick, user.nick)) {
			return response.status(400).send('SAME_PLAYER')
		}
		if (player.invitedBy === session.login) {
			return response.status(400).send('INVITE_DUO')
		}
		await addInvite(user.nick, player.nick, player.inviteAmount)

		const conn = await Rcon.connect(serverConfig.credentials)
		await conn.send(
			'bc &7Użytkownik &e' +
				user.nick +
				' &7został zaproszony na serwer przez &e ' +
				player.nick
		)
		await conn.send(
			`bc &7Odebrali &e${serverConfig.vip_invite_days} &7i &e${serverConfig.vip_invited_days}&7 dni rangi &eGold&a+`
		)
		await conn.send(
			`lp user ${player.nick} permission settemp group.gold+ true ${serverConfig.vip_invited_days}d accumulate`
		)
		await conn.send(
			`lp user ${user.nick} permission settemp group.gold+ true ${serverConfig.vip_invite_days}d accumulate`
		)
		conn.end()

		return response.status(200).send('OK')
	}
}
