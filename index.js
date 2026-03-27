require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    REST,
    Routes,
    PermissionsBitField,
} = require("discord.js");

// ===== CONFIG =====
const TOKEN = process.env.DISCORD_TOKEN;
const WELCOME_CHANNEL_ID = "1478830510435209396";

let autoRoleId = null;

// ===== CLIENT =====
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
    partials: [Partials.Channel],
});

// ===== READY =====
client.once("ready", async () => {
    console.log(`✅ Logged in as ${client.user.tag} 🌑`);

    const commands = [
        { name: "testwelcome", description: "Test welcome (Admin only)" },
        { name: "quote", description: "Get a quote" },
        { name: "astro", description: "Space fact" },
        { name: "rank", description: "Your rank" },
        { name: "roll", description: "Roll a dice" },
        { name: "coin", description: "Flip a coin" },
        { name: "rps", description: "Rock Paper Scissors" },
        { name: "8ball", description: "Ask the magic 8ball" },
        {
            name: "autorole",
            description: "Set or remove autorole (Admin only)",
            options: [
                {
                    name: "action",
                    description: "Choose to set or remove autorole", // ✅ REQUIRED
                    type: 3,
                    required: true,
                    choices: [
                        { name: "set", value: "set" },
                        { name: "remove", value: "remove" },
                    ],
                },
                {
                    name: "role",
                    description: "Role to give to new members", // ✅ REQUIRED
                    type: 8,
                    required: false,
                },
            ],
        },
    ];

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
    });

    console.log("✅ Slash commands ready");
});

// ===== CANVAS WELCOME IMAGE =====
async function createWelcomeCanvas(member) {
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 700, 250);
    gradient.addColorStop(0, "#000000");
    gradient.addColorStop(1, "#156177");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "36px sans-serif";
    ctx.fillText("Welcome to TIC 🌑 😁", 40, 100);
    ctx.fillText(member.user.username, 40, 160);

    const avatar = await Canvas.loadImage(
        member.displayAvatarURL({ extension: "png" })
    );

    ctx.beginPath();
    ctx.arc(600, 125, 60, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(avatar, 540, 65, 120, 120);

    return canvas.toBuffer();
}

// ===== SEND WELCOME =====
async function sendWelcome(member, channel) {
    // Autorole
    if (autoRoleId) {
        const role = member.guild.roles.cache.get(autoRoleId);
        if (role) await member.roles.add(role).catch(() => { });
    }

    const embed = new EmbedBuilder()
        .setTitle("👋 Welcome!")
        .setDescription(`Welcome ${member} 🌑`)
        .setColor(0x156177)
        .setFooter({ text: `Member #${member.guild.memberCount}` });

    const buffer = await createWelcomeCanvas(member);

    await channel.send({
        embeds: [embed.setImage("attachment://welcome.png")],
        files: [{ attachment: buffer, name: "welcome.png" }],
    });
}

// ===== MEMBER JOIN =====
client.on("guildMemberAdd", async (member) => {
    const channel = await member.guild.channels
        .fetch(WELCOME_CHANNEL_ID)
        .catch(() => null);

    if (channel) sendWelcome(member, channel);
});

// ===== SLASH COMMAND HANDLER =====
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const isAdmin = interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
    );

    // TEST WELCOME
    if (interaction.commandName === "testwelcome") {
        if (!isAdmin)
            return interaction.reply({ content: "❌ Admin only", ephemeral: true });

        const channel = await interaction.guild.channels.fetch(
            WELCOME_CHANNEL_ID
        );

        await sendWelcome(interaction.member, channel);

        return interaction.reply({ content: "✅ Sent!", ephemeral: true });
    }

    // AUTOROLE
    if (interaction.commandName === "autorole") {
        if (!isAdmin)
            return interaction.reply({ content: "❌ Admin only", ephemeral: true });

        const action = interaction.options.getString("action");
        const role = interaction.options.getRole("role");

        if (action === "set") {
            if (!role)
                return interaction.reply({
                    content: "⚠️ Select a role",
                    ephemeral: true,
                });

            autoRoleId = role.id;

            return interaction.reply({
                content: `✅ Auto-role set to ${role}`,
                ephemeral: true,
            });
        }

        autoRoleId = null;

        return interaction.reply({
            content: "❌ Auto-role removed",
            ephemeral: true,
        });
    }

    // FUN COMMANDS
    if (interaction.commandName === "roll")
        return interaction.reply(`🎲 ${Math.floor(Math.random() * 6) + 1}`);

    if (interaction.commandName === "coin")
        return interaction.reply(Math.random() < 0.5 ? "🪙 Heads" : "🪙 Tails");

    if (interaction.commandName === "rps") {
        const choices = ["Rock ✊", "Paper ✋", "Scissors ✌️"];
        return interaction.reply(
            `Bot chose: ${choices[Math.floor(Math.random() * 3)]}`
        );
    }

    if (interaction.commandName === "8ball") {
        const answers = ["Yes 🌑", "No ❌", "Maybe 🤔", "Ask later 🌌"];
        return interaction.reply(
            answers[Math.floor(Math.random() * answers.length)]
        );
    }

    if (interaction.commandName === "quote") {
        const quotes = [
            "🌙 Stay cosmic",
            "✨ Dream big",
            "🚀 Launch your legacy",
            "🌌 Infinite ambition",
            "💎 Pressure creates gems",
        ];
        return interaction.reply(
            quotes[Math.floor(Math.random() * quotes.length)]
        );
    }

    if (interaction.commandName === "astro") {
        const facts = [
            "🪐 Saturn would float in water",
            "🌌 Galaxy moving at 1.3 million mph",
            "☀️ Sun = 99.8% solar system mass",
            "🌑 Moon moving away from Earth",
            "🛰️ ISS orbits Earth every 90 minutes",
            '🔭 We can "hear" stars via radio waves',
        ];
        return interaction.reply(
            facts[Math.floor(Math.random() * facts.length)]
        );
    }

    if (interaction.commandName === "rank")
        return interaction.reply(
            `🌑 ${interaction.user.username}, Inner Circle member`
        );
});

// ===== LOGIN =====
client.login(TOKEN);
