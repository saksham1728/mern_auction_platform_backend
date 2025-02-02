export const generateToken = (user, message, statuscode, res) => {
    const token = user.generateJsonWebToken();

    // Convert COOKIE_EXPIRE from string to number
    const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 7; // Default to 7 if undefined

    res
        .status(statuscode)
        .cookie("token", token, {
            expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
            httpOnly: true,
        })
        .json({
            success: true,
            message,
            user,
            token,
        });
};
