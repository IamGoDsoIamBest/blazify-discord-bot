const { items } = require("../../utils/shop.js");
const Items = require("../../models/items.js");
const Coins = require("../../models/coin");

module.exports = {
    name: "buy",
    description: "Buy items",
    usage: "!buy <amt>",
    category: "economy",
    aliases: ["buy"],
    run: async (client, message, args) => {

        if (!args[0]) return message.channel.send("You need to specify an item name!");

        const itemName = args[0];
        const itemAmt = args[1] || 1;
        let item;

        items.forEach(x => {
            if (x.itemName.toLowerCase() === itemName.toLowerCase()) {
                item = x;
            };
        });

        if (!item) return message.channel.send("That item doesn't exist!");

        if (isNaN(itemAmt)) return message.channel.send("That isn't a valid amount!");

        const totalPrice = item.price * parseInt(itemAmt);

        await Coins.findOne({ userID: message.author.id }).then(async coins => {

            if (coins.coins < totalPrice) return message.channel.send("You don't have enough money!");

            await Items.findOne({ userID: message.author.id }).then(async user => {

                if (!user) {
                    const newUser = new Items({
                        userID: message.author.id
                    });
                    await newUser.save().catch(err => console.log(err));
                    user = newUser;
                };
    
                user[item.itemName] = user[item.itemName] + parseInt(itemAmt);
                await user.save().catch(err => console.log(err));

                coins.coins = coins.coins - totalPrice;
                await coins.save().catch(err => console.log(err));

                message.channel.send(`You bought ${itemAmt} ${itemName} for ${totalPrice}`);
            });
        });

    }
  };
  