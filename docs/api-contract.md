# Sistem Informasi Manajemen Informatics Learning Center API Contract

## Endpoints

| Method | URL | Functionality | Authentication | Authorization |
| --- | --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Registers a new user account | Not required | Any |
| `POST` | `/api/v1/auth/login` | Logs in a user account | Required | Self |
| `POST` | `/api/v1/auth/logout` | Logs out a user account | Required | Self |
| `POST` | `/api/v1/auth/forgot-password` | Sends an email with a URL to reset password | Not required | Self |
| `POST` | `/api/v1/auth/reset-password` | Resets password of a user account | Required | Self |
| `GET` | `/api/v1/users` | Retrieves all user data | Required | Admin |
| `GET` | `/api/v1/users/{userId}` | Retrieves a user data | Required | Self |
| `POST` | `/api/v1/users` | Creates a new user account | Required | Admin |
| `PATCH` | `/api/v1/users/{userId}` | Updates a user data | Required | Self |
| `DELETE` | `/api/v1/users/{userId}` | Deletes a user account | Required | Self |
| `GET` | `/api/v1/users/{userId}/enrollments` | Retrieves all enrollments | Required | Self |
| `GET` | `/api/v1/users/{userId}/enrollments/{enrollmentId}` | Retrieves an enrollment details | Required | Self |
| `POST` | `/api/v1/users/{userId}/enrollments` | Creates an enrollment/enroll to a program | Required | Self |
| `PATCH` | `/api/v1/users/{userId}/enrollments/{enrollmentId}` | Updates an enrollment | Required | Admin |
| `DELETE` | `/api/v1/users/{userId}/enrollments/{enrollmentId}` | Deletes an enrollment | Required | Admin |
| `GET` | `/api/v1/users/{userId}/certificates` | Retrieves all certificates | Required | Self |
| `GET` | `/api/v1/users/{userId}/certificates/{certificateId}` | Retrieves a certificate details | Required | Self |
| `POST` | `/api/v1/users/{userId}/certificates` | Creates a certificate | Required | Admin |
| `PATCH` | `/api/v1/users/{userId}/certificates/{certificateId}` | Updates a certificate | Required | Admin |
| `DELETE` | `/api/v1/users/{userId}/certificates/{certificateId}` | Deletes a certificate | Required | Admin |
| `GET` | `/api/v1/programs` | Retrieves all programs | Not required | Any |
| `GET` | `/api/v1/programs/{programId}` | Retrieves a program details | Not required | Any |
| `POST` | `/api/v1/programs` | Creates a new program | Required | Admin |
| `PATCH` | `/api/v1/programs/{programId}` | Updates a program | Required | Admin |
| `DELETE` | `/api/v1/programs/{programId}` | Deletes a program | Required | Admin |
| `GET` | `/api/v1/programs/{programId}/modules` | Retrieves all modules | Required | Any |
| `GET` | `/api/v1/programs/{programId}/modules/{moduleId}` | Retrieves a module details | Required | Any |
| `POST` | `/api/v1/programs/{programId}/modules` | Creates a module | Required | Admin |
| `PATCH` | `/api/v1/programs/{programId}/modules/{moduleId}` | Updates a module | Required | Admin |
| `DELETE` | `/api/v1/programs/{programId}/modules/{moduleId}` | Deletes a module | Required | Admin |
| `GET` | `/api/v1/discussions` | Retrieves all discussion forums | Required | Any |
| `GET` | `/api/v1/discussions/{discussionId}` | Retrieves a discussion forum details | Required | Any |
| `POST` | `/api/v1/discussions` | Creates a discussion forum | Required | Admin |
| `PATCH` | `/api/v1/discussions/{discussionId}` | Updates a discussion forum | Required | Admin |
| `DELETE` | `/api/v1/discussions/{discussionId}` | Deletes a discussion forum | Required | Admin |
| `GET` | `/api/v1/discussions/{discussionId}/comments` | Retrieves all comments in a discussion forum | Required | Any |
| `GET` | `/api/v1/discussions/{discussionId}/comments/{commentId}` | Retrieves a comment details | Required | Any |
| `POST` | `/api/v1/discussions/{discussionId}/comments` | Post a comment to a discussion | Required | Any |
| `PATCH` | `/api/v1/discussions/{discussionId}/comments/{commentId}` | Updates a comment | Required | Self |
| `DELETE` | `/api/v1/discussions/{discussionId}/comments/{commentId}` | Deletes a comment | Required | Self |
| `POST` | `/api/v1/discussions/{discussionId}/comments/{commentId}/reply` | Replies to a comment | Required | Any |
| `POST` | `/api/v1/discussions/{discussionId}/comments/{commentId}/like` | Likes a comment | Required | Any |
| `POST` | `/api/v1/discussions/{discussionId}/comments/{commentId}/unlike` | Unlikes a comment | Required | Any |

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
			"password": "Weakpassword321"
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
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
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

