# Sistem Informasi Manajemen Informatics Learning Center API Contract

## Endpoints

| Method   | URL                                                              | Functionality                                | Authentication | Authorization |
| -------- | ---------------------------------------------------------------- | -------------------------------------------- | -------------- | ------------- |
| `POST`   | `/api/v1/auth/register`                                          | Registers a new user account                 | Not required   | Any           |
| `POST`   | `/api/v1/auth/login`                                             | Logs in a user account                       | Required       | Self          |
| `POST`   | `/api/v1/auth/logout`                                            | Logs out a user account                      | Required       | Self          |
| `POST`   | `/api/v1/auth/forgot-password`                                   | Sends an email with a URL to reset password  | Not required   | Self          |
| `POST`   | `/api/v1/auth/reset-password`                                    | Resets password of a user account            | Required       | Self          |
| `GET`    | `/api/v1/users`                                                  | Retrieves all user data                      | Required       | Admin         |
| `GET`    | `/api/v1/users/{userId}`                                         | Retrieves a user data                        | Required       | Self          |
| `PATCH`  | `/api/v1/users/{userId}`                                         | Updates a user data                          | Required       | Self          |
| `DELETE` | `/api/v1/users/{userId}`                                         | Deletes a user account                       | Required       | Self          |
| `POST`   | `/api/v1/users/{userId}/picture`                                 | Uploads a profile picture                    | Required       | Self          |
| `GET`    | `/api/v1/enrollments`                                            | Retrieves all enrollments                    | Required       | Self          |
| `GET`    | `/api/v1/enrollments/{enrollmentId}`                             | Retrieves an enrollment details              | Required       | Self          |
| `POST`   | `/api/v1/enrollments`                                            | Creates an enrollment/enroll to a program    | Required       | Self          |
| `PATCH`  | `/api/v1/enrollments/{enrollmentId}`                             | Updates an enrollment                        | Required       | Self          |
| `DELETE` | `/api/v1/enrollments/{enrollmentId}`                             | Deletes an enrollment                        | Required       | Admin         |
| `POST`   | `/api/v1/enrollments/{enrollmentId}/completed-modules`           | Mark a module as completed                   | Required       | Self          |
| `GET`    | `/api/v1/certificates`                                           | Retrieves all certificates                   | Required       | Self          |
| `GET`    | `/api/v1/certificates/{certificateId}`                           | Retrieves a certificate details              | Required       | Self          |
| `POST`   | `/api/v1/certificates`                                           | Creates a certificate                        | Required       | Admin         |
| `PATCH`  | `/api/v1/certificates/{certificateId}`                           | Updates a certificate                        | Required       | Admin         |
| `DELETE` | `/api/v1/certificates/{certificateId}`                           | Deletes a certificate                        | Required       | Admin         |
| `GET`    | `/api/v1/invoices`                                               | Retrieves all invoices                       | Required       | Self          |
| `GET`    | `/api/v1/invoices/{invoiceId}`                                   | Retrieves an invoice details                 | Required       | Self          |
| `DELETE` | `/api/v1/invoices/{invoiceId}`                                   | Deletes an invoice                           | Required       | Admin         |
| `POST`   | `/api/v1/invoices/{invoiceId}/payments`                          | Creates a payment                            | Required       | Self          |
| `GET`    | `/api/v1/programs`                                               | Retrieves all programs                       | Not required   | Any           |
| `GET`    | `/api/v1/programs/{programId}`                                   | Retrieves a program details                  | Not required   | Any           |
| `POST`   | `/api/v1/programs`                                               | Creates a new program                        | Required       | Admin         |
| `PATCH`  | `/api/v1/programs/{programId}`                                   | Updates a program                            | Required       | Admin         |
| `DELETE` | `/api/v1/programs/{programId}`                                   | Deletes a program                            | Required       | Admin         |
| `POST`   | `/api/v1/programs/{programId}/thumbnails`                        | Uploads a program thumbnail                  | Required       | Admin         |
| `GET`    | `/api/v1/programs/{programId}/modules`                           | Retrieves all modules                        | Required       | Any           |
| `GET`    | `/api/v1/programs/{programId}/modules/{moduleId}`                | Retrieves a module details                   | Required       | Any           |
| `POST`   | `/api/v1/programs/{programId}/modules`                           | Creates a new module                         | Required       | Admin         |
| `PATCH`  | `/api/v1/programs/{programId}/modules/{moduleId}`                | Updates a module                             | Required       | Admin         |
| `DELETE` | `/api/v1/programs/{programId}/modules/{moduleId}`                | Deletes a module                             | Required       | Admin         |
| `POST`   | `/api/v1/programs/{programId}/modules/{moduleId}/materials`      | Uploads a module material                    | Required       | Admin         |
| `GET`    | `/api/v1/discussions`                                            | Retrieves all discussion forums              | Required       | Any           |
| `GET`    | `/api/v1/discussions/{discussionId}`                             | Retrieves a discussion forum details         | Required       | Any           |
| `POST`   | `/api/v1/discussions`                                            | Creates a discussion forum                   | Required       | Admin         |
| `PATCH`  | `/api/v1/discussions/{discussionId}`                             | Updates a discussion forum                   | Required       | Admin         |
| `DELETE` | `/api/v1/discussions/{discussionId}`                             | Deletes a discussion forum                   | Required       | Admin         |
| `GET`    | `/api/v1/discussions/{discussionId}/comments`                    | Retrieves all comments in a discussion forum | Required       | Any           |
| `GET`    | `/api/v1/discussions/{discussionId}/comments/{commentId}`        | Retrieves a comment details                  | Required       | Any           |
| `POST`   | `/api/v1/discussions/{discussionId}/comments`                    | Post a comment to a discussion               | Required       | Any           |
| `PATCH`  | `/api/v1/discussions/{discussionId}/comments/{commentId}`        | Updates a comment                            | Required       | Self          |
| `DELETE` | `/api/v1/discussions/{discussionId}/comments/{commentId}`        | Deletes a comment                            | Required       | Self          |
| `POST`   | `/api/v1/discussions/{discussionId}/comments/{commentId}/reply`  | Replies to a comment                         | Required       | Any           |
| `POST`   | `/api/v1/discussions/{discussionId}/comments/{commentId}/like`   | Likes a comment                              | Required       | Any           |
| `POST`   | `/api/v1/discussions/{discussionId}/comments/{commentId}/unlike` | Unlikes a comment                            | Required       | Any           |
| `GET`    | `/api/v1/feedbacks`                                              | Retrieves all feedbacks                      | Required       | Admin         |
| `GET`    | `/api/v1/feedbacks/{feedbackId}`                                 | Retrieves a feedback details                 | Required       | Admin         |
| `POST`   | `/api/v1/feedbacks`                                              | Creates/send a feedback                      | Not required   | Any           |

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
				"id": 1,
				"email": "johndoe@mail.com",
				"fullName": "John Doe",
				"memberLevel": "Basic",
				"role": "User",
				"pictureUrl": null,
				"createdAt": "2025-06-06T08:08:00.080Z",
				"updatedAt": "2025-06-06T08:08:00.080Z"
			}
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
	    "data": null,
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
		"data": null,
		"errors": null
	}
	```

- `GET /api/v1/users` - Retrieves all user data

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/users?limit=10&page=1 \
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
					"email": "johndoe@mail.com",
					"fullName": "John Doe",
					"memberLevel": "Basic",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-06T08:08:00.080Z",
					"updatedAt": "2025-06-06T08:08:00.080Z"
				},
				{
					"id": 2,
					"email": "janedoe@mail.com",
					"fullName": "Jane Doe",
					"memberLevel": "Basic",
					"role": "Admin",
					"pictureUrl": null,
					"createdAt": "2025-06-07T09:10:00.080Z",
					"updatedAt": "2025-06-07T09:10:00.080Z"
				},
				{
					"id": 3,
					"email": "alice@mail.com",
					"fullName": "Alice Smith",
					"memberLevel": "Basic",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-08T10:20:00.080Z",
					"updatedAt": "2025-06-08T10:20:00.080Z"
				},
				{
					"id": 4,
					"email": "bob@mail.com",
					"fullName": "Bob Johnson",
					"memberLevel": "Premium",
					"role": "User",
					"pictureUrl": "https://static.image.com/image.png",
					"createdAt": "2025-06-09T11:30:00.080Z",
					"updatedAt": "2025-06-10T01:30:00.000Z"
				},
				{
					"id": 5,
					"email": "charlie@mail.com",
					"fullName": "Charlie Brown",
					"memberLevel": "Basic",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-10T12:40:00.080Z",
					"updatedAt": "2025-06-10T12:40:00.080Z"
				},
				{
					"id": 6,
					"email": "david@mail.com",
					"fullName": "David Lee",
					"memberLevel": "Premium",
					"role": "User",
					"pictureUrl": "https://static.image.com/image2.png",
					"createdAt": "2025-06-11T13:50:00.080Z",
					"updatedAt": "2025-06-11T14:50:00.080Z"
				},
				{
					"id": 7,
					"email": "eva@mail.com",
					"fullName": "Eva Green",
					"memberLevel": "Basic",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-12T14:00:00.080Z",
					"updatedAt": "2025-06-12T14:00:00.080Z"
				},
				{
					"id": 8,
					"email": "frank@mail.com",
					"fullName": "Frank Miller",
					"memberLevel": "Premium",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-13T15:10:00.080Z",
					"updatedAt": "2025-06-13T15:10:00.080Z"
				},
				{
					"id": 9,
					"email": "grace@mail.com",
					"fullName": "Grace Hopper",
					"memberLevel": "Basic",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-14T16:20:00.080Z",
					"updatedAt": "2025-06-14T16:20:00.080Z"
				},
				{
					"id": 10,
					"email": "henry@mail.com",
					"fullName": "Henry Ford",
					"memberLevel": "Premium",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-15T17:30:00.080Z",
					"updatedAt": "2025-06-15T17:30:00.080Z"
				}
			]
		},
		"pagination": {
			"currentRecords": 10,
			"totalRecords": 40,
			"currentPage": 1,
			"totalPages": 4,
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
				"email": "johndoe@mail.com",
				"fullName": "John Doe",
				"memberLevel": "Basic",
				"role": "User",
				"pictureUrl": null,
				"createdAt": "2025-06-06T08:08:00.080Z",
				"updatedAt": "2025-06-06T08:08:00.080Z"
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
			"fullName": "Joko Doe"
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
				"fullName": "Joko Doe",
				"memberLevel": "Basic",
				"role": "User",
				"pictureUrl": null,
				"createdAt": "2025-06-06T08:08:00.080Z",
				"updatedAt": "2025-06-09T00:00:00.000Z"
			}
		},	
		"errors": null
	}
	```

