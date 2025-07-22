# Sistem Informasi Manajemen Informatics Learning Center API Contract

## Endpoints

| Method | URL | Functionality | Authentication |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Registers a new user account | FALSE |
| `POST` | `/api/v1/auth/login` | Logs in a user account | TRUE |
| `POST` | `/api/v1/auth/logout` | Logs out a user account | TRUE |
| `POST` | `/api/v1/auth/forgot-password` | Sends an email with a URL to reset password | FALSE |
| `POST` | `/api/v1/auth/reset-password` | Resets password of a user account | TRUE |
| `GET` | `/api/v1/users` | Retrieves all user data | ADMIN |
| `GET` | `/api/v1/users/{userId}` | Retrieves a user data | TRUE |
| `POST` | `/api/v1/users` | Creates a new user account | ADMIN |
| `PATCH` | `/api/v1/users/{userId}` | Updates a user data | TRUE |
| `DELETE` | `/api/v1/users/{userId}` | Deletes a user account | ADMIN |
| `GET` | `/api/v1/programs` | Retrieves all programs | FALSE |
| `GET` | `/api/v1/programs/{programId}` | Retrieves a program details | FALSE |
| `POST` | `/api/v1/programs` | Creates a program | ADMIN |
| `PATCH` | `/api/v1/programs/{programsId}` | Updates a program | ADMIN |
| `DELETE` | `/api/v1/programs/{programsId}` | Deletes a program | ADMIN |
---

## Request/Response Examples

- `POST /api/v1/auth/register` - Registers a new user account

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/auth/register \
	    -H "Content-Type: application/json" \
	    -d '{
			"fullName": "John Doe",
			"email": "johndoe@mail.com",
			"password": "Weakpassword321"
		}'
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully registered a new user account.",
		"data": {
			"user": {
				"id": 1
			},
		},
		"errors": null
	}
	```

- `POST /api/v1/auth/login` - Logs in a user account

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/auth/login \
		-H "Content-Type: application/json" \
		-d '{
			"email": "johndoe@mail.com",
			"password": "Weakpassword123"
		}'
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully logged in.",
		"data": {
			"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzNDU2Nzg5LCJuYW1lIjoiSm9zZXBoIn0.OpOSSw7e485LOP5PrzScxHb7SR6sAOMRckfFwi4rp7o"
		},
		"errors": null
	}
	```

- `POST /api/v1/auth/logout` - Logs out a user account

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/auth/logout \
		-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully logged out.",
		"data": null,
		"errors": null
	}
	```

- `POST /api/v1/auth/forgot-password` - Sends an email with a URL to reset password

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
		-H "Content-Type: application/json" \
		-d '{
			"email": "johndoe@mail.com"
		}'
	```

	- Response (200):

	```json
	{
		"success": true,
	    "statusCode": 200,
	    "message": "Successfully sent password reset link to your email.",
	    "data": {
	        "user": {
	            "email": "johndoe@mail.com"
	        }
	    },
	    "errors": null
	}
	```

- `POST /api/v1/auth/reset-password` - Resets password of a user account

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/auth/reset-password \
		-H "Content-Type: application/json" \
		-d '{
			"token": "704c1ece2588f9a407053d488b2d2df58a8c1843c16c38fd5206a30917a93e6a",
			"newPassword": "newpassword",
			"confirmNewPassword": "newpassword"
		}'
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully reset your password.",
		"data": {
			"user": {
				"email": "johndoe@mail.com"
			}
		},
		"errors": null
	}
	```