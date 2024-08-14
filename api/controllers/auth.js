import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import  User  from '../models/User.js';
import Company from '../models/Company.js';



// Unified login function for both User and Company
export const login = async (req, res) => {
   try {
      const { email, password } = req.body;

      // Try to find the user first
      let user = await User.findOne({ email });
      let userType = 'User';

      if (!user) {
         // If no user found, try to find the company
         user = await Company.findOne({ email });
         if (!user) return res.status(404).json({ message: 'User or Company not found' });
         userType = 'Company';
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });


      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: true, // Ensure this is set if using HTTPS
        sameSite: 'None',
        maxAge:24*60*60*60*60
      }).status(200).json({ auth: true, token, userType,user});
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};

// Register functions remain the same
export const registerUser = async (req, res) => {
   try {
      const { username, email, password, location, district, phone } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, email, password: hashedPassword, location, district, phone });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};

export const registerCompany = async (req, res) => {
   try {
      const { username, email, password, address, phone } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newCompany = new Company({ username, email, password: hashedPassword, address, phone });
      await newCompany.save();
      res.status(201).json({ message: 'Company registered successfully' });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};

// CheckAuth function to verify token from cookie
export const checkAuth = (req, res) => {
   const token = req.cookies.token;
   if (!token) return res.status(401).json({ message: 'No token provided' });

   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Invalid token' });

      res.status(200).json({ userType: decoded.userType, isAdmin: decoded.isAdmin });
   });
};

// Logout function to clear the cookie
export const logout = (req, res) => {
   res.clearCookie('token');
   res.status(200).json({ message: 'Logged out successfully' });
};