- `POST /api/v1/users/{userId}/picture` - Uploads a profile picture

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/users/1/picture \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-F "picture=@/path/to/profile.jpg"
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully uploaded a profile picture.",
		"data": {
			"pictureUrl": "https://static.image.com/profile-user1.png"
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

- `GET /api/v1/enrollments` - Retrieves all enrollments

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/enrollments?userId=1&type=Course&sort=-updatedAt&limit=5&page=1 \
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
					"userId": 1,
					"program": {
						"id": 3,
						"title": "VueJS untuk Pemula",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p3.png"
					},
					"progressPercentage": 80.00,
					"status": "In Progress",
					"completedAt": null,
					"createdAt": "2025-12-31T08:00:00.069Z",
					"updatedAt": "2026-01-01T12:12:12.121Z"
				},
				{
					"id": 5,
					"userId": 1,
					"program": {
						"id": 9,
						"title": "DevOps Fundamental",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p9.png"
					},
					"progressPercentage": 20.00,
					"status": "In Progress",
					"completedAt": null,
					"createdAt": "2025-12-25T13:00:00.000Z",
					"updatedAt": "2025-12-31T09:00:00.000Z"
				},
				{
					"id": 2,
					"userId": 1,
					"program": {
						"id": 5,
						"title": "ReactJS Lanjutan",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p5.png"
					},
					"progressPercentage": 100.00,
					"status": "Completed",
					"completedAt": "2025-12-30T10:00:00.000Z",
					"createdAt": "2025-12-01T09:00:00.000Z",
					"updatedAt": "2025-12-30T10:00:00.000Z"
				},
				{
					"id": 3,
					"userId": 1,
					"program": {
						"id": 7,
						"title": "Dasar Pemrograman Python",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p7.png"
					},
					"progressPercentage": 60.00,
					"status": "In Progress",
					"completedAt": null,
					"createdAt": "2025-12-15T08:30:00.000Z",
					"updatedAt": "2025-12-28T14:00:00.000Z"
				},
				{
					"id": 4,
					"userId": 1,
					"program": {
						"id": 2,
						"title": "Machine Learning Dasar",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p2.png"
					},
					"progressPercentage": 100.00,
					"status": "Completed",
					"completedAt": "2025-12-20T16:45:00.000Z",
					"createdAt": "2025-11-20T10:00:00.000Z",
					"updatedAt": "2025-12-20T16:45:00.000Z"
				}
			]
		},
		"pagination": {
			"currentRecords": 5,
			"totalRecords": 10,
			"currentPage": 1,
			"totalPages": 2,
			"nextPage": 2,
			"prevPage": null
		},
		"errors": null
	}
	```

- `GET /api/v1/enrollments/{enrollmentId}` - Retrieves an enrollment details

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/enrollments/1 \
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
				"userId": 1,
				"program": {
					"id": 3,
					"title": "VueJS untuk Pemula",
					"type": "Course",
					"thumbnailUrl": "https://static.image.com/thumb_p3.png"
				},
				"progressPercentage": 80.00,
				"status": "In Progress",
				"completedAt": null,
				"completedModules": [
					{
						"moduleId": 23,
						"completedAt": "2025-12-31T09:00:00.069Z"
					},
					{
						"moduleId": 24,
						"completedAt": "2025-12-31T10:00:00.069Z"
					},
					{
						"moduleId": 25,
						"completedAt": "2025-12-31T11:00:00.069Z"
					},
					{
						"moduleId": 26,
						"completedAt": "2026-01-01T12:12:12.121Z"
					}
				],
				"createdAt": "2025-12-31T08:00:00.069Z",
				"updatedAt": "2026-01-01T12:12:12.121Z"
			}
		},
		"errors": null
	}
	```


