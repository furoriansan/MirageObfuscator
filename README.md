# MirageObfuscator

An obfuscation tool for partly protecting your Minecraft Bedrock Edition resource packs

## 🛡️ What Gets Obfuscated

- **Animations** - Animation definitions and timelines
- **Animation Controllers** - State machine logic
- **Attachables** - Wearable items and accessories
- **Entities** - Entity behavior and properties
- **Geometries** - 3D model structures
- **Particles** - Particle effect definitions
- **Render Controllers** - Rendering logic and conditions
- **Sounds** - Audio file references

## ⚠️ What won't Obfuscated

- Fogs
- Materials
- UI Files
- Fonts

## 🚀 Getting Started

### Prerequisites

- Node.js installed on your system
- A valid Minecraft Bedrock resource pack

### Configuration

#### 1. Environment Setup

Create a `.env` file in the root folder (e.g., `MirageObfuscator/`) with the following variables:

```env
APP_ENV=DEV
GLOBAL_PATH=http://localhost:3000/
OBFUSCATION_KEY=your_secret_key_here
```

**Important:** 
- Change the port number if `3000` is already in use (e.g., `3069`)
- **Keep your `OBFUSCATION_KEY` private!** Anyone with this key can de-obfuscate your pack

#### 2. Pack Configuration

Add a `mirage_config.json` file to the root of your resource pack:

```json
{
    "keyword": "cheesecake"
}
```

The keyword acts as an obfuscation marker. Any file or identifier containing this keyword will be obfuscated.

### 📁 Resource Pack Structure

Your resource pack must follow this structure:

```
Resourcepack.zip
├── sounds/
├── models/
├── entities/
├── animations/
├── pack_icon.png
├── mirage_config.json
├── manifest.json
└── [other folders you want to obfuscate]
```

**Requirements:**
- Must be a valid resource pack with correct syntax
- The ZIP file must contain all folders at the root level
- Must include `mirage_config.json` 

## 📝 Usage Guide

### Marking Files for Obfuscation

**Manually rename** all files and identifiers you want obfuscated to include your keyword:

**Examples:**

- `animation.cheesecake_player.first_person.slide_hold`
- `sounds/cheesecake_misc/cheesecake_player_eat.ogg`
- `entity.cheesecake_custom_mob`

### Variable Support

MirageObfuscator supports obfuscating variables within your JSON files:

```json
"cheesecake_start": {
    "animations": ["cheesecake_first_person_run_start"],
    "transitions": [
        {
            "cheesecake_hold": "q.all_animations_finished && q.modified_move_speed > 0.99 && q.is_on_ground && !q.is_sneaking && !v.cheesecake_is_wall_running && !q.is_jumping"
        },
        {
            "cheesecake_stop": "q.modified_move_speed < 0.99 || !q.is_on_ground || q.is_jumping || q.is_sneaking || v.cheesecake_is_wall_running"
        }
    ],
    "blend_transition": 0.2
}
```

All instances of identifiers containing your keyword will be obfuscated throughout the pack.

### Running the Obfuscator

1. Start the web interface
2. Upload your prepared resource pack (ZIP format)
3. The obfuscated pack will be generated and ready for download

## 🔒 Security Best Practices

- **Never share your `OBFUSCATION_KEY`** - this is the key to de-obfuscating your pack
- Use a strong, unique key for each project
- Keep your `.env` file out of version control (add to `.gitignore`)
- **Store backups of your original, unobfuscated resource pack**

## 💡 Tips
- Test your obfuscated pack thoroughly before distribution

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
