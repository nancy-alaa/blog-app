const express = require("express");
const mysql = require("mysql2");
const app = express();

const port = 3000;

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "BlogApp",
});

app.use(express.json());

connection.connect((err) => {
    if (err) {
        console.log({ Message: "Failed to connect to database", Error: err });
    } else {
        console.log({ Message: `Connected to database successfully!` });
    }
});

// -----------Get User----------------
app.get("/users", (req, res, next) => {
    connection.execute(
        `SELECT * FROM Users WHERE user_id=?`,
        [req.query.id],
        (err, result) => {
            if (err) {
                return res.status(400).json({ Message: "Quer Error!", Error: err });
            } else {
                console.log(result);

                return res.status(200).json({ Message: "DONE!", result });
            }
        }
    );
});

//-----------Sign Up------------------
app.post("/users/signup", (req, res, next) => {
    const { user_fName, user_lName, user_email, user_password, DOB, gender } = req.body;
    //------------- check if the email exists first ------------

    const findQuery = `SELECT user_email FROM Users WHERE user_email=?`;
    connection.execute(findQuery, [user_email], (err, result) => {
        if (err) {
            return res.status(400).json({ Message: "Query Error", Error: err });
        }
        console.log(result);
        if (result.length != 0) {
            return res.status(409).json({ Message: "User already exists!" });
        }
        else {
            const insertQuery = `INSERT INTO Users (user_fName, user_lName, user_email, user_password, DOB, gender) VALUES(?, ?, ?, ?, ?, ?)`;
            connection.execute(insertQuery, [
                user_fName,
                user_lName,
                user_email,
                user_password,
                DOB,
                gender,
            ], (err, result) => {
                if (err) {
                    if (err?.errno == 1062) {
                        return res.status(409).json({ Message: "User already exists!" });
                    }
                } else {
                    return res
                        .status(200)
                        .json({ Message: "User Added Successfully!", result });
                }
            });
        }
    });
});

//-----------Sign In------------------
app.post('/users/signin', (req, res, next) => {
    const { user_email, user_password } = req.body;
    const findQuery = `SELECT user_email, user_password FROM Users WHERE user_email=? and user_password=?`;
    connection.execute(findQuery, [user_email, user_password], (err, result) => {
        if (err) {
            return res.status(400).json({ Message: "Query Error!", Error: err });
        }
        if (result.length == 0) {
            return res.status(400).json({ Message: "Wrong email or password!" });
        }
        else {
            return res.status(200).json({ Message: "Logged in successfully!", User: result[0] });
        }
    });
});
//----------- Get Profile ------------------
app.get('/users/:id/profile', (req, res, next) => {
    const { id } = req.params;
    const findQuery = `SELECT 
    user_id, 
    user_email, 
    TIMESTAMPDIFF(YEAR, DOB, CURDATE()) AS user_age, 
    CONCAT(user_fName, " ", user_lName) as user_fullName 
    FROM Users WHERE user_id=?`;

    connection.execute(findQuery, [id], (err, result) => {
        if (err) {
            return res.status(400).json({ Message: "Query Error!", Error: err });
        }

        if (result.length == 0) {
            return res.status(404).json({ Message: "User not found!" });
        }
        else {
            return res.status(200).json({ Message: "DONE!", User: result[0] });
        }
    });
});
//----------- Search Users ------------------
app.get('/users/search', (req, res, next) => {
    const findQuery = `SELECT * FROM Users WHERE user_fName LIKE ? or user_lName LIKE ?`;

    // query where the first name contains the letter in the query, or last name starts with it
    connection.execute(findQuery, ["%" + req.query.name + "%", req.query.name + "%"], (err, result) => {
        if (err) {
            return res
                .status(400)
                .json({ Message: "Query Error!", Error: err });
        }
        else {
            return res.status(200).json({ Message: "DONE!", User: result });
        }
    });
});
//----------- Update User ------------------
app.patch('/users/update/:id', (req, res, next) => {
    const { gender } = req.body;
    const { id } = req.params;

    const updateQuery = `UPDATE Users SET gender=? WHERE user_id=?`;
    connection.execute(updateQuery, [gender, id], (err, result) => {
        if (err) {
            return res.status(400).json({ Message: "Query Error!", Error: err });
        }

        if (result.affectedRows == 0) {
            return res.status(404).json({ Message: "User not found!" });
        }
        else {
            return res.status(200).json({ Message: "User updated successfully!", User: result });
        }
    });
});
//----------- Delete User ------------------
app.delete('/users/delete/:id', (req, res, next) => {
    const { id } = req.params;
    const deleteQuery = `DELETE FROM Users WHERE user_id=?`;
    connection.execute(deleteQuery, [id], (err, result) => {
        if (err) {
            return res.status(400).json({ Message: "Query Error!", Error: err });
        }
        if (result.affectedRows == 0) {
            return res.status(404).json({ Message: "User not found!" });
        } else {
            return res.status(200).json({ Message: "User deleted successfully!" });
        }
    });
});