- `POST /api/v1/enrollments` - Creates an enrollment/enrolls to a program

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/enrollments \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"programId": 3
		}'
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully created an enrollment. Please complete the payment to access the contents.",
		"data": {
			"enrollment": {
				"id": 1,
				"userId": 1,
				"program": {
					"id": 3,
					"title": "VueJS untuk Pemula",
					"type": "Course",
					"thumbnailUrl": "https://static.image.com/thumb_p3.png"
				},
				"progressPercentage": 0.00,
				"status": "Unpaid",
				"completedAt": null,
				"createdAt": "2025-12-31T08:00:00.069Z",
				"updatedAt": "2025-12-31T08:00:00.069Z"
			},
			"invoice": {
				"id": 1,
				"virtualAccountNumber": "1234279807578",
				"amountIdr": 150000.00,
				"paymentDueDatetime": "2025-12-31T23:59:59.999"
			}
		},
		"errors": null
	}
	```

- `PATCH /api/v1/enrollments/{enrollmentId}` - Updates an enrollment

	- Request:

	```bash
	curl -X PATCH http://localhost:3000/api/v1/enrollments/3 \
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
				"id": 3,
				"userId": 1,
				"program": {
					"id": 19,
					"title": "AI Ethics Seminar",
					"type": "Seminar",
					"thumbnailUrl": "https://static.image.com/thumb_p19.png"
				},
				"progressPercentage": 100.00,
				"status": "Completed",
				"completedAt": "2026-01-01T12:12:12.121Z",
				"createdAt": "2025-12-31T08:00:00.069Z",
				"updatedAt": "2026-01-01T12:12:12.121Z"
			}
		},
		"errors": null
	}
	```

- `DELETE /api/v1/enrollments/{enrollmentId}` - Deletes an enrollment

	- Request:

	```bash
	curl -X DELETE http://localhost:3000/api/v1/enrollments/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully deleted an enrollment.",
		"data": null,
		"errors": null
	}
	```

- `POST /api/v1/enrollments/{enrollmentId}/completed-modules` - Mark a module as completed. Only works on programs with "Course" type

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/enrollments/1/completed-modules \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"moduleId": 23
		}'
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully completed a module.",
		"data": {
			"completedModule": {
				"id": 200,
				"moduleId": 23,
				"completedAt": "2025-12-31T09:00:00.000Z"
			}
		},
		"errors": null
	}
	```

