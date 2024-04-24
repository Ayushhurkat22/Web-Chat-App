import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

// Controller function for user signup

export const signup = async (req, res) => {
	try {
		//console.log('entered');
		const { fullName, username, password, confirmPassword, gender } = req.body;

		if (password !== confirmPassword) {
			return res.status(400).json({ error: "Passwords don't match" });
		}

		const user = await User.findOne({ username });
		//console.log(user);
		if (user) {
			return res.status(400).json({ error: "Username already exists" });
		}

		// HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// https://avatar-placeholder.iran.liara.run/

		const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
		const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

		const newUser = new User({
			fullName,
			username,
			password: hashedPassword,
			gender,
			profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
		});
		//console.log(newUser);
		if (newUser) {
			// Generate JWT token here
			console.log(newUser)
			generateTokenAndSetCookie(newUser._id,newUser.username, res);
			await newUser.save();

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				profilePic: newUser.profilePic,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

// Controller function for user login

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		console.log('hey login');
		console.log(user);
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, user.username, res);
		
		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			profilePic: user.profilePic,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

// Controller function for user logout

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const loginVoicePrompt = async (req, res) => {
  try {
    // Simulate receiving voice response from the user
    const voiceResponse = req.body.voiceResponse.toLowerCase(); // Assuming the response is provided in the request body

    // Define a keyword that indicates visual impairment
    const visualImpairmentKeyword = 'yes';

    // Check if the response contains the keyword
    const isVisuallyImpaired = voiceResponse.includes(visualImpairmentKeyword);

    res.status(200).json({ visuallyImpaired: isVisuallyImpaired });
  } catch (error) {
    console.log("Error in loginVoicePrompt controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
