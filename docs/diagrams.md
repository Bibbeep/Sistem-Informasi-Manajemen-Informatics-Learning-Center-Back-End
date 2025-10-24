# Project Designs

## Entity Relationship Diagram

```mermaid
---
config:
  theme: redux-dark-color
  layout: dagre
---
erDiagram
    USERS {
        int id PK
        varchar email
        varchar hashed_password
        varchar full_name
        enum member_level
        enum role
        text picture_url
        timestamptz created_at
        timestamptz updated_at
    }

    PROGRAMS {
        int id PK
        varchar title
        text description
        text thumbnail_url
        timestamptz available_date
        enum type
        int price_idr
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    COURSES {
        int id PK
        int program_id FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    COURSE_MODULES {
        int id PK
        int course_id FK
        int number_code
        text material_url
        text youtube_url
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    USER_PROGRAM_ENROLLMENTS {
        int id PK
        int program_id FK
        int user_id FK
        enum status
        numeric progress_percentage
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    USER_PROGRAM_INVOICES {
        int id PK
        int user_program_enrollment_id FK
        varchar virtual_account_number
        int amount_idr
        timestamptz payment_due_datetime
        enum status
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    USER_PROGRAM_PAYMENTS {
        int id PK
        int user_program_invoice_id FK
        int amount_paid_idr
        timestamptz created_at
        timestamptz updated_at
    }

    USER_COMPLETED_MODULES {
        int id PK
        int course_module_id FK
        int user_program_enrollment_id FK
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
    }

    CERTIFICATES {
        int id PK
        int user_program_enrollment_id FK
        int user_id FK
        varchar title
        varchar credential
        text document_url
        timestamptz issued_at
        timestamptz expired_at
        timestamptz created_at
        timestamptz updated_at
    }

    SEMINARS {
        int id PK
        int program_id FK
        boolean is_online
        text video_conference_url
        varchar location_address
        varchar[] speaker_names
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    WORKSHOPS {
        int id PK
        int program_id FK
        boolean is_online
        text video_conference_url
        varchar location_address
        varchar[] facilitator_names
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    COMPETITIONS {
        int id PK
        int program_id FK
        boolean is_online
        text video_conference_url
        text contest_room_url
        varchar location_address
        varchar host_name
        int total_prize
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    DISCUSSIONS {
        int id PK
        int admin_user_id FK
        varchar title
        timestamptz created_at
        timestamptz updated_at
    }

    COMMENTS {
        int id PK
        int discussion_id FK
        int user_id FK
        int parent_comment_id FK
        text message
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    COMMENT_LIKES {
        int id PK
        int comment_id FK
        int user_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    FEEDBACKS {
        int id PK
        varchar email
        varchar full_name
        text message
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    FEEDBACK_RESPONSES {
        int id PK
        int feedback_id FK
        int admin_user_id FK
        text message
        timestamptz created_at
        timestamptz updated_at
    }

    %% Relationships

    USERS ||--o{ USER_PROGRAM_ENROLLMENTS : has
    USERS ||--o{ CERTIFICATES : receives
    USERS ||--o{ COMMENT_LIKES : gives
    USERS ||--o{ COMMENTS : writes
    USERS ||--o{ DISCUSSIONS : manages
    USERS ||--o{ FEEDBACK_RESPONSES : handles

    PROGRAMS ||--o{ COURSES : includes
    PROGRAMS ||--o{ SEMINARS : includes
    PROGRAMS ||--o{ WORKSHOPS : includes
    PROGRAMS ||--o{ COMPETITIONS : includes
    PROGRAMS ||--o{ USER_PROGRAM_ENROLLMENTS : enrollments

    COURSES ||--o{ COURSE_MODULES : contains
    COURSE_MODULES ||--o{ USER_COMPLETED_MODULES : completed_by

    USER_PROGRAM_ENROLLMENTS ||--o{ USER_PROGRAM_INVOICES : billed_in
    USER_PROGRAM_INVOICES ||--o{ USER_PROGRAM_PAYMENTS : paid_by
    USER_PROGRAM_ENROLLMENTS ||--o{ USER_COMPLETED_MODULES : progress
    USER_PROGRAM_ENROLLMENTS ||--o{ CERTIFICATES : awards

    DISCUSSIONS ||--o{ COMMENTS : has
    COMMENTS ||--o{ COMMENT_LIKES : liked_by
    COMMENTS ||--o{ COMMENTS : replies_to

    FEEDBACKS ||--o{ FEEDBACK_RESPONSES : replied_by
```

## Data Flow Diagram

## Class Diagram

## Docker Architecture Diagram