- `GET /api/v1/certificates` - Retrieves all certificates

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/users/1/certificates?userId=1&limit=5&page=1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved all certificates.",
		"data": {
			"certificates": [
				{
					"id": 1,
					"userId": 1,
					"enrollmentId": 1,
					"program": {
						"id": 3,
						"title": "VueJS untuk Pemula",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p3.png"
					},
					"title": "VueJS untuk Pemula Certificate of Completion",
					"credential": "ASJ2316-AHUA17",
					"issuedAt": "2025-12-09T12:45:55.091Z",
					"expiredAt": "2030-12-09T12:45:55.091Z",
					"documentUrl": "https://example.storage.com/cert/frontend0119999.pdf"
				},
				{
					"id": 2,
					"userId": 1,
					"enrollmentId": 2,
					"program": {
						"id": 5,
						"title": "Back-End Web Development",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p5.png"
					},
					"title": "Back-End Web Development Certificate of Completion",
					"credential": "YAGS617-AJSB98",
					"issuedAt": "2025-12-14T11:00:00.000Z",
					"expiredAt": "2030-12-14T11:00:00.000Z",
					"documentUrl": "https://example.storage.com/cert/backend0119119.pdf"
				},
				{
					"id": 3,
					"userId": 1,
					"enrollmentId": 3,
					"program": {
						"id": 7,
						"title": "Dasar Pemrograman Python",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p7.png"
					},
					"title": "Dasar Pemrograman Python Certificate of Completion",
					"credential": "PYTH123-DFG456",
					"issuedAt": "2025-12-20T10:00:00.000Z",
					"expiredAt": "2030-12-20T10:00:00.000Z",
					"documentUrl": "https://example.storage.com/cert/python0119222.pdf"
				},
				{
					"id": 4,
					"userId": 1,
					"enrollmentId": 4,
					"program": {
						"id": 2,
						"title": "Machine Learning Dasar",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p2.png"
					},
					"title": "Machine Learning Dasar Certificate of Completion",
					"credential": "MLD789-HJK321",
					"issuedAt": "2025-12-25T15:30:00.000Z",
					"expiredAt": "2030-12-25T15:30:00.000Z",
					"documentUrl": "https://example.storage.com/cert/ml0119333.pdf"
				},
				{
					"id": 5,
					"userId": 1,
					"enrollmentId": 5,
					"program": {
						"id": 9,
						"title": "DevOps Fundamental",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p9.png"
					},
					"title": "DevOps Fundamental Certificate of Completion",
					"credential": "DEVOPS456-XYZ789",
					"issuedAt": "2026-01-01T12:00:00.000Z",
					"expiredAt": "2031-01-01T12:00:00.000Z",
					"documentUrl": "https://example.storage.com/cert/devops0119444.pdf"
				}
			]
		},
		"pagination": {
			"currentRecords": 5,
			"totalRecords": 5,
			"currentPage": 1,
			"totalPages": 1,
			"nextPage": null,
			"prevPage": null
		},
		"errors": null
	}
	```

- `GET /api/v1/certificates/{certificateId}` - Retrieves a certificate details

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/users/1/certificates/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved a certificate.",
		"data": {
			"certificate": {
				"id": 1,
				"userId": 1,
				"enrollmentId": 1,
				"program": {
					"id": 3,
					"title": "VueJS untuk Pemula",
					"type": "Course",
					"thumbnailUrl": "https://static.image.com/thumb_p3.png"
				},
				"title": "VueJS untuk Pemula Certificate of Completion",
				"credential": "ASJ2316-AHUA17",
				"issuedAt": "2025-12-09T12:45:55.091Z",
				"expiredAt": "2030-12-09T12:45:55.091Z",
				"documentUrl": "https://example.storage.com/cert/frontend0119999.pdf",
				"createdAt": "2025-12-09T12:45:55.091Z",
				"updatedAt": "2025-12-09T12:45:55.091Z"
			}
		},
		"errors": null
	}
	```

