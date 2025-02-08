# Sequelize Relationship Documentation

## Introduction
Sequelize is a powerful ORM for Node.js that supports various relationships between models. This document provides an overview of Sequelize relationships and the instance methods that come with them.

---

## **1. Sequelize Relationships Overview**

### **One-to-One (`hasOne`, `belongsTo`)**
- **Example:** A user has one profile, and a profile belongs to a user.
```javascript
User.hasOne(Profile, { foreignKey: 'userId', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId' });
```

### **One-to-Many (`hasMany`, `belongsTo`)**
- **Example:** A user has many posts, and a post belongs to one user.
```javascript
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });
```

### **Many-to-Many (`belongsToMany`)**
- **Example:** A student can enroll in multiple courses, and a course can have multiple students.
```javascript
Student.belongsToMany(Course, { through: Enrollment });
Course.belongsToMany(Student, { through: Enrollment });
```

---

## **2. Instance Methods from Relationships**
Sequelize automatically generates association methods based on relationships.

### **For `hasOne` Relationship**
| Method | Description |
|--------|------------|
| `user.getProfile()` | Retrieve associated profile |
| `user.setProfile(profile)` | Associate a profile with the user |
| `user.createProfile({ ... })` | Create and associate a profile |

### **For `hasMany` Relationship**
| Method | Description |
|--------|------------|
| `user.getPosts()` | Retrieve all posts associated with a user |
| `user.addPost(post)` | Associate an existing post with a user |
| `user.addPosts([post1, post2])` | Associate multiple posts with a user |
| `user.setPosts(posts)` | Replace existing posts with new ones |
| `user.createPost({ ... })` | Create and associate a new post |

### **For `belongsToMany` Relationship**
| Method | Description |
|--------|------------|
| `student.getCourses()` | Get all courses linked to a student |
| `student.addCourse(course)` | Associate an existing course with a student |
| `student.addCourses([course1, course2])` | Associate multiple courses with a student |
| `student.setCourses(courses)` | Replace existing courses with new ones |
| `student.createCourse({ ... })` | Create and associate a new course |
| `student.removeCourse(course)` | Remove an association between a student and a course |
| `student.hasCourse(course)` | Check if a student is associated with a specific course |

---

## **3. Example: Using Association Methods**

### **One-to-Many Example (User and Posts)**
```javascript
const user = await User.findByPk(1);
const post = await Post.create({ title: 'Sequelize Guide', content: 'Learn Sequelize relationships' });
await user.addPost(post); // Associate post with user
```

### **Many-to-Many Example (Student and Courses)**
```javascript
const student = await Student.findByPk(1);
const course = await Course.findByPk(3);

// Add an existing course to student
await student.addCourse(course);

// Create a new course and associate it with student
await student.createCourse({ name: 'Mathematics', duration: '6 months' });
```

---

## **4. Difference Between `.addCourse()` and `.createCourse()` in Sequelize**

| Method | Description |
|--------|------------|
| `.addCourse(course)` | Associates an **existing** course with a student. The course must already exist in the database. |
| `.createCourse({ ... })` | Creates a **new** course and automatically associates it with the student. |

### **Example:**
```javascript
const student = await Student.findByPk(1);
const existingCourse = await Course.findByPk(2);
await student.addCourse(existingCourse); // Link an existing course

await student.createCourse({ name: 'Physics', duration: '4 months' }); // Create and link a new course
```

---

## **5. Additional Notes**
- Sequelize automatically generates these methods based on model relationships.
- The `through` table in `belongsToMany` represents the pivot table for many-to-many relationships.
- You can use `include` for eager loading when retrieving related records.

---

## **6. References**
- [Sequelize Official Documentation](https://sequelize.org/docs/v6/)
- [Sequelize Associations](https://sequelize.org/docs/v6/advanced-association/)

---

This document serves as a guide for Sequelize relationships and their corresponding instance methods. 🚀

