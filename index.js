import { Client, GatewayIntentBits, Partials, EmbedBuilder, REST, Routes, PermissionsBitField } from "discord.js";
import dotenv from "dotenv";
import Canvas from "canvas";

dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;

let autoRoleId = null; // dynamic autorole

// ===== CLIENT =====
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ],
    partials: [Partials.Channel]
});

// ===== READY =====
client.once("ready", async () => {
    console.log(`✅ Logged in as ${client.user.tag} (LUNA's GATE by TIC 🌑)`);

    const commands = [
        { name: "testwelcome", description: "Test welcome (Admin only)" },
        { name: "quote", description: "Get a quote" },
        { name: "astro", description: "Space fact" },
        { name: "rank", description: "Your rank" },
        { name: "roll", description: "Roll a dice" },
        { name: "coin", description: "Flip a coin" },
        { name: "rps", description: "Rock Paper Scissors" },
        { name: "8ball", description: "Ask the 8ball" },
        {
            name: "autorole",
            description: "Set/remove autorole (Admin only)",
            options: [
                {
                    name: "action",
                    type: 3,
                    required: true,
                    choices: [
                        { name: "set", value: "set" },
                        { name: "remove", value: "remove" }
                    ]
                },
                {
                    name: "role",
                    type: 8,
                    required: false
                }
            ]
        }
    ];

    const rest = new REST({ version: "10" }).setToken(TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });

    console.log("✅ Slash commands ready");
});

// ===== CANVAS IMAGE =====
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
    ctx.fillText(member.username, 40, 160);
  ctx.shadowColor = "#156177";
ctx.shadowBlur = 20;

    const avatar = await Canvas.loadImage(member.displayAvatarURL({ extension: "png" }));

    ctx.beginPath();
    ctx.arc(600, 125, 60, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 540, 65, 120, 120);

    return canvas.toBuffer();
}

// ===== WELCOME EMBED =====
async function sendWelcome(member, channel) {
    // autorole
    if (autoRoleId) {
        const role = member.guild.roles.cache.get(autoRoleId);
        if (role) await member.roles.add(role).catch(() => {});
    }

    const embed = new EmbedBuilder()
        .setTitle("👋 Welcome!")
        .setDescription(`Welcome to TIC 🌑 😁 Make sure to invite your friends, ${member}!`)
        .setColor(0x156177)
        .setFooter({ text: `You are member #${member.guild.memberCount}` });

    const buffer = await createWelcomeCanvas(member);
    embed.setImage("attachment://welcome.png");

    await channel.send({
        embeds: [embed],
        files: [{ attachment: buffer, name: "welcome.png" }]
    });
}

// ===== MEMBER JOIN =====
client.on("guildMemberAdd", async (member) => {
    const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID).catch(() => null);
    if (!channel) return;
    sendWelcome(member, channel);
});