- `POST /api/v1/certificates` - Creates a certificate

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/certificates \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"title": "Mobile Development Certificate of Completion",
			"issuedAt": "2025-12-09T12:45:55.091Z",
			"expiredAt": "2030-12-09T12:45:55.091Z",
			"userId": 23,
			"enrollmentId": 33
		}'
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully created a certificate.",
		"data": {
			"certificate": {
				"id": 200,
				"userId": 23,
				"enrollmentId": 33,
				"program": {
					"id": 79,
					"title": "Mobile Development",
					"type": "Course",
					"thumbnailUrl": "https://static.image.com/thumb_p79.png"
				},
				"title": "Mobile Development Certificate of Completion",
				"credential": "MBD2316-AGSA22",
				"issuedAt": "2025-12-09T12:45:55.091Z",
				"expiredAt": "2030-12-09T12:45:55.091Z",
				"documentUrl": "https://example.storage.com/cert/mobiledev0119999.pdf",
				"createdAt": "2025-12-09T12:45:55.091Z",
				"updatedAt": "2025-12-09T12:45:55.091Z"
			}
		},
		"errors": null
	}
	```

- `PATCH /api/v1/certificates/{certificateId}` - Updates a certificate

	- Request:

	```bash
	curl -X PATCH http://localhost:3000/api/v1/certificates/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"title": "VueJS Front-End Web Development Certificate of Completion"
		}'
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully updated a certificate.",
		"data": {
			"certificate": {
				"id": 1,
				"userId": 1,
				"enrollmentId": 1,
				"program": {
					"id": 3,
					"title": "VueJS untuk Pemula",
					"type": "Course",
					"thumbnailUrl": "https://static.image.com/thumb_p3.png"
				},
				"title": "VueJS Front-End Web Development Certificate of Completion",
				"credential": "ASJ2316-AHUA17",
				"issuedAt": "2025-12-09T12:45:55.091Z",
				"expiredAt": "2030-12-09T12:45:55.091Z",
				"documentUrl": "https://example.storage.com/cert/frontend0119999.pdf",
				"createdAt": "2025-12-09T12:45:55.091Z",
				"updatedAt": "2025-12-31T12:45:55.091Z"
			}
		},
		"errors": null
	}
	```

- `DELETE /api/v1/certificates/{certificateId}` - Deletes a certificate

	- Request:

	```bash
	curl -X DELETE http://localhost:3000/api/v1/certificates/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully deleted a certificate.",
		"data": null,
		"errors": null
	}
	```

- `GET /api/v1/invoices` - Retrieves all invoices

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/invoices?userId=1&limit=5&page=1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved all invoices.",
		"data": {
			"invoices": [
				{
					"id": 1,
					"userId": 1,
					"enrollmentId": 1,
					"program": {
						"id": 3,
						"title": "VueJS untuk Pemula",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p3.png"
					},
					"virtualAccountNumber": "1234279807578",
					"amountIdr": 150000.00,
					"paymentDueDatetime": "2025-12-31T23:59:59.999",
					"status": "Verified",
					"payment": {
						"id": 1,
						"amountPaidIdr": 150000.00,
						"createdAt": "2025-12-30T23:59:59.999",
						"updatedAt": "2025-12-30T23:59:59.999"
					},
					"createdAt": "2025-12-27T23:59:59.999",
					"updatedAt": "2025-12-30T23:59:59.999"
				},
				{
					"id": 2,
					"userId": 1,
					"enrollmentId": 2,
					"program": {
						"id": 5,
						"title": "Back-End Web Development",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p5.png"
					},
					"virtualAccountNumber": "1234279807579",
					"amountIdr": 200000.00,
					"paymentDueDatetime": "2025-12-31T23:59:59.999",
					"status": "Unverified",
					"payment": null,
					"createdAt": "2025-12-28T10:00:00.000",
					"updatedAt": "2025-12-28T10:00:00.000"
				},
				{
					"id": 3,
					"userId": 1,
					"enrollmentId": 3,
					"program": {
						"id": 7,
						"title": "Dasar Pemrograman Python",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p7.png"
					},
					"virtualAccountNumber": "1234279807580",
					"amountIdr": 175000.00,
					"paymentDueDatetime": "2025-12-31T23:59:59.999",
					"status": "Expired",
					"payment": null,
					"createdAt": "2025-12-29T11:00:00.000",
					"updatedAt": "2025-12-31T23:59:59.999"
				},
				{
					"id": 4,
					"userId": 1,
					"enrollmentId": 4,
					"program": {
						"id": 2,
						"title": "Machine Learning Dasar",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p2.png"
					},
					"virtualAccountNumber": "1234279807581",
					"amountIdr": 250000.00,
					"paymentDueDatetime": "2025-12-31T23:59:59.999",
					"status": "Verified",
					"payment": {
						"id": 2,
						"amountPaidIdr": 250000.00,
						"createdAt": "2025-12-30T15:00:00.000",
						"updatedAt": "2025-12-30T15:00:00.000"
					},
					"createdAt": "2025-12-30T12:00:00.000",
					"updatedAt": "2025-12-30T15:00:00.000"
				},
				{
					"id": 5,
					"userId": 1,
					"enrollmentId": 5,
					"program": {
						"id": 9,
						"title": "DevOps Fundamental",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p9.png"
					},
					"virtualAccountNumber": "1234279807582",
					"amountIdr": 180000.00,
					"paymentDueDatetime": "2025-12-31T23:59:59.999",
					"status": "Unverified",
					"payment": null,
					"createdAt": "2025-12-31T08:00:00.000",
					"updatedAt": "2025-12-31T08:00:00.000"
				}
			]
		},
		"pagination": {
			"currentRecords": 5,
			"totalRecords": 7,
			"currentPage": 1,
			"totalPages": 2,
			"nextPage": 2,
			"prevPage": null
		},
		"errors": null
	}
	```

- `GET /api/v1/invoices/{invoiceId}` - Retrieves an invoice details

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/invoices/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved an invoice details.",
		"data": {
			"invoice": {
				"id": 1,
				"userId": 1,
				"enrollmentId": 1,
				"program": {
					"id": 3,
					"title": "VueJS untuk Pemula",
					"type": "Course",
					"thumbnailUrl": "https://static.image.com/thumb_p3.png"
				},
				"virtualAccountNumber": "1234279807578",
				"amountIdr": 150000.00,
				"paymentDueDatetime": "2025-12-31T23:59:59.999",
				"status": "Verified",
				"payment": {
					"id": 1,
					"amountPaidIdr": 150000.00,
					"createdAt": "2025-12-30T23:59:59.999",
					"updatedAt": "2025-12-30T23:59:59.999"
				},
				"createdAt": "2025-12-27T23:59:59.999",
				"updatedAt": "2025-12-30T23:59:59.999"
			}
		},
		"errors": null
	}
	```

- `DELETE /api/v1/invoices/{invoiceId}` - Deletes an invoice

	- Request:

	```bash
	curl -X DELETE http://localhost:3000/api/v1/invoices/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully deleted an invoice.",
		"data": null,
		"errors": null
	}
	```

- `POST /api/v1/invoices/{invoiceId}/payments` - Creates a payment

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/invoices/1/payments \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully created a payment.",
		"data": {
			"payment": {
				"id": 1,
				"amountPaidIdr": 150000.00,
				"createdAt": "2025-12-30T23:59:59.999",
				"updatedAt": "2025-12-30T23:59:59.999"
			}
		},
		"errors": null
	}
	```

