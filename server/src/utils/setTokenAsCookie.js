const setTokenAsCookie = (res, token) => {
  res.cookie("orca", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default setTokenAsCookie;