// ===== COMMANDS =====
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

    // ===== ADMIN COMMANDS =====
    if (interaction.commandName === "testwelcome") {
        if (!isAdmin) return interaction.reply({ content: "❌ Admin only!", ephemeral: true });

        const channel = await interaction.guild.channels.fetch(WELCOME_CHANNEL_ID);
        await sendWelcome(interaction.user, channel);
        return interaction.reply({ content: "✅ Sent!", ephemeral: true });
    }

    if (interaction.commandName === "autorole") {
        if (!isAdmin) return interaction.reply({ content: "❌ Admin only!", ephemeral: true });

        const action = interaction.options.getString("action");
        const role = interaction.options.getRole("role");

        if (action === "set") {
            if (!role) return interaction.reply({ content: "⚠️ Select a role!", ephemeral: true });
            autoRoleId = role.id;
            return interaction.reply({ content: `✅ Auto-role set to ${role}`, ephemeral: true });
        }

        if (action === "remove") {
            autoRoleId = null;
            return interaction.reply({ content: "❌ Auto-role removed", ephemeral: true });
        }
    }

    // ===== FUN COMMANDS =====
    if (interaction.commandName === "roll") {
        return interaction.reply(`🎲 You rolled ${Math.floor(Math.random() * 6) + 1}`);
    }

    if (interaction.commandName === "coin") {
        return interaction.reply(Math.random() < 0.5 ? "🪙 Heads" : "🪙 Tails");
    }

    if (interaction.commandName === "rps") {
        const choices = ["Rock ✊", "Paper ✋", "Scissors ✌️"];
        return interaction.reply(`Bot chose: ${choices[Math.floor(Math.random() * 3)]}`);
    }

    if (interaction.commandName === "8ball") {
        const answers = ["Yes 🌑", "No ❌", "Maybe 🤔", "Ask later 🌌"];
        return interaction.reply(answers[Math.floor(Math.random() * answers.length)]);
    }

    if (interaction.commandName === "quote") {
        const quotes = ["🌙 Stay cosmic", "✨ Dream big", "🌌 Explore the unknown", "🚀 Fuel your fire", "✨ Ignite your soul", "🌌 Own your destiny", "🪐 Conquer the gravity", "🔭 Aim for the infinite", "☄️ Be the impact", "🌠 Chase the impossible", "🛰️ Rise above noise", "💎 Forge your path", "🧿 Master your fate", "🌑 Find light within", "🌖 Growing every day", "⚡ Power your dreams", "🛸 Defy all limits", "🌙 Outshine the dark", "🪐 Built to last", "✨ Radiant by nature", "🚀 Launch your legacy", "🌌 Boundless potential", "🔭 Visualize the win", "☄️ Blazing new trails", "💎 Pressure creates gems", "🧿 Focus on growth", "🌠 Catch your moment", "🌑 Stillness is strength", "🌖 Leveling up", "⚡ Shock the world", "🛸 Leave the ground", "🌙 Glow through phases", "🪐 Center of excellence", "✨ Spark the change", "🚀 Driven to lead", "🌌 Space for greatness", "🔭 Vision of victory", "☄️ Unstoppable force", "💎 Polished for success", "🧿 Insight leads action", "🌠 Make history", "🌑 Reset and rise", "🌖 Light the way", "⚡ Energy of champions", "🛸 Soar past doubt", "🌙 Rule your night", "🪐 Solid as stone", "✨ Shine without apology", "🚀 Mission-ready mind", "🌌 Infinite ambition", "🔭 Look toward truth", "☄️ Strike with purpose", "💎 Rare and resilient", "🧿 Aligned for success", "🌠 Believe the hype", "🌑 Depth is power", "🌖 Halfway to whole", "⚡ High-voltage will", "🛸 Beyond the barrier", "🌙 Quietly blooming", "🪐 Orbiting victory", "✨ Leave your mark", "🚀 Breakthrough coming", "🌌 Eternal evolution", "🔭 Sharp and steady", "☄️ Burn with passion", "💎 Unbreakable spirit", "🧿 Guided by grit", "🌠 Manifest the best", "🌑 Silence the ego", "🌖 Rise with the tide", "⚡ Pure momentum", "🛸 Higher perspective", "🌙 Moonlit courage", "🪐 Steady in motion", "✨ Be the supernova", "🚀 Ascend the peak", "🌌 Create your cosmos", "🔭 Beyond the glass", "☄️ Speed toward dreams", "💎 Worth the wait", "🧿 Trust the process", "🌠 Falling for growth", "🌑 Roots in stardust", "🌖 Brightness ascending", "⚡ Spark of daring", "🛸 Travel with intent", "🌙 Nightly resilience", "🪐 King of your world", "✨ Golden frequency", "🚀 Ready for takeoff", "🌌 Endless horizons", "🔭 Focus on forward", "☄️ Bold and bright", "💎 Cutting through dark", "🧿 Vision is everything", "🌠 Shooting for legend", "🌑 Peace is progress", "🌖 Keep on climbing", "⚡ Electrify the room", "🛸 New world mindset", "🌙 Lunar tenacity", "🪐 Master the spin"];
        return interaction.reply(quotes[Math.floor(Math.random() * quotes.length)]);
    }

    if (interaction.commandName === "astro") {
        const facts = ["### 🪐 Saturn's density: The planet is so light it would float in water","### 💎 Diamond rain: High pressure on Neptune turns carbon into solid diamonds","### 🤫 Space silence: Without air to carry sound waves the universe is silent","### ⏳ Time dilation: Gravity on massive planets like Jupiter makes time tick slower","### 🌌 Milky Way speed: Our galaxy is racing through the void at 1.3 million mph","### 🍓 Galaxy flavor: The center of space contains chemicals that taste like raspberries","### 🌑 Moon footprints: With no wind or water lunar tracks last for millions of years","### 🔭 Light travel: The starlight you see tonight is often thousands of years old","### 🌠 Star stuff: Every atom in your body was once forged inside a dying star","### ☀️ Sun's mass: The sun contains 99.8% of all the matter in our solar system","### 🛰️ Space debris: Over 100 million pieces of man-made junk orbit the Earth","### ☄️ Comet tails: A comet's tail always points directly away from the sun","### ✨ Neutron stars: A single teaspoon of this star material weighs 6 billion tons","### 🛸 Great Attractor: A mysterious force is pulling our galaxy toward a hidden point","### 🚀 Voyager mission: The furthest man-made object is 15 billion miles away","### 🌑 Dark matter: About 85% of the universe is made of stuff we cannot see","### 🌡️ Extreme heat: A supernova can reach temperatures of 100 billion degrees","### 🌌 Infinite growth: The universe is expanding faster every single second","### 🪐 Venus rotation: A single day on Venus is longer than its entire year","### 🚀 Artemis 2026: Humans are scheduled to return to lunar orbit this year","### ☀️ Solar wind: Particles from the sun travel at speeds of 1 million mph","### 💎 Carbon stars: Some stars are essentially giant floating diamonds","### 🌌 Milky Way collision: Our galaxy will merge with Andromeda in 4 billion years","### 🔭 Deep field: The Hubble telescope saw 10,000 galaxies in one tiny patch of sky","### 🌍 Earth's shield: Our magnetic field protects us from deadly solar radiation","### 🌑 Lunar cycle: The moon is moving away from Earth by 1.5 inches every year","### 🪐 Jupiter's storm: The Great Red Spot is a hurricane larger than Earth itself","### 🔭 Exoplanets: Scientists have discovered over 5,000 planets outside our system","### ☄️ Oort Cloud: A giant shell of icy objects surrounds our entire solar system","### ✨ Pulsars: These spinning stars can rotate hundreds of times per second","### 🚀 Rocket fuel: Most of a rocket's weight is just the fuel needed to lift it","### 🌌 Black holes: Not even light can escape their gravitational pull","### 🛰️ ISS speed: The Space Station circles the entire Earth every 90 minutes","### 🌡️ Absolute zero: The coldest possible temperature is -273.15 degrees Celsius","### ☀️ Sunlight age: It takes 8 minutes and 20 seconds for light to reach Earth","### 🌑 Titan's lakes: Saturn's moon has lakes made of liquid methane and ethane","### 🪐 Uranus tilt: The planet rotates on its side like a rolling ball","### 🔭 Gravitational waves: Ripples in space-time caused by massive cosmic collisions","### 🌠 Meteor showers: These occur when Earth passes through a comet's debris trail","### 🌍 Gold origin: Almost all gold on Earth came from colliding neutron stars","### 🌌 Cosmic microwave: The afterglow of the Big Bang is still detectable today","### 🚀 Escape velocity: You must travel 25,020 mph to break Earth's gravity","### ☀️ Sun's color: The sun is actually white but looks yellow through our air","### 🌑 Far side: The moon is tidally locked so we only ever see one side of it","### 🪐 Mars dust: Giant dust storms can cover the entire planet for months","### ✨ White dwarfs: These are the cooled remains of stars like our sun","### 🔭 Nebula clouds: Giant clouds of gas where new stars are born","### 🌌 Local group: Our galaxy is part of a cluster of about 50 other galaxies","### 🛰️ GPS relativity: Satellites must adjust their clocks because time moves faster there","### 🌡️ Venus heat: It is the hottest planet because of its thick greenhouse gas","### ☄️ Halley's Comet: It only visits Earth once every 75 to 76 years","### 🚀 Mars water: Frozen water exists under the dusty surface of the red planet","### 🌑 Moon's gravity: You would weigh only one-sixth of your Earth weight there","### ☀️ Prominences: Massive loops of gas that jump off the sun's surface","### 🌌 Dark energy: A force making up 68% of the universe pushing things apart","### 🔭 Radio astronomy: We can "hear" stars by detecting their radio waves","### ✨ Binary stars: Most stars in the universe actually come in pairs","### 🌍 Atmosphere layers: Space officially begins at the Karman Line 62 miles up","### 🪐 Saturn's rings: They are made of 99% pure water ice and some dust","### 🚀 Ion engines: High-tech thrusters that use electricity to move through space","### 🌑 Eclipse shadow: A solar eclipse shadow travels at over 1,000 mph","### 🌌 Visible matter: Everything we see only makes up 5% of the universe","### 🔭 James Webb: This telescope can see the very first stars ever formed","### ☄️ Asteroid belt: Most asteroids live between the orbits of Mars and Jupiter","### 🛰️ Sputnik 1: The first man-made object in space stayed up for 3 months","### 🌡️ Cold welding: In a vacuum two pieces of metal will stick together instantly","### ☀️ Core pressure: The sun's center is 250 billion times the pressure of Earth","### 🌑 Lunar dust: It smells like spent gunpowder according to Apollo astronauts","### 🪐 Magnetic Jupiter: Its magnetic field is 20,000 times stronger than Earth's","### ✨ Stellar nurseries: The Orion Nebula is the closest place where stars form","### 🚀 Moon distance: You could fit every planet in the solar system between Earth and Moon","### 🌌 Quasars: The brightest objects in the universe powered by black holes","### 🔭 Parallax: A method of measuring star distance by looking from two sides","### 🌍 Tectonic plates: Earth is the only planet known to have active plate tectonics","### 🌑 Europa's ocean: This moon likely has twice as much water as Earth","### 🪐 Mercury's core: Iron makes up about 75% of this small planet's radius","### ☄️ Chicxulub: The asteroid that killed dinosaurs was 6 miles wide","### ✨ Red giants: When our sun dies it will expand and swallow Earth","### 🚀 Pluto's heart: The large heart-shaped region is a giant glacier of nitrogen","### 🌌 Cosmic void: The Boötes Void is a massive empty space with few galaxies","### 🔭 Spectroscopy: Using light to figure out what chemicals are on distant planets","### 🌍 Blue marble: The first full photo of Earth was taken by Apollo 17","### 🌑 Blood moon: During a lunar eclipse Earth's air scatters red light onto the moon","### 🪐 Great Conjunction: When Jupiter and Saturn appear very close in our sky","### ☄️ Shooting stars: Most are just the size of a single grain of sand","### ✨ Gamma bursts: The most powerful explosions in the universe since the Big Bang","### 🚀 Light sail: A spacecraft pushed through the void by the pressure of sunlight","### 🌌 Galaxy center: A supermassive black hole named Sagittarius A* lives there","### 🛰️ CubeSats: Tiny satellites the size of a loaf of bread used for research","### 🌡️ Kelvin scale: Scientists use this to measure the extreme heat of stars","### ☀️ Solar cycle: The sun's magnetic poles flip every 11 years","### 🌑 Moonquakes: The moon has seismic activity caused by Earth's gravity","### 🪐 Enceladus plumes: This moon sprays water into space from its south pole","### ☄️ Asteroid mining: One asteroid could contain trillions of dollars in metals","### ✨ Blue stragglers: Old stars that look young by stealing fuel from neighbors","### 🚀 SpaceX Starship: Designed to be the first fully reusable Mars transport","### 🌌 Multiverse theory: The idea that our universe is just one of many","### 🔭 Event Horizon: The "point of no return" around a black hole","### 🌍 Van Allen Belts: Two rings of radiation that surround our planet"];
        return interaction.reply(facts[Math.floor(Math.random() * facts.length)]);
    }

    if (interaction.commandName === "rank") {
        return interaction.reply(`🌑 ${interaction.user.username}, Inner Circle member`);
    }
});

// ===== LOGIN =====
client.login(TOKEN);
