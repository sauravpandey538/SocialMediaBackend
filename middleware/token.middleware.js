import jwt from "jsonwebtoken"
// veryfying access token

export const verifyAccessToken = (req, res, next) => {
    const accessTokenByCookie = req.cookies.accessToken;

    if (!accessTokenByCookie) {
        return res.status(401).json({ error: "Access Token didn't find." });
    }

    try {
        const decoded = jwt.verify(accessTokenByCookie, process.env.JWT_ACCESS_PASSWORD);
        req.user = decoded; // stores id of user from token
        next();
    } catch (error) {
        console.error('JWT Verify Error:', error);
        return res.status(403).json({ error: "Access token is invalid or expired." });
    }
};


// export const verifyRefreshToken = (req,res,next)=>{
//     const refreshTokenByCookie = req.cookies.refreshToken;
//     if(!refreshTokenByCookie) { return res.status(401).json({error: "Refresh Token didnt find."}) }
//     try{
//         const decoded = jwt.verify(refreshTokenByCookie, process.env.JWT_REFRESH_PASSWORD)
//         req.user = decoded;
//         next();
//     }
//     catch(error){
//         return res.status(403).json({error:"Refresh token is invalid or expired."})
//     }
// }

// note: cookies must be names accessToken and refreshToken respectively.