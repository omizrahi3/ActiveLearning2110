

Active Learning 2110 is a Junior Design Project at Gatech. The application is a learning companion allowing students and instructors to interact during course lectures.

# Features

- **Content Creation** -- Active Learning 2110 offers a wide range of content creation.

  - Create Course- Instructors can create courses with titles, sections, schedules. Additionally, Instructors can easily add students to their course.
  - Create Lecture- Instructors can add lectures to courses. Lectures can be created with titles, schedule and questions.
  - Create Questions- Instructors can create questions using our custom Question Creation Tool.

- **Live Interactive Lectures** -- Each lecture offers an interactive session between the instructor and students to take place during the in class lecture.

  - Questions - Instructors can post questions that will be answered by students.
  - Live Timer - Each question will have a timer that all students must answer the question by.
  - Live Results - System displays student average responses and scores after time out has expired.

- **Student Data** -- Instructors can view and export student lecture data. Students can look up their results on a lecture by lecture basis.

# Getting Started with Active Learning 2110

Getting started with Active Learning 2110 is super easy! Be sure to have all necessary prerequisites installed and simply clone the projects master branch.

## Prerequisites

You're going to need the following installed:

- **Node.js**
- **MongoDB**

## Getting Set Up / Install Guide

Clone the repository:

```bash
git clone https://github.com/omizrahi3/ActiveLearning2110.git
```

Install the application:

```bash
From project root directory: npm install
```

Start MongoDB:

```bash
mongod
```

Start the server:

```bash
From project root directory: node server.js
```

View in browser at

```bash
http://localhost:8081
```

# REST API Documentation

[API DOCS](config/dev/Documentation.md)

# Release Notes

**Supported Browsers:** Safari, Chrome, Firefox, Edge. IE is not supported and never will be (get a real browser).<br><br>
**Current Bugs:**
- Bug on firefox for live lectures. The join button doesn't always show
- Edit previously created questions do not get updated in lectures that refer to them.
- Bug 3

# Need Help? Found a bug?

[Submit an issue](https://github.com/omizrahi3/activelearning2110/issues) to the Active Learning 2110 Github if you need any help.

# Contributors

Active Learning 2110 was built by [Odell Mizrahi](https://github.com/omizrahi3), [Jeremy Carter](https://github.com/schoolboyqueue), [Amy Zhuang](https://github.com/azhuang3), [Amy Fang](https://github.com/xfang37), [Kelsey Maclin](https://github.com/kmaclin) during the Fall 2016 and Spring 2017 semesters.
