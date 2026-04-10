const { OAuth2Client } = require("google-auth-library");
var jwt = require("jsonwebtoken");
const User = require("../model/user.model");
require("dotenv").config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handleGoogleSignInController = async (req, res) => {
  try {
    const { token } = req.body;
    console.log("Received Google ID Token:", token);
    if (!token) {
      return res.status(400).json({ message: "Token missing", success: false });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload?.email_verified) {
      return res.status(400).json({
        message: "Invalid token or email not verified",
        success: false,
      });
    }

    const alreadyExistUser = await User.findOne({
      email: payload.email,
    });

    if (alreadyExistUser) {
      const jwtToken = jwt.sign(
        { email: alreadyExistUser.email, id: alreadyExistUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );
      alreadyExistUser.token = jwtToken;
      await alreadyExistUser.save();
      return res.status(200).json({
        message: "User signed in successfully",
        success: true,
        user: {
          email: alreadyExistUser.email,
          name: alreadyExistUser.name,
          profileUrl: alreadyExistUser.profileUrl,
          token: alreadyExistUser.token,
        },
      });
    }

    const jwtToken = jwt.sign(
      { email: payload.email, id: payload.sub },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const newUser = new User({
      email: payload.email,
      name: payload.name,
      profileUrl: payload.picture,
      token: jwtToken,
    });

    await newUser.save();

    res.status(200).json({
      message: "User signed in successfully",
      success: true,
      user: {
        email: newUser.email,
        name: newUser.name,
        profileUrl: newUser.profileUrl,
        token: newUser.token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

module.exports = {
  handleGoogleSignInController,
};
