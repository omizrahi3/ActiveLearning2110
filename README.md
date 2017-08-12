

Active Learning is a Junior Design Project at Gatech. The application offers instructors a tool to engage their students in activities that promote analysis and evaluation of class-content.

# Features

- **Create Questions** -- Dynamic question creation tool for engaging content. Custom build your questions with numerous features. Each step made simpler through Active Learning.

  - Easy to use Question Creation Editor
  - Multiple Question Types
  - Embed Photos/Videos
  - Searchable Tags
  - Public/Private feature

<p align="center"><img src="https://image.ibb.co/gLCjAk/Content1_Desktop.png" width=450></p>


- **Course and Lecture Management** -- Easily create and manage all aspects of course and lectures.

  - Create courses with with specific sections and schedules.
  - Create course key for students to easily join course or add students directly through csv file import. Check the status of student registration and remove students from course at any time.
  - Create lectures with specific dates and add, remove, reorder questions.
  - Import and export question sets easily from one lecture to another, across courses.

<p align="center"><img src="https://image.ibb.co/cOKmO5/manage.png" width=450></p>

- **Live Lectures** -- Intuitive lecture tool allowing real time interaction. Connect with students, post questions and watch the results come all in real time.

  - Instructor Preview Questions.
  - Dynamic timer - increase or decrease time.
  - Student live results.
  - Instructor live total class results.

<p align="center"><img src="https://image.ibb.co/b5Orqk/livelecture2.png" width=450></p>

- **Analyze Results** -- Determine class impact and get reports on relevant data. Discover what class concepts are working - and which need more solidifying - with a view of class and student results.

  - Course Averages.
  - Instructor total student lecture results.
  - Student individual lecture results.

<p align="center"><img src="https://image.ibb.co/nENjAk/livelecture.png" width=450></p>

# Release Notes

- **New Software Features** -- Active Learning was built from scratch. The main features implemented are the features listed above.

- **Known Bugs and defects** -- The following list contains all known bugs and defects. Keep in mind Active Learning currently supports only Safari, Chrome, Firefox and Edge browsers. All functionality promised to customer was implemented.

  - Student live lecture join button does not currently always show up on Firefox broswer.
  - When a student updates their profile information (name) the data does not always show correctly on the instructor manage students page.
  - Edit previously created questions do not get updated in lectures that refer to them.



# Install Guide

Active Learning is a MEAN stack application (Node, Express, Angular, MongoDB) which makes installation a very simple process. Just follow these instructions.

## Pre-requisites

You're going to need the following installed:

- **Node.js**
- **MongoDB**

## Dependent libraries

Since Active Learning is a Node application all dependencies will be installed automatically. Here is a list of the third party libraries/modules used, which are all open sourced.

- **express**
- **mongoose**
- **socket.io**
- **socketio-jwt**
- **winston**
- **jsonwebtoken**
- **bcryptjs**
- **body-parser**
- **cookie-parser**

## Download Instructions

Clone the repository:

```bash
git clone https://github.com/omizrahi3/ActiveLearning2110.git
```

## Installation

Install the application:

```bash
From project root directory: npm install
```

## Run Instructions

Start MongoDB:

```bash
mongod
```

Start the server:

```bash
From project root directory: node server
```

View in browser at

```bash
http://localhost:8081
```

# REST API Documentation

[API DOCS](config/dev/Documentation.md)

# Need Help? Found a bug?

[Submit an issue](https://github.com/omizrahi3/activelearning2110/issues) to the Active Learning 2110 Github if you need any help.

# Contributors

Active Learning was built by [Odell Mizrahi](https://github.com/omizrahi3), [Jeremy Carter](https://github.com/schoolboyqueue), [Amy Zhuang](https://github.com/azhuang3), [Amy Fang](https://github.com/xfang37), [Kelsey Maclin](https://github.com/kmaclin) during the Fall 2016 and Spring 2017 semesters.