- `GET /api/v1/users` - Retrieves all user data

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/users \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved all user data.",
		"data": {
			"users": [
				{
					"id": 1,
					"email": "user1@mail.com",
					"fullName": "Mail Bin Ismail",
					"role": "User"
				},
				{
					"id": 2,
					"email": "user2@mail.com",
					"fullName": "Mei Mei",
					"role": "User"
				},
				{
					"id": 3,
					"email": "admin1@similcuntan.ac.id",
					"fullName": "John Doe",
					"role": "Admin"
				},
				{
					"id": 4,
					"email": "user3@mail.com",
					"fullName": "Ipin",
					"role": "User"
				}
			]
		},
		"pagination": {
			"currentRecords": 4,
			"totalRecords": 40,
			"currentPage": 1,
			"totalPages": 10,
			"nextPage": 2,
			"prevPage": null
		},
		"errors": null
	}
	```

- `GET /api/v1/users/{userId}` - Retrieves a user data

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/users/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved user data.",
		"data": {
			"user": {
				"id": 1,
				"email": "user1@mail.com",
				"fullName": "Mail Bin Ismail",
				"memberLevel": "Basic",
				"role": "User"
			}
		},	
		"errors": null
	}
	```

- `POST /api/v1/users` - Creates a new user account

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/users \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
	    -H "Content-Type: application/json" \
	    -d '{
			"email": "johndoe@mail.com",
			"password": "Weakpassword321",
			"fullName": "John Doe",
			"memberLevel": "Basic",
			"role": "User"
		}'
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully created a new user account.",
		"data": {
			"user": {
				"id": 10,
				"email": "johndoe@mail.com",
				"fullName": "John Doe",
				"memberLevel": "Basic",
				"role": "User"
			}
		},	
		"errors": null
	}
	```

- `PATCH /api/v1/users/{userId}` - Updates a user data

	- Request:

	```bash
	curl -X PATCH http://localhost:3000/api/v1/users/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
	    -H "Content-Type: application/json" \
	    -d '{
			"fullName": "Jack Day",
		}'
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully updated user data.",
		"data": {
			"user": {
				"id": 1,
				"email": "johndoe@mail.com",
				"fullName": "Jack Day",
				"memberLevel": "Basic",
				"role": "User"
			}
		},	
		"errors": null
	}
	```

- `DELETE /api/v1/users/{userId}` - Deletes a user account

	- Request:

	```bash
	curl -X DELETE http://localhost:3000/api/v1/users/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully deleted a user account.",
		"data": null,	
		"errors": null
	}
	```

- `GET /api/v1/users/{userId}/enrollments` - Retrieves all enrollments

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/users/1/enrollments \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved all program enrollments.",
		"data": {
			"enrollments": [
				{
					"id": 1,
					"programId": 3,
					"progressPercentage": 80.00,
					"status": "In Progress"
				},
				{
					"id": 2,
					"programId": 5,
					"progressPercentage": 0.00,
					"status": "In Progress"
				},
				{
					"id": 3,
					"programId": 6,
					"progressPercentage": 100.00,
					"status": "Completed",
					"certificateId": 30
				},
				{
					"id": 4,
					"programId": 7,
					"progressPercentage": 0.00,
					"status": "Unpaid"
				}
			]
		},
		"pagination": {
			"currentRecords": 4,
			"totalRecords": 40,
			"currentPage": 1,
			"totalPages": 10,
			"nextPage": 2,
			"prevPage": null
		},
		"errors": null
	}
	```

- `GET /api/v1/users/{userId}/enrollments/{enrollmentId}` - Retrieves an enrollment details

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/users/1/enrollments/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved program enrollment details.",
		"data": {
			"enrollment": {
				"id": 1,
				"programId": 3,
				"progressPercentage": 80.00,
				"status": "In Progress",
				"completedAt": null
			}
		},
		"errors": null
	}
	```


- `POST /api/v1/users/{userId}/enrollments` - Creates an enrollment/enroll to a program

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/users/1/enrollments \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"programId": 1
		}'
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully enrolled to a program. Please complete the payment to access the contents.",
		"data": {
			"enrollment": {
				"id": 1,
				"programId": 1,
				"progressPercentage": 0.00,
				"status": "Unpaid",
			},
			"invoice": {
				"id": 1,
				"virtualAccountNumber": "1234279807578",
				"amountIDR": 150000.00,
				"paymentDueDatetime": "2025-12-11T23:59:59.999"
			}
		},
		"errors": null
	}
	```

- `PATCH /api/v1/users/{userId}/enrollments/{enrollmentId}` - Updates an enrollment

	- Request:

	```bash
	curl -X PATCH http://localhost:3000/api/v1/users/1/enrollments/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"status": "Completed"
		}'
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully updated program enrollment details.",
		"data": {
			"enrollment": {
				"id": 1,
				"programId": 1,
				"progressPercentage": 0.00,
				"status": "Completed",
				"completedAt": "2025-12-07T23:55:01.002Z"
			}
		},
		"errors": null
	}
	```

- `DELETE /api/v1/users/{userId}/enrollments/{enrollmentId}` - Deletes an enrollment

	- Request:

	```bash
	curl -X DELETE http://localhost:3000/api/v1/users/1/enrollments/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully deleted a program enrollment.",
		"data": null,
		"errors": null
	}
	```

