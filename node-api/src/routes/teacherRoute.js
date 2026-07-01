function teacherRoute(app) {
    app.get('/api/v1/teacher', (req, res) => {
        res.send("Hello Teacher");
    });

    app.get('/api/v1/teacher/create', (req, res) => {
        res.send("Hello create Teacher");
    });
}

// export default teacherRoute;
module.exports = teacherRoute;