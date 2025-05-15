const { app, connectDb } = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    await connectDb();
    console.log(`Server is listening on port ${PORT}`);
});
