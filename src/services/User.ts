import { sha256 } from 'js-sha256'
import { PrismaClient } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'
const prisma = new PrismaClient()

export async function getUserSession(sessionId: string) {
	let session
	try {
		session = await prisma.sessions.findFirst({
			where: {
				session: sessionId
			}
		})
	} catch (err) {
		console.log(err)
	}
	return session
}
async function getUserSessionFromUserName(username: string) {
	const user = await prisma.sessions.findFirst({
		where: {
			login: username
		}
	})
	return user
}
export async function createUserSession(login: string, password: string) {
	const authmeUser = await prisma.authme.findFirst({
		where: {
			username: login
		}
	})
	const array = authmeUser.password.split('$')

	const salt = array[2]

	const hash = sha256(sha256(password) + salt)

	const hashedPassword = array[3]

	if (hashedPassword == hash) {
		const user = await getUserSessionFromUserName(login)
		let session
		if (user) {
			session = await prisma.sessions.update({
				where: {
					id: user.id
				},
				data: {
					session: sha256(Math.random().toString() + hash)
				}
			})
		} else {
			session = await prisma.sessions.create({
				data: {
					login: login,
					session: sha256(Math.random().toString() + hash)
				}
			})
		}
		return session
	}
	return {
		login: 'ERROR',
		session: 'ERROR'
	}
}
export async function increaseVoteCount(sessionID: string) {
	const sessionInfo = await getUserSession(sessionID)
	if (!sessionInfo) return
	await prisma.players.update({
		where: {
			nick: sessionInfo.login
		},
		data: {
			votes: {
				increment: 1
			}
		}
	})
}
export async function getUser(sessionID: string): Promise<User> {
	const sessionInfo = await getUserSession(sessionID)
	if (!sessionInfo) return null
	const player = await prisma.players.findFirst({
		where: {
			nick: sessionInfo.login
		},
		select: {
			nick: true,
			time: true,
			kills: true,
			deaths: true,
			ore: true,
			inviteAmount: true,
			invited: true
		}
	})
	return player as User
}
export async function getPlayer(nick: string) {
	const player = (await prisma.players.findFirst({
		where: {
			nick: nick
		},
		select: {
			nick: true,
			time: true,
			kills: true,
			deaths: true,
			ore: true,
			inviteAmount: true,
			invitedBy: true
		}
	})) as User
	const additionalPlayerInfo = await prisma.authme.findFirst({
		where: {
			username: nick
		}
	})
	const registerDate = additionalPlayerInfo.regdate
	player.registerDate = registerDate.toString()
	return player
}

export async function getTokenFromRequest(request: Request) {
	const token = request.headers['authorization']
	if (!token) return null
	if (token.length != 71) return null
	return token.split('Bearer ').pop()
}

export async function addInvite(
	invitedNick: string,
	inviterNick: string,
	inviteAmount: number
) {
	await prisma.players.update({
		where: {
			nick: invitedNick
		},
		data: {
			invited: true,
			invitedBy: inviterNick
		}
	})
	await prisma.players.update({
		where: {
			nick: inviterNick
		},
		data: {
			inviteAmount: inviteAmount + 1
		}
	})
}
export async function isSameIPForPlayers(player1: string, player2: string) {
	player1 = player1.toLowerCase()
	player2 = player2.toLowerCase()

	const player1Info = await prisma.authme.findFirst({
		where: {
			username: player1
		}
	})
	const player2Info = await prisma.authme.findFirst({
		where: {
			username: player2
		}
	})
	return player1Info.ip === player2Info.ip
}

export async function getTopPlayers(topType) {
	let result = {}
	const selectField = {
		nick: true,
		time: true,
		kills: true,
		deaths: true,
		ore: true,
		inviteAmount: true,
		votes: true
	}
	topType = topType.toLowerCase()
	switch (topType) {
		case 'ore':
			result = await prisma.players.findMany({
				take: 10,
				orderBy: {
					ore: 'desc'
				},
				select: selectField
			})
			break
		case 'kills':
			result = await prisma.players.findMany({
				take: 10,
				orderBy: {
					kills: 'desc'
				},
				select: selectField
			})
			break
		case 'deaths':
			result = await prisma.players.findMany({
				take: 10,
				orderBy: {
					deaths: 'desc'
				},
				select: selectField
			})
			break
		case 'invites':
			result = await prisma.players.findMany({
				take: 10,
				orderBy: {
					inviteAmount: 'desc'
				},
				select: selectField
			})
			break
		case 'time':
			result = await prisma.players.findMany({
				take: 10,
				orderBy: {
					time: 'desc'
				},
				select: selectField
			})
			break
		case 'votes':
			result = await prisma.players.findMany({
				take: 10,
				orderBy: {
					votes: 'desc'
				},
				select: selectField
			})
			break
		default:
			result = {}
			break
	}

	return result
}

export class User {
	@ApiProperty()
	nick: string
	@ApiProperty()
	uid: string
	@ApiProperty()
	time: number
	@ApiProperty()
	kills: number
	@ApiProperty()
	deaths: number
	@ApiProperty()
	ore: number
	@ApiProperty()
	joinTime: number
	@ApiProperty()
	invited: boolean
	@ApiProperty()
	invitedBy: string
	@ApiProperty()
	inviteAmount: number
	@ApiProperty()
	registerDate: string
	@ApiProperty()
	votes: number
}
