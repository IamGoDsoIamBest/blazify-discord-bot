const Route = require("../lib/Route");

module.exports = class extends Route {
  constructor() {
    super("/api/callback");
  }

  async run(bot, app, req, res) {
    const { code } = req.query;
    if (!code) return res.json({ success: false, error: "Code not found!" });
    let token;
    try {
      token = await bot.oauth.tokenRequest({
        code,
        scope: "identify guilds",
        grantType: "authorization_code",
      });
    } catch (e) {
      res.redirect(
        bot.oauth.generateAuthUrl({ scope: ["identify", "guilds"] })
      );
    }
    if (!token || !token.access_token)
      return res.json({
        success: false,
        error: "Couldn't get the access token!",
      });

    res.redirect(
      `/dashboard?access_token=${token.access_token}&refresh_token=${token.refresh_token}`
    );
  }
};