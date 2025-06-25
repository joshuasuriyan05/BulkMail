const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config(); // for reading .env file

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.log("Failed to connect to MongoDB"));

// Use your MongoDB collection (replace "bulkmail" with your collection name)
const credential = mongoose.model("credential", {}, "bulkmail");

// POST /sendemail endpoint
app.post("/sendemail", async (req, res) => {
  const { msg, emailList } = req.body;

  try {
    const data = await credential.find();

    if (!data.length) {
      return res.status(500).send("No email credentials found");
    }

    const user = data[0].user;
    const pass = data[0].pass;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: user,
        to: emailList[i],
        subject: "A message from Bulk Mail App",
        text: msg,
      });

      console.log("Email sent to: " + emailList[i]);
    }

    res.send(true);
  } catch (error) {
    console.error("Error in /sendemail:", error);
    res.status(500).send(false);
  }
});

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