- `GET /api/v1/programs` - Retrieves all programs

	- Request:

    ```bash
	curl -X GET http://localhost:3000/api/v1/programs?limit=5&page=1&type=All
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved all programs.",
		"data": {
			"programs": [
				{
					"id": 1,
					"title": "VueJS untuk Pemula",
					"description": "Program ini dirancang untuk pemula yang ingin mempelajari dasar-dasar pengembangan aplikasi web menggunakan VueJS. Peserta akan memahami konsep inti VueJS, mulai dari instalasi, pembuatan komponen, hingga pengelolaan state dan routing. Materi disusun secara bertahap agar mudah diikuti, dilengkapi dengan studi kasus dan latihan praktik untuk memperkuat pemahaman.",
					"type": "Course",
					"thumbnailUrl": "https://static.image.com/thumb_p3.png",
					"availableDate": "2025-01-01T00:00:00.000Z",
					"priceIdr": 300000,
					"createdAt": "2024-12-25T10:00:00.000Z",
					"updatedAt": "2024-12-25T10:00:00.000Z",
				},
				{
					"id": 2,
					"title": "ReactJS Lanjutan",
					"description": "Program lanjutan untuk pengembangan aplikasi web dengan ReactJS. Peserta akan mempelajari teknik advanced seperti hooks, context API, optimasi performa, dan integrasi dengan backend.",
					"type": "Course",
					"thumbnailUrl": "https://static.image.com/thumb_p5.png",
					"availableDate": "2025-02-01T00:00:00.000Z",
					"priceIdr": 350000,
					"createdAt": "2024-12-26T10:00:00.000Z",
					"updatedAt": "2024-12-26T10:00:00.000Z"
				},
				{
					"id": 3,
					"title": "Hackathon Informatics 2025",
					"description": "Kompetisi pengembangan aplikasi selama 48 jam untuk mahasiswa dan profesional IT. Peserta akan membentuk tim, mengerjakan studi kasus, dan mempresentasikan solusi di depan juri.",
					"type": "Competition",
					"thumbnailUrl": "https://static.image.com/thumb_competition.png",
					"availableDate": "2025-03-10T00:00:00.000Z",
					"priceIdr": 0,
					"isOnline": false,
					"locationAddress": "Gedung Informatics Center, Jl. Teknologi No. 10, Jakarta",
					"hostName": "Informatics Learning Center",
					"totalPrize": 15000000,
					"contestRoomUrl": null,
					"videoConferenceUrl": null,
					"createdAt": "2024-12-27T10:00:00.000Z",
					"updatedAt": "2024-12-27T10:00:00.000Z"
				},
				{
					"id": 4,
					"title": "AI Ethics Seminar",
					"description": "Seminar membahas etika dalam pengembangan kecerdasan buatan, menghadirkan pembicara dari industri dan akademisi. Cocok untuk praktisi dan mahasiswa yang ingin memahami dampak sosial AI.",
					"type": "Seminar",
					"thumbnailUrl": "https://static.image.com/thumb_seminar.png",
					"availableDate": "2025-04-15T00:00:00.000Z",
					"priceIdr": 100000,
					"isOnline": true,
					"videoConferenceUrl": "https://zoom.us/j/123456789",
					"locationAddress": null,
					"speakerNames": [
						"Dr. Andi Pratama",
						"Prof. Siti Rahmawati"
					],
					"createdAt": "2024-12-28T10:00:00.000Z",
					"updatedAt": "2024-12-28T10:00:00.000Z"
				},
				{
					"id": 5,
					"title": "Workshop DevOps Fundamental",
					"description": "Workshop intensif satu hari untuk memahami konsep dasar DevOps, CI/CD, dan praktik terbaik dalam pengelolaan infrastruktur modern. Peserta akan mendapatkan pengalaman langsung melalui simulasi dan studi kasus.",
					"type": "Workshop",
					"thumbnailUrl": "https://static.image.com/thumb_workshop.png",
					"availableDate": "2025-05-20T00:00:00.000Z",
					"priceIdr": 250000,
					"isOnline": false,
					"videoConferenceUrl": null,
					"locationAddress": "Ruang Workshop, Gedung Informatics Center, Jakarta",
					"facilitatorNames": [
						"Budi Santoso",
						"Rina Kusuma"
					],
					"createdAt": "2024-12-29T10:00:00.000Z",
					"updatedAt": "2024-12-29T10:00:00.000Z"
				}
			]
		},
		"pagination": {
			"currentRecords": 5,
			"totalRecords": 53,
			"currentPage": 1,
			"totalPages": 11,
			"nextPage": 2,
			"prevPage": null
		},
		"errors": null
	}
	```

- `GET /api/v1/programs/{programId}` - Retrieves a program details

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/programs/1
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved a program details.",
		"data": {
			"program": {
				"id": 1,
				"title": "VueJS untuk Pemula",
				"description": "Program ini dirancang untuk pemula yang ingin mempelajari dasar-dasar pengembangan aplikasi web menggunakan VueJS. Peserta akan memahami konsep inti VueJS, mulai dari instalasi, pembuatan komponen, hingga pengelolaan state dan routing. Materi disusun secara bertahap agar mudah diikuti, dilengkapi dengan studi kasus dan latihan praktik untuk memperkuat pemahaman.",
				"type": "Course",
				"thumbnailUrl": "https://static.image.com/thumb_p3.png",
				"availableDate": "2025-01-01T00:00:00.000Z",
				"priceIdr": 300000,
				"createdAt": "2024-12-25T10:00:00.000Z",
				"updatedAt": "2024-12-25T10:00:00.000Z",
			},
		},
		"errors": null
	}
	```

- `POST /api/v1/programs` - Creates a new program

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/programs \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"title": "VueJS untuk Pemula",
			"description": "Program ini dirancang untuk pemula yang ingin mempelajari dasar-dasar pengembangan aplikasi web menggunakan VueJS. Peserta akan memahami konsep inti VueJS, mulai dari instalasi, pembuatan komponen, hingga pengelolaan state dan routing. Materi disusun secara bertahap agar mudah diikuti, dilengkapi dengan studi kasus dan latihan praktik untuk memperkuat pemahaman.",
			"type": "Course",
			"availableDate": "2025-01-01",
			"priceIdr": 300000
		}
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully created a program.",
		"data": {
			"program": {
				"id": 1,
				"title": "VueJS untuk Pemula",
				"description": "Program ini dirancang untuk pemula yang ingin mempelajari dasar-dasar pengembangan aplikasi web menggunakan VueJS. Peserta akan memahami konsep inti VueJS, mulai dari instalasi, pembuatan komponen, hingga pengelolaan state dan routing. Materi disusun secara bertahap agar mudah diikuti, dilengkapi dengan studi kasus dan latihan praktik untuk memperkuat pemahaman.",
				"type": "Course",
				"thumbnailUrl": "https://static.image.com/thumb_p3.png",
				"availableDate": "2025-01-01T00:00:00.000Z",
				"priceIdr": 300000,
				"createdAt": "2024-12-25T10:00:00.000Z",
				"updatedAt": "2024-12-25T10:00:00.000Z",
			},
		},
		"errors": null
	}
	```

