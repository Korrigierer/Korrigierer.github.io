document.addEventListener('DOMContentLoaded', () => {
    // =======================
    // Constants & Helpers
    // =======================
    const FONT_SIZE = 16;
    const MATRIX_MIN_SPEED = 0.2;
    const MATRIX_MAX_SPEED = 0.7;
    const DEFAULT_GUESS_COUNT = 7;
    const DEFAULT_PARTY_DURATION = 3; // seconds
    const DEFAULT_PULSE_DURATION = 2; // seconds
    const DEFAULT_PULSE_FLASHES = 3;

    const rand = (min, max) => Math.random() * (max - min) + min;
    const escapeHTML = (str) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // =======================
    // Cached DOM elements
    // =======================
    const input = document.getElementById('terminalInput');
    const output = document.getElementById('output');
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    const themedElements = document.querySelectorAll('header, .terminal');

    // =======================
    // MATRIX SETUP
    // =======================
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let columns = Math.floor(width / FONT_SIZE);
    const drops = Array(columns).fill(0);
    const speeds = Array(columns).fill(0).map(() => rand(MATRIX_MIN_SPEED, MATRIX_MAX_SPEED));
    const chars = 'アカサタナハマヤラワアイウエオ0123456789abcdefghijklmnopqrstuvwxyz';
    let matrixColor = "#00ff99";

    let currentFontIndex = 0;
    let currentThemeIndex = 0;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        columns = Math.floor(width / FONT_SIZE);
        drops.length = columns;
        drops.fill(0);
        speeds.length = columns;
        for (let i = 0; i < columns; i++) speeds[i] = rand(MATRIX_MIN_SPEED, MATRIX_MAX_SPEED);
    });

    function drawMatrix() {
        ctx.fillStyle = 'rgba(10,10,10,0.1)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = matrixColor;
        ctx.font = `${FONT_SIZE}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = chars.charAt(Math.floor(rand(0, chars.length)));
            ctx.fillText(text, i * FONT_SIZE, drops[i] * FONT_SIZE);
            drops[i] += speeds[i];
            if (drops[i] * FONT_SIZE > height && Math.random() > 0.975) drops[i] = 0;
        }

        requestAnimationFrame(drawMatrix);
    }
    drawMatrix();

    // =======================
    // Terminal Output & History
    // =======================
    const commandHistory = [];
    let historyIndex = -1;

    function outputHTML(text) {
        output.innerHTML += `<p>${text}</p>`;
        output.scrollTop = output.scrollHeight;
    }

    // =======================
    // Temporary Input Handler (for games/effects)
    // =======================
    function temporaryInputHandler(callback) {
        input.removeEventListener('keydown', handleCommand);
        const listener = (e) => {
            callback(e, () => {
                input.removeEventListener('keydown', listener);
                input.addEventListener('keydown', handleCommand);
            });
        };
        input.addEventListener('keydown', listener);
    }

    // =======================
    // Commands & Actions
    // =======================
    function aboutCommand() {
        outputHTML("👾 Hello traveler! I'm Korri, a 25-year-old developer. Explore, play & enjoy.");
    }

    function linksCommand() {
        outputHTML(`<p>🔗 Useful links:</p>
        <ul>
            <li><a href="https://github.com/Korrigierer" target="_blank">GitHub</a></li>
            <li><a href="https://github.com/Korrigierer?tab=repositories" target="_blank">Projects</a></li>
        </ul>`);
    }

    function sudoCommand() {
        outputHTML("🛑 Permission denied. Just kidding, you are now the overlord 😎");
    }

    function clearTerminal() {
        output.innerHTML = "";
    }

    function helpCommand(args) {
        if (args.length) {
            const query = args[0].toLowerCase();
            if (commands[query]) {
                const argText = commands[query].args ? ` ${escapeHTML(commands[query].args)}` : "";
                outputHTML(`<span class="command-name">${query}</span><span class="command-args">${argText}</span> - <span class="command-desc">${commands[query].description}</span>`);
            } else {
                outputHTML(`❌ Command '${query}' not found.`);
            }
        } else {
            outputHTML("📄 Available commands:");
            for (const [name, info] of Object.entries(commands)) {
                const argText = info.args ? ` ${escapeHTML(info.args)}` : "";
                outputHTML(`<div><span class="command-name">${name}</span><span class="command-args">${argText}</span> - <span class="command-desc">${info.description}</span></div>`);
            }
            outputHTML("💡 Type 'help &lt;command&gt;' for detailed info on a specific command.");
        }
    }

    // =======================
    // Effects
    // =======================
    function flickerMatrix() {
        const original = matrixColor;
        const colors = ["#ff00ff", "#00ffff", "#ffff00", "#ff0000", "#00ff00"];
        const count = 30;
        outputHTML("💻 Hacking in progress...");
        let i = 0;

        function step() {
            matrixColor = colors[Math.floor(rand(0, colors.length))];
            const offsetX = rand(-5, 5);
            const offsetY = rand(-5, 5);
            canvas.style.transform = `translate(${offsetX}px,${offsetY}px)`;
            i++;
            if (i < count) setTimeout(step, rand(80, 150));
            else {
                matrixColor = original;
                canvas.style.transform = "translate(0,0)";
                outputHTML("✅ Hacking complete!");
            }
        }
        step();
    }

    function partyMatrix(args) {
        const duration = (parseInt(args[0]) > 0 ? args[0] : DEFAULT_PARTY_DURATION) * 1000;
        const colors = ["#ff00ff", "#00ffff", "#ffff00", "#00ff99"];
        const start = Date.now();
        const interval = setInterval(() => {
            matrixColor = colors[Math.floor(rand(0, colors.length))];
            if (Date.now() - start > duration) {
                clearInterval(interval);
                matrixColor = "#00ff99";
            }
        }, 100);
        outputHTML(`🎉 Party mode activated for ${duration / 1000}s!`);
    }

    function trollMatrix(lines = 20, speed = 50) {
        const glitchChars = '█▓▒░<>!?@#$%^&* ';
        const colors = ["#ff00ff", "#00ffff", "#ffff00", "#ff0000", "#00ff00"];
        let count = 0;

        const interval = setInterval(() => {
            let line = '';
            for (let i = 0; i < 20 + Math.floor(rand(0, 40)); i++) {
                line += glitchChars.charAt(Math.floor(rand(0, glitchChars.length)));
            }
            const color = colors[Math.floor(rand(0, colors.length))];
            outputHTML(`<span style="color:${color}; font-weight:bold;">${line}</span>`);
            count++;
            if (count >= lines) {
                clearInterval(interval);
                outputHTML('<span style="color:#ff00ff; font-weight:bold;">Glitch effect complete!</span>');
            }
        }, speed);
    }

    function pulseEffect(args) {
        const duration = (parseInt(args[0]) || DEFAULT_PULSE_DURATION) * 1000;
        const flashes = parseInt(args[1]) || DEFAULT_PULSE_FLASHES;
        const colors = ["#ff00ff", "#00ffff", "#ffff00", "#00ff99"];
        let count = 0;

        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: '1000', transition: 'background-color 0.5s, opacity 0.5s'
        });
        document.body.appendChild(overlay);

        const intervalTime = duration / flashes;
        const interval = setInterval(() => {
            overlay.style.backgroundColor = colors[Math.floor(rand(0, colors.length))];
            overlay.style.opacity = "0.3";
            matrixColor = overlay.style.backgroundColor;
            setTimeout(() => overlay.style.opacity = "0", intervalTime / 2);
            count++;
            if (count >= flashes) {
                clearInterval(interval);
                setTimeout(() => { overlay.remove(); matrixColor = "#00ff99"; }, intervalTime);
            }
        }, intervalTime);

        outputHTML(`🔥 Neon pulse activated for ${duration / 1000}s with ${flashes} flashes!`);
    }

    // =======================
    // Customization
    // =======================
    const themes = [
        { name: "Cyber Green", bg: "#0a0a0a", fg: "#00ff99" },
        { name: "Neon Pink", bg: "#1b1b1b", fg: "#ff00ff" },
        { name: "Aqua Matrix", bg: "#000000", fg: "#00ffff" },
        { name: "Solar Yellow", bg: "#111111", fg: "#ffff00" },
        { name: "Acid Green", bg: "#001100", fg: "#7fff00" },
        { name: "Magenta Haze", bg: "#1a001a", fg: "#ff33ff" },
        { name: "Electric Blue", bg: "#000022", fg: "#33ccff" },
        { name: "Lava Orange", bg: "#220000", fg: "#ff5500" },
        { name: "Toxic Yellow", bg: "#111100", fg: "#ffff33" },
        { name: "Retro Purple", bg: "#0f0033", fg: "#cc99ff" },
        { name: "Neon Red", bg: "#220000", fg: "#ff4444" },
        { name: "Frost Cyan", bg: "#001111", fg: "#66ffff" }
    ];

    function changeTheme(args = []) {
        if (args[0]) {
            const index = parseInt(args[0]) - 1;
            currentThemeIndex = index >= 0 && index < themes.length ? index : currentThemeIndex;
        } else currentThemeIndex = (currentThemeIndex + 1) % themes.length;

        const theme = themes[currentThemeIndex];
        document.body.style.transition = "background-color 0.5s,color 0.5s";
        document.body.style.backgroundColor = theme.bg;
        document.body.style.color = theme.fg;
        matrixColor = theme.fg;

        themedElements.forEach(el => {
            el.style.backgroundColor = "rgba(0,0,0,0.5)";
            el.style.color = theme.fg;
        });

        outputHTML(`🎨 Theme changed to <b>${theme.name}</b>! Background: ${theme.bg}, Text: ${theme.fg}`);
    }

    const fonts = [
        { name: "Courier New", css: "'Courier New', monospace" },
        { name: "Lucida Console", css: "'Lucida Console', monospace" },
        { name: "Consolas", css: "'Consolas', monospace" }
    ];

    function switchFont(args = []) {
        if (args[0]) {
            const match = fonts.find(f => f.name.toLowerCase() === args[0].toLowerCase());
            currentFontIndex = match ? fonts.indexOf(match) : currentFontIndex;
        } else currentFontIndex = (currentFontIndex + 1) % fonts.length;

        const font = fonts[currentFontIndex];
        document.body.style.fontFamily = font.css;
        outputHTML(`🖋 Terminal font switched to <b>${font.name}</b>`);
    }

    function adjustMatrixSpeed(args) {
        if (args[0]) {
            const val = parseFloat(args[0]);
            if (!isNaN(val) && val > 0) {
                speeds.forEach((_, i) => speeds[i] = val);
                outputHTML(`⚡ Matrix speed set to ${val}`);
                return;
            }
        }
        speeds.forEach((_, i) => speeds[i] = rand(MATRIX_MIN_SPEED, MATRIX_MAX_SPEED));
        outputHTML(`⚡ Matrix speed randomized to ${speeds[0].toFixed(2)}`);
    }

    // =======================
    // Games
    // =======================
    function startGuessGame(args = []) {
        const maxAttempts = parseInt(args[0]) || DEFAULT_GUESS_COUNT;
        const target = Math.floor(rand(1, 101));
        let attempts = 0;

        outputHTML(`🎯 Guess a number between 1-100. Max attempts: ${maxAttempts}. Type 'exit' to quit.`);

        temporaryInputHandler((e, restore) => {
            if (e.key !== 'Enter') return;
            const val = input.value.trim();
            input.value = '';

            if (val.toLowerCase() === 'exit') { outputHTML("🛑 Exiting game..."); restore(); return; }

            const guess = parseInt(val);
            if (isNaN(guess)) return;

            attempts++;
            if (guess < target) outputHTML(`⬇️ Too low! Attempts ${attempts}/${maxAttempts}`);
            else if (guess > target) outputHTML(`⬆️ Too high! Attempts ${attempts}/${maxAttempts}`);
            else { outputHTML(`🎉 Correct! The number was ${target}. Guessed in ${attempts} attempts.`); restore(); return; }

            if (attempts >= maxAttempts) {
                outputHTML(`💀 Game over! Number was ${target}.`);
                restore();
            }
        });
    }

    function startRPSGame() {
        const choices = ["rock", "paper", "scissors"];
        outputHTML("✂️ Rock-Paper-Scissors! Type rock, paper, or scissors:");

        temporaryInputHandler((e, restore) => {
            if (e.key !== 'Enter') return;
            const user = input.value.trim().toLowerCase();
            input.value = '';
            if (!choices.includes(user)) return;

            const comp = choices[Math.floor(rand(0, choices.length))];
            const result = user === comp ? "It's a tie!" :
                (user === "rock" && comp === "scissors") ||
                    (user === "paper" && comp === "rock") ||
                    (user === "scissors" && comp === "paper") ? "✅ You win!" : "❌ You lose!";

            outputHTML(`You chose ${user}, computer chose ${comp}. ${result}`);
            restore();
        });
    }

    function pingCommand() {
        outputHTML("🏓 Pinging 192.168.0.1 with 4 packets...");

        const results = [];
        let count = 0;

        function send() {
            if (count >= 4) {
                const avg = (results.reduce((a, b) => a + b, 0) / results.length).toFixed(2);
                outputHTML(`\nPing complete. Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`);
                outputHTML(`Approximate round trip times: Min = ${Math.min(...results)}ms, Max = ${Math.max(...results)}ms, Avg = ${avg}ms`);
                return;
            }

            const latency = Math.floor(rand(10, 110));
            results.push(latency);
            outputHTML(`Reply from 192.168.0.1: bytes=32 time=${latency}ms TTL=64`);
            count++;

            // Shorter, consistent delay for snappier feel
            setTimeout(send, 400 + rand(-100, 100));
        }

        send();
    }

    function showImage() {
        outputHTML("<img src='/assets/korri_logo.png' alt='Korri Emblem'>");
    }


    // =======================
    // Command Mapping
    // =======================
    const commands = {
        about: { description: "Displays info about this terminal and me.", args: "", action: aboutCommand },
        links: { description: "Shows links to GitHub and project repositories.", args: "", action: linksCommand },
        help: { description: "Displays help information for available commands.", args: "[command]", action: helpCommand },
        speed: { description: "Sets the speed of the Matrix effect.", args: "[value]", action: adjustMatrixSpeed },
        party: { description: "Activates party mode.", args: "[duration_s]", action: partyMatrix },
        pulse: { description: "Triggers a colorful pulse across the screen.", args: "[duration_s] [flash_count]", action: pulseEffect },
        hack: { description: "Flashes the Matrix text quickly.", args: "", action: flickerMatrix },
        troll: { description: "Displays a series of random glitch lines.", args: "", action: trollMatrix },
        sudo: { description: "Simulates superuser access (just for fun).", args: "", action: sudoCommand },
        guess: { description: "Starts a number guessing game.", args: "[max_attempts]", action: startGuessGame },
        rps: { description: "Starts Rock-Paper-Scissors game.", args: "", action: startRPSGame },
        ping: { description: "Simulates network ping.", args: "", action: pingCommand },
        font: { description: "Switches terminal font style.", args: "[font_name]", action: switchFont },
        theme: { description: "Changes background/text colors.", args: "[1-12]", action: changeTheme },
        clear: { description: "Clears the terminal screen.", args: "", action: clearTerminal },
        emblem: { description: "Shows a neat picture :D", args: "", action: showImage }
    };

    // =======================
    // Main Command Handler
    // =======================
    function handleCommand(e) {
        if (e.key !== "Enter") return;
        const fullInput = input.value.trim();
        input.value = '';
        if (!fullInput) return;

        commandHistory.push(fullInput);
        historyIndex = commandHistory.length;

        const parts = fullInput.split(" ");
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        outputHTML(`<span class="command-name">$ ${escapeHTML(fullInput)}</span>`);

        if (commands[cmd]) {
            commands[cmd].action(args);
            return; // ✅ Prevent "Command not found" for existing commands
        }

        outputHTML("❌ Command not found");
    }


    input.addEventListener('keydown', handleCommand);

    // =======================
    // Command History Navigation
    // =======================
    input.addEventListener('keydown', (e) => {
        if (e.key === "ArrowUp") {
            if (commandHistory.length && historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            }
            e.preventDefault();
        } else if (e.key === "ArrowDown") {
            if (commandHistory.length && historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                input.value = "";
            }
            e.preventDefault();
        }
    });

});


