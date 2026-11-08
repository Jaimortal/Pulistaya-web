# 🎮 Pulistaya - Official Web Landing Page & 3D Showcase

A responsive landing page and interactive 3D map viewer for **Pulistaya**, an Android-exclusive 3D multiplayer hide-and-seek game inspired by the Filipino street game **Pulis Dunggab**, built with **Godot Engine 4.7.2**.

---

## 📱 Platform Target & Gameplay Notice

- **Platform Target:** **Android Only** (Smartphones & Tablets running Android 8.0+).
- **Controls:** Optimized for on-screen touch controls, virtual movement joysticks, drag-to-look camera rotation, and dedicated skill buttons.
- **PC Keyboard / WASD Notice:** Keyboard controls are strictly for **developer testing and rapid debugging** inside the Godot editor. Public PC play is not supported.
- **Multiplayer:** Local LAN and Mobile Hotspot connection through Godot's high-level ENet networking.

---

## ⚡ 3-Day Development Sprint & Open Source Notice

> **Note:** Pulistaya was built from scratch in a **total of 3 days** as a creative experiment, learning project, and cultural nostalgia piece. Please don't expect a commercial AAA release!

- **Repository:** [https://github.com/Jaimortal/Pulistaya-web](https://github.com/Jaimortal/Pulistaya-web)
- **100% Free & Open Source:** The entire source code and project are open for students, game developers, and the community to learn from.
- **No Store Release:** There is no intention to publish this game on Google Play Store or any commercial platform — it was built purely for fun.

---

## 👨‍💻 Credits & Behind the Scenes

- **Lead Designer & Developer:** **Jaime Perez** — Designed the game flow, system architecture, and orchestrated the multi-agent AI pipeline.
- **ChatGPT (GPT):** Structured the entire repository folder conventions and game flow architecture.
- **Gemini:** Coded and engineered the GDScript mechanics, multiplayer logic, and network synchronization.
- **Claude:** Created and modeled the 3D environmental map geometry.
- **Blender:** Used to modify, clean, and optimize the 3D map parts and materials.
- **Godot Engine 4.7.2:** Primary game engine powering the 3D graphics, physics, and ENet multiplayer networking.

### 🌐 Free & Open Source Community Assets:
- **[Grab3D](https://grab3d.com/):** Free open-source 3D character models.
- **[Kinemiq Studio](https://kinemiq.app/studio/):** Free open-source web studio used to rig and animate character movements.

---

## 📁 Web Project Structure

```text
Pulistaya-web/
├── .gitignore
├── index.html               # Main landing page
├── README.md                # Project documentation & credits
├── assets/
│   ├── css/
│   │   └── style.css        # Responsive stylesheet (no heavy blurs, 100% SVGs)
│   ├── js/
│   │   ├── main.js          # Interactive tabs, lightbox, download modals
│   │   └── viewer3d.js      # Demand-driven Three.js WebGL model viewer
│   ├── images/
│   │   ├── pulistaya-logo-rounded.png
│   │   ├── favicon.png
│   │   ├── character-select.png
│   │   ├── gameplay-compound.jpg
│   │   ├── gameplay-police-street.jpg
│   │   └── settings-controls.jpg
│   └── models/
│       ├── lobby.glb        # Primary 3D spawn arena
│       ├── compound.glb     # Neighborhood arena
│       ├── knight.glb       # Animated Chibi Hider hero
│       └── police.glb       # Animated Hunter hero
└── downloads/
    └── Pulistaya.apk        # Official Android export (V-11.8.6617 ~100 MB)
```

---

## 🚀 How to Run Locally

```bash
cd "C:\School Related File\Portfolio project\gamedev\Pulistaya\Pulistaya-web"
python -m http.server 8080
```
Open **[http://localhost:8080](http://localhost:8080)** in any modern web browser.