- `PATCH /api/v1/programs/{programId}` - Updates a program

	- Request:

	```bash
	curl -X PATCH http://localhost:3000/api/v1/programs/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"priceIdr": 150000
		}
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully updated a program.",
		"data": {
			"program": {
				"id": 1,
				"title": "VueJS untuk Pemula",
				"description": "Program ini dirancang untuk pemula yang ingin mempelajari dasar-dasar pengembangan aplikasi web menggunakan VueJS. Peserta akan memahami konsep inti VueJS, mulai dari instalasi, pembuatan komponen, hingga pengelolaan state dan routing. Materi disusun secara bertahap agar mudah diikuti, dilengkapi dengan studi kasus dan latihan praktik untuk memperkuat pemahaman.",
				"type": "Course",
				"thumbnailUrl": "https://static.image.com/thumb_p3.png",
				"availableDate": "2025-01-01T00:00:00.000Z",
				"priceIdr": 200000,
				"createdAt": "2024-12-25T10:00:00.000Z",
				"updatedAt": "2025-01-01T12:00:00.000Z",
			},
		},
		"errors": null
	}
	```

- `DELETE /api/v1/programs/{programId}` - Deletes a program

	- Request:

	```bash
	curl -X DELETE http://localhost:3000/api/v1/programs/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully deleted a program.",
		"data": null,
		"errors": null
	}
	```

- `POST /api/v1/programs/{programId}/thumbnails` - Uploads a program thumbnail

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/programs/1/thumbnails \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-F "picture=@/path/to/thumbnail.jpg"
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully uploaded a program thumbnail.",
		"data": {
			"thumbnailUrl": "https://static.image.com/profile-user1.png"
		},	
		"errors": null
	}
	```

- `GET /api/v1/programs/{programId}/modules` - Retrieves all modules

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/programs/1/modules?limit=10&page=1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved all modules.",
		"data": {
			"modules": [
				{
					"id": 1,
					"numberCode": 1,
					"materialUrl": "https://static.material.com/module1.pdf",
					"youtubeUrl": "https://youtube.com/watch?v=module1",
					"createdAt": "2025-01-01T10:00:00.000Z",
					"updatedAt": "2025-01-02T12:00:00.000Z"
				},
				{
					"id": 2,
					"numberCode": 2,
					"materialUrl": "https://static.material.com/module2.pdf",
					"youtubeUrl": "https://youtube.com/watch?v=module2",
					"createdAt": "2025-01-02T10:00:00.000Z",
					"updatedAt": "2025-01-03T12:00:00.000Z"
				},
				{
					"id": 3,
					"numberCode": 3,
					"materialUrl": "https://static.material.com/module3.pdf",
					"youtubeUrl": "https://youtube.com/watch?v=module3",
					"createdAt": "2025-01-03T10:00:00.000Z",
					"updatedAt": "2025-01-04T12:00:00.000Z"
				},
				{
					"id": 4,
					"numberCode": 4,
					"materialUrl": "https://static.material.com/module4.pdf",
					"youtubeUrl": "https://youtube.com/watch?v=module4",
					"createdAt": "2025-01-04T10:00:00.000Z",
					"updatedAt": "2025-01-05T12:00:00.000Z"
				},
				{
					"id": 5,
					"numberCode": 5,
					"materialUrl": "https://static.material.com/module5.pdf",
					"youtubeUrl": "https://youtube.com/watch?v=module5",
					"createdAt": "2025-01-05T10:00:00.000Z",
					"updatedAt": "2025-01-06T12:00:00.000Z"
				},
				{
					"id": 6,
					"numberCode": 6,
					"materialUrl": "https://static.material.com/module6.pdf",
					"youtubeUrl": "https://youtube.com/watch?v=module6",
					"createdAt": "2025-01-06T10:00:00.000Z",
					"updatedAt": "2025-01-07T12:00:00.000Z"
				},
				{
					"id": 7,
					"numberCode": 7,
					"materialUrl": "https://static.material.com/module7.pdf",
					"youtubeUrl": "https://youtube.com/watch?v=module7",
					"createdAt": "2025-01-07T10:00:00.000Z",
					"updatedAt": "2025-01-08T12:00:00.000Z"
				},
				{
					"id": 8,
					"numberCode": 8,
					"materialUrl": "https://static.material.com/module8.pdf",
					"youtubeUrl": "https://youtube.com/watch?v=module8",
					"createdAt": "2025-01-08T10:00:00.000Z",
					"updatedAt": "2025-01-09T12:00:00.000Z"
				},
				{
					"id": 9,
					"numberCode": 9,
					"materialUrl": "https://static.material.com/module9.pdf",
					"youtubeUrl": "https://youtube.com/watch?v=module9",
					"createdAt": "2025-01-09T10:00:00.000Z",
					"updatedAt": "2025-01-10T12:00:00.000Z"
				},
				{
					"id": 10,
					"numberCode": 10,
					"materialUrl": "https://static.material.com/module10.pdf",
					"youtubeUrl": "https://youtube.com/watch?v=module10",
					"createdAt": "2025-01-10T10:00:00.000Z",
					"updatedAt": "2025-01-11T12:00:00.000Z"
				}
			]
		},
		"pagination": {
			"currentRecords": 10,
			"totalRecords": 22,
			"currentPage": 1,
			"totalPages": 3,
			"nextPage": 2,
			"prevPage": null
		},
		"errors": null
	}
	```

- `GET /api/v1/programs/{programId}/modules/{moduleId}` - Retrieves a module details

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/programs/1/modules/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved module details.",
		"data": {
			"module": {
				"id": 1,
				"numberCode": 1,
				"materialUrl": "https://static.material.com/module1.pdf",
				"youtubeUrl": "https://youtube.com/watch?v=module1",
				"createdAt": "2025-01-01T10:00:00.000Z",
				"updatedAt": "2025-01-02T12:00:00.000Z"
			},
		},
		"errors": null
	}
	```

- `POST /api/v1/programs/{programId}/modules` - Creates a new module

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/programs/1/modules \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"numberCode": 1,
			"youtubeUrl": "https://youtube.com/watch?v=module1"
		}'
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully created a module.",
		"data": {
			"module": {
				"id": 1,
				"numberCode": 1,
				"materialUrl": null,
				"youtubeUrl": "https://youtube.com/watch?v=module1",
				"createdAt": "2025-01-01T10:00:00.000Z",
				"updatedAt": "2025-01-01T10:00:00.000Z"
			},
		},
		"errors": null
	}
	```

