export const validateSignup = (req, res, next) => {
    const { email, password } = req.body;
    const emailRegex = /^\S+@\S+\.\S+$/;
  
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
  
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
  
    next();
  };
  