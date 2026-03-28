require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  REST,
  Routes,
} = require("discord.js");

// ===== CONFIG =====
const TOKEN = process.env.DISCORD_TOKEN;
const WELCOME_CHANNEL_ID = "1486123113996484731";

// 👉 IMAGE LINK
const WELCOME_IMAGE ="https://media.discordapp.net/attachments/1457718615162748959/1487144141887373495/Untitled439_20260327183407.png?ex=69c8bb29&is=69c769a9&hm=87f8e931473ecb40f368874aa349cd64a3ba1e436380914cb720576d83349518&=&format=webp&quality=lossless&width=1860&height=626";

let autoRoleId = null;

// ===== CLIENT =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// ===== READY =====
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

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
      description: "Set or remove autorole",
      options: [
        {
          name: "action",
          description: "Choose action",
          type: 3,
          required: true,
          choices: [
            { name: "set", value: "set" },
            { name: "remove", value: "remove" },
          ],
        },
        {
          name: "role",
          description: "Select role",
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

  console.log("✅ Slash commands registered");
});

// ===== WELCOME FUNCTION =====
async function sendWelcome(member, channel) {
  // Auto role
  if (autoRoleId) {
    const role = member.guild.roles.cache.get(autoRoleId);
    if (role) await member.roles.add(role).catch(() => {});
  }

  const embed = new EmbedBuilder()
    .setTitle("👋 Welcome!")
    .setDescription(
      `Welcome ${member} 🌑\nYou are member #${member.guild.memberCount}`
    )
    .setColor(0x156177)
    .setImage(WELCOME_IMAGE);

  await channel.send({ embeds: [embed] });
}

// ===== MEMBER JOIN =====
client.on("guildMemberAdd", async (member) => {
  const channel = await member.guild.channels
    .fetch(WELCOME_CHANNEL_ID)
    .catch(() => null);

  if (channel) sendWelcome(member, channel);
});

// ===== COMMAND HANDLER =====
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const isAdmin = interaction.member.permissions.has(
    PermissionsBitField.Flags.Administrator
  );

  if (interaction.commandName === "testwelcome") {
    if (!isAdmin)
      return interaction.reply({ content: "❌ Admin only", ephemeral: true });

    const channel = await interaction.guild.channels.fetch(
      WELCOME_CHANNEL_ID
    );

    await sendWelcome(interaction.member, channel);
    return interaction.reply({ content: "✅ Sent!", ephemeral: true });
  }

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
