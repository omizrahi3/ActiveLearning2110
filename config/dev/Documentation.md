# Active Learning 2110 API Documentation

This is the Active Learning 2110 app API documentation. Our application uses a MEAN Stack which includes the use of Node, AngularJS, Node Express, HTML, and CSS to build a web application that stores information in a MongoDB database. This overviews routes and function calls that interact with our database. This documentation will cover authentication, user services, courses, lectures and questions which are all aspects within our web app.

## Important Information

**All URIs relative to .../api_v2**

**See method calls in code for more description on methods through docs**

**If it says "(Optional)," then that information is optional; otherwise assume it is required**

### Notes:
- {user_id} --> Path Parameters: user_id String
- {instructor_id} --> Path Parameters: instructor_id String
- {user_role} ---> Query String: pass either "admin" or "instructor" for those registration paths
- A user's role can be admin, student, or instructor.
- Quotes around text implies that it is a String.
- Square brackets are lists.
- Parentheses denote additional information.
<Triangle brackets denote within them whether information is Required or Optional.>

## Authentication

Token-based authentication.

|  Method | HTTP request | Description | Details |
| ------- | --------------- | -------------- | ---- |
| post | **POST** /authenticate | Authenticate user. | json --> "username" and "password" <All Required> |
| delete | **DELETE** /authenticate | Log out user. | Authentication: user token <All Required> |

## Sign Up

|  Method | HTTP request | Description | Details |
| ------- | --------------- | -------------- | ---- |
| post | **POST** /signup?role={user_role}/ | Register User. | json --> "username", "password", "firstname", "lastname", and "key"(Required for admin or instructor registration) <All Required> |
| post | **POST** /signup/admin_key | Create admin registration key. | Authentication: user token, Authorization: admin <All Required> |
| post | **POST** /signup/instructor_key | Create instructor registration key. | Authentication: user token, Authorization: admin <All Required> |
| get | **GET** /signup/registration_key | Get all registration keys. | Authentication: user token, Authorization: admin <All Required> |

## User Services

|  Method | HTTP request | Description | Details |
| ------- | --------------- | -------------- | ------ |
| get | **GET** /user | Get all users. | Authentication: user token, Authorization: admin <All Required> |
| get | **GET** /user/{user_id}/ | Get user. | Authentication: user token, Authorization: admin or self <All Required> |
| post | **POST** /user/{user_id}/ | Update user information. | json --> "new_photo", "new_firstname", "new_lastname", and "new_role"(admin auth only)  (All Optional) |
| get | **GET** /user/{user_id}/course | Get user courses. | Authentication: user token, Authorization: student or instructor <All Required> |
| post | **POST** /user/{user_id}/role | Update user role. | Authentication: user token, Authorization: admin, json --> "new_role" <All Required> |
| post | **POST** /user/{user_id}/password | Update user password. | Authentication: user token, Authorization: self, json --> "cur_password" and "new_password" |
| post | **POST** /user/{user_id}/deactivate | Deactivate or Reactivate user. | Authentication: user token, Authorization: admin <All Required> |
| get | **GET** /user/{instructor_id}/questions | Get snapshots of all instructor questions. | Authentication: user token, Authorization: instructor <All Required> |
| get | **GET** /user/{instructor_id}/questionsets | Get all instructor question sets. | Authentication: user token, Authorization: instructor <All Required> |

## Courses

### Notes:
- {course_id} --> Path Parameters: course_id String
- {section_id} --> Path Parameters: section_id String
- "sections" is a string comprised of a list of strings [name].
- {lecture_id} --> Path Parameters: lecture_id String
- ["name"] is a list of Strings that are section names
- ["days"] is a list of Strings that are one of these enum values: ["mon", "tue", "wed", "thu", "fri"]
- "date" of format "YYYY-MM-DD"

|  Method | HTTP request | Description | Details |
| ------- | --------------- | -------------- | ---- |
| post | **POST** /course | Create a course. | Authentication: user token, Authorization: instructor, json --> "title", "sections" --> ["name"], "course_schedule" --> "semester", ["days"], and "time"  <All Required> |
| post | **POST** /course/students | Student joins course. | Authentication: user token, Authorization: student, json --> "section_key" <All Required> |
| post | **POST** /course/{course_id}/sections/{section_id}/students/ | Add student to course. | Authentication: user token, Authorization: instructor, json --> "username", "firstname", and "lastname" <All Required> |
| delete | **DELETE** /course/{course_id}/sections/{section_id}/students/{user_id}/ | Remove student from course. | Authentication: user token, Authorization: admin, instructor or self (student) <All Required> |
| get | **GET** /course/{course_id}/ | Get course info. | Authentication: user token, Authorization: instructor <All Required> |
| post | **POST** /course/{course_id}/lectures | Add course lectures. | Authentication: user token, Authorization: instructor, json --> "lecture_title", "lecture_schedule" --> ["day"], "date" <All Required> |
| post | **POST** /course/{course_id}/lectures | Get course lectures. | Authentication: user token, Authorization: instructor <All Required> |
| delete | **DELETE** /course/{course_id}/lectures/{lecture_id}/ | Delete course lecture. | Authentication: user token, Authorization: instructor <All required> |

## Lectures

### Notes:
- {question_id} --> Path Parameters: question_id String

|  Method | HTTP request | Description | Details |
| ------- | --------------- | -------------- | ---- |
| get | **GET** /lecture/{lecture_id}/ | Get lecture details. | Authentication: user token, Authorization: instructor <All Required> |
| post | **POST** /lecture/{lecture_id}/questions/{question_id}/ | Add question to lecture. | Authentication: user token, Authorization: instructor <All Required> |
| post | **POST** /lecture/{lecture_id}/questions{question_id}/reorder | Reorder lecture question. | Authentication: user token, Authorization: instructor, json --> "index" : Number <All Required> |
| delete | **DELETE** /lecture/{lecture_id}/questions{question_id}/ | Remove question. | Authentication: user token, Authorization: instructor <All Required> |
| post | **POST** /lecture/{lecture_id}/questionset | Save question set. | Authentication: user token, Authorization: instructor, json --> "title" <All Required> |
| post | **POST** /lecture/{lecture_id}/questionset/{questionSet_id}/ | Add question set to lecture. | Authentication: user token, Authorization: instructor <All Required> |
| post | **POST** /lecture/{lecture_id}/ | Edit lecture title or schedule. | Authentication: user token, Authorization: instructor, json --> "title" (Optional), "schedule" (Optional) --> ["day"], "date" |

## Questions

### Notes:
- ["tags"] is a String list of tags.

|  Method | HTTP request | Description | Details |
| ------- | --------------- | -------------- | ---- |
| post | **POST** /question | Create question. | Authentication: user token, Authorization: instructor, json --> "title", ["tags"], "html_title", "html_body", ["answer_choices"] <All Required> |
| get | **GET** /question?tag={query_string}/ | Get all question snapshots. | Authentication: user token, Query String: query_string String (Optional) |
| get | **GET** /question/{question_id}/ |  Get question, full details. | Authentication: user token, Authorization: instructor <All Required> |
| put | **PUT** /question/{question_id}/copy | Copy question from existing question. Backend only. | Authentication: user token, Authorization: instructor <All Required> |
| delete | **DELETE** /question/{question_id}/ | Delete question. | Authentication: user token, Authorization: instructor <All Required> |
| post | **POST** /questions/{question_id}/ | Edit question. | Authentication: user token, Authorization: instructor, json --> "title", ["tags"], "html_title", "html_body", and ["answer_choices"] <All Required> |
