import { createUserSession } from 'src/services/User'
import { Controller, Post, Req, Res, UseInterceptors } from '@nestjs/common'
import { verify } from 'hcaptcha'
import { RateLimiterInterceptor } from 'nestjs-rate-limiter'

const secret = process.env.HCAPTCHA_SECRET

@UseInterceptors(RateLimiterInterceptor)
@Controller('/api/login')
export class LoginController {
	@Post()
	async loginRequest(@Req() request, @Res() response) {
		// Get Request Data
		const { username, password, captchaKey } = request.body
		const data = await verify(secret, captchaKey)
		if (!data.success) {
			return response.status(401).send('BAD_CAPTCHA_KEY')
		}

		// Check if username and password is valid

		if (!username && !password) {
			// Return invalid if username or password is invalid
			return response.status(401).send('BAD_PASS_OR_NICK')
		}
		const session = await createUserSession(username, password)
		if (session.session === 'ERROR') {
			return response.status(401).send('BAD_PASS')
		}
		const jsonResponse = await JSON.stringify(session)
		// Return response
		return response.status(200).json(jsonResponse)
	}
}
