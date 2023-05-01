import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import database from './db/connect.js';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
import { MongoClient } from 'mongodb'


dotenv.config();
const app = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL);
await client.connect();
app.use(express.json());
app.use(cors());
database();

app.get("/", function (request, response) {
    response.send("hello World😊😊😊");
});

app.get("/", cors(), (request, response) => {

});


//1.Mentor creation
app.post("/addmentor", async function (request, response) {
    const data = request.body;
    const mentorID = request.body.id
    console.log(data);
    const result = await client.db("basic").collection("Student-mentor").findOne({ id: mentorID })
    if (result) {
        response.status(404).send({ message: "Mentor Already Registered " })
    } else {
        const result = await client.db("basic").collection("Student-mentor").insertOne({ ...data })
        response.send(result)
    }
});


//2.Student creation
app.post("/addstudent", async function (request, response) {
    const data = request.body;
    const studentID = request.body.id
    const studentCheck = await client.db("basic").collection("StudentData").findOne({ id: studentID })
    if (studentCheck) {
        response.status(404).send({ message: "Student Already Registered " })
    } else {
        const result = await client.db("basic").collection("StudentData").insertOne({ ...data })
        response.send(result)
        console.log(result)
    }

});


//3.asign multiple student to mentor
app.put("/assignstudent/:id", async function (request, response) {

    const { id } = request.params;
    console.log(id)
    const studentID = request.body.studentID
    const data = await client.db("basic").collection("StudentData").find({ id: { $in: studentID } }).toArray();

    const bookingcheck = await client.db("basic").collection("Student-mentor").findOne({ id: id })

    if (bookingcheck) {

        const time = Date();
        const result = await
            client.db("basic")
                .collection("Student-mentor")
                .updateOne({ id: id }, { $push: { assignDetails: { ...data, time: time } } });
        console.log(result);

        if (result) {
            const updatestudentDetails = await
                client.db("basic")
                    .collection("Student-mentor")
                    .updateMany({ id: id }, { $set: { studentDetails: data } });

            console.log(updatestudentDetails);
        }
    }

    else {
        bookingcheck ? response.send(bookingcheck) : response.status(404).send({ message: "Mentor Not Found" })
    }
});


//4.asign one student to mentor
app.put("/assignOnestudent/:id", async function (request, response) {

    const { id } = request.params;
    console.log(id)
    const studentID = request.body.studentID
    const data = await client.db("basic").collection("StudentData").findOne({ id: { $in: studentID } });

    const bookingcheck = await client.db("basic").collection("Student-mentor").findOne({ id: id })

    if (bookingcheck) {

        const time = Date();
        const result = await
            client.db("basic")
                .collection("Student-mentor")
                .updateOne({ id: id }, { $push: { assignDetails: { ...data, time: time } } });
        console.log(result);

        if (result) {
            const updatestudentDetails = await
                client.db("basic")
                    .collection("Student-mentor")
                    .updateMany({ id: id }, { $set: { studentDetails: data } });

            console.log(updatestudentDetails);
            updatestudentDetails ? response.send(updatestudentDetails) : response.status(404).send({ message: "Update Failed " })
        }
    }

    else {
        result ? response.send(result) : response.status(404).send({ message: "Mentor Not Found" })
    }
});

//4.The student list does not have a mentor.
app.get("/studentListNoMentor", async function (request, response) {
    const data = request.body;
    console.log(data);
    const result = await client.db("basic").collection("StudentData").find({}).toArray();
    response.send(result)
});


//5.get all mentor details
app.get("/MentorList", async function (request, response) {
    const data = request.body;
    console.log(data);
    const result = await client.db("basic").collection("Student-mentor").find({}).toArray();
    response.send(result)
});


app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));