- `PATCH /api/v1/programs/{programId}/modules/{moduleId}` - Updates a module

	- Request:

	```bash
	curl -X PATCH http://localhost:3000/api/v1/programs/1/modules/1 /
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"youtubeUrl": "https://youtube.com/watch?v=module1_new"
		}'
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully updated a module.",
		"data": {
			"module": {
				"id": 1,
				"numberCode": 1,
				"materialUrl": null,
				"youtubeUrl": "https://youtube.com/watch?v=module1_new",
				"createdAt": "2025-01-01T10:00:00.000Z",
				"updatedAt": "2025-01-03T00:00:00.000Z"
			},
		},
		"errors": null
	}
	```

- `DELETE /api/v1/programs/{programId}/modules/{moduleId}` - Deletes a module

	- Request:

	```bash
	curl -X DELETE http://localhost:3000/api/v1/programs/1/modules/1 /
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully deleted a module.",
		"data": null,
		"errors": null
	}
	```

- `POST /api/v1/programs/{programId}/modules/{moduleId}/materials` - Uploads a module material

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/programs/1/modules/1/materials \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-F "picture=@/path/to/material0101.pdf"
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully uploaded a module material.",
		"data": {
			"materialUrl": "https://storage.document.com/material0101.pdf"
		},	
		"errors": null
	}
	```

- `GET /api/v1/discussions` - Retrieves all discussion forums

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/discussions?type=Course \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved all discussion forums.",
		"data": {
			"discussions": [
				{
					"id": 1,
					"title": "Forum Data Science",
					"createdAt": "2025-03-01T10:00:00.000Z",
					"updatedAt": "2025-03-01T10:00:00.000Z"
				},
				{
					"id": 2,
					"title": "Forum Web Development",
					"createdAt": "2025-03-02T11:00:00.000Z",
					"updatedAt": "2025-03-02T11:00:00.000Z"
				},
				{
					"id": 3,
					"title": "Forum Machine Learning",
					"createdAt": "2025-03-03T12:00:00.000Z",
					"updatedAt": "2025-03-03T12:00:00.000Z"
				},
				{
					"id": 4,
					"title": "Forum Cyber Security",
					"createdAt": "2025-03-04T13:00:00.000Z",
					"updatedAt": "2025-03-04T13:00:00.000Z"
				},
				{
					"id": 5,
					"title": "Forum Mobile Development",
					"createdAt": "2025-03-05T14:00:00.000Z",
					"updatedAt": "2025-03-05T14:00:00.000Z"
				},
				{
					"id": 6,
					"title": "Forum UI/UX Design",
					"createdAt": "2025-03-06T15:00:00.000Z",
					"updatedAt": "2025-03-06T15:00:00.000Z"
				},
				{
					"id": 7,
					"title": "Forum Cloud Computing",
					"createdAt": "2025-03-07T16:00:00.000Z",
					"updatedAt": "2025-03-07T16:00:00.000Z"
				},
				{
					"id": 8,
					"title": "Forum Data Analytics",
					"createdAt": "2025-03-08T17:00:00.000Z",
					"updatedAt": "2025-03-08T17:00:00.000Z"
				},
				{
					"id": 9,
					"title": "Forum Artificial Intelligence",
					"createdAt": "2025-03-09T18:00:00.000Z",
					"updatedAt": "2025-03-09T18:00:00.000Z"
				},
				{
					"id": 10,
					"title": "Forum DevOps",
					"createdAt": "2025-03-10T19:00:00.000Z",
					"updatedAt": "2025-03-10T19:00:00.000Z"
				}
			]
		},
		"pagination": {
			"currentRecords": 10,
			"totalRecords": 55,
			"currentPage": 1,
			"totalPages": 6,
			"nextPage": 2,
			"prevPage": null
		},
		"errors": null
	}
	```

- `GET /api/v1/discussions/{discussionId}` - Retrieves a discussion forum details

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/discussions/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved discussion forum details.",
		"data": {
			"discussion": {
				"id": 1,
				"title": "Forum Data Science",
				"createdAt": "2025-03-01T10:00:00.000Z",
				"updatedAt": "2025-03-01T10:00:00.000Z"
			}
		},
		"errors": null
	}
	```

- `POST /api/v1/discussions` - Creates a discussion forum

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/discussions \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"title": "Forum Data Science"
		}'
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully created a discussion forum.",
		"data": {
			"discussion": {
				"id": 1,
				"title": "Forum Data Science",
				"createdAt": "2025-03-01T10:00:00.000Z",
				"updatedAt": "2025-03-01T10:00:00.000Z"
			},
		},
		"errors": null
	}
	```

- `PATCH /api/v1/discussions/1` - Updates a discussion forum

	- Request:

	```bash
	curl -X PATCH http://localhost:3000/api/v1/discussions/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"title": "Forum Sains Data"
		}'
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully updated a discussion forum.",
		"data": {
			"discussion": {
				"id": 1,
				"title": "Forum Sains Data",
				"createdAt": "2025-03-01T10:00:00.000Z",
				"updatedAt": "2025-03-02T11:00:00.000Z"
			},
		},
		"errors": null
	}
	```

- `DELETE /api/v1/discussions/1` - Deletes a discussion forum

	- Request:

	```bash
	curl -X DELETE http://localhost:3000/api/v1/discussions/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully deleted a discussion forum.",
		"data": null,
		"errors": null
	}
	```