//===============================================================================

//--------------- Add Blog --------------------
app.post('/blogs', (req, res, next) => {
    const { blog_title, blog_description, user_id } = req.body;
    const insertQuery = `INSERT INTO Blogs (blog_title, blog_description, user_id) VALUES(?, ?, ?)`;
    const findUserQuery = `SELECT user_id FROM Users WHERE user_id=?`;

    connection.execute(findUserQuery, [user_id], (err, result) => {
        if (err) {
            return res.status(400).json({ Message: "Query Error!", Error: err });
        }
        else {
            if (result.length == 0) {
                return res.status(404).json({ Message: "User not found!" });
            }
            else {
                connection.execute(
                    insertQuery,
                    [blog_title, blog_description, user_id],
                    (err, result) => {
                        if (err) {
                            return res
                                .status(400)
                                .json({ Message: "Query Error!", Error: err });
                        } else {
                            return res
                                .status(200)
                                .json({ Message: "Blog added successfully", result });
                        }
                    }
                );
            }
        }
    })
});
//--------------- Get All Users With Blogs --------------------
app.get('/users/blogs', (req, res, next) => {
    const query = `SELECT * FROM Users INNER JOIN Blogs ON Users.user_id = Blogs.user_id`;
    connection.execute(query, (err, result) => {
        if (err) {
            return res.status(400).json({ Message: "Query Error!", Error: err });
        }
        else {
            return res.status(200).json({ Message: "DONE!", result });
        }
    });
});
//--------------- Update Blog, Make sure only the owner of the blog can update --------------------
app.patch('/users/:user_id/blogs/:blog_id', (req, res, next) => {
    const { user_id, blog_id } = req.params;
    const { blog_title, blog_description } = req.body;
    const findBlogQuery = `SELECT * FROM Blogs INNER JOIN users
                            ON Users.user_id = Blogs.user_id
                            WHERE Users.user_id = ? AND Blogs.blog_id = ?`;
    connection.execute(findBlogQuery, [user_id, blog_id], (err, result) => {
        if (err) {
            return res.status(400).json({ Message: "Query Error!", Error: err });
        }
        else {

            if (result.length == '0') {
                // user not found or blog not found or unauthorized user to edit the blog
                return res.status(400).json({ Message: "Something went wrong!" });
            }
            else {
                const updateBlogQuery = `UPDATE Blogs SET blog_title = ?, blog_description = ?
                                        WHERE blog_id = ? AND user_id = ?`;
                connection.execute(updateBlogQuery, [blog_title, blog_description, blog_id, user_id], (err, result) => {
                    if (err) {
                        return res.status(400).json({ Message: "Update Failed!" });
                    }
                    else {
                        return res
                            .status(200)
                            .json({ Message: "Blog update sucessfully!", Blog: result });
                    }
                });
            }
        }
    });
});

//--------------- Delete Blog -Make sure only the owner of the blog can delete --------------------
app.delete('/users/:user_id/blogs/:blog_id', (req, res, next) => {
    const { user_id, blog_id } = req.params;
    const findBlogQuery = `SELECT * FROM Blogs INNER JOIN Users
                            ON Users.user_id = Blogs.user_id
                            WHERE Users.user_id = ?  AND Blogs.blog_id = ?`;
    connection.execute(findBlogQuery, [user_id, blog_id], (err, result) => {
        if (err) {
            return res.status(400).json({ Message: "Query Error", Error: err });
        }
        else {
            if (result.length == 0) {
                return res.status(400).json({ Message: "Someting went wrong! user or blog not found" });
            }
            else {
                const deleteBlogQuery = `DELETE FROM Blogs
                                            WHERE user_id = ? AND blog_id = ?`;
                connection.execute(deleteBlogQuery, [user_id, blog_id], (err, result) => {
                    if (err) {
                        return res.status(400).json({ Message: "Failed to delete the blog!" });
                    }
                    else {
                        return res
                            .status(200)
                            .json({ Message: "Blog deleted sucessfully!", result });
                    }
                })
            }
        }
    })
})



app.listen(port, () => console.log(`Example app listening on port ${port}!`));
