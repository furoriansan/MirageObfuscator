MirageObfuscator 
Obfuscate your Minecraft Bedrock resource pack.

@-----------------------------------------------------
WHAT GETS OBFUSCATED
@-
- Animations
- Animation Controllers
- Attachables
- Entities
- Geometries
- Particles
- Render Controllers
- Sounds 

@-----------------------------------------------------
WHAT DOES NOT GET OBFUSCATED
@----------
- Fogs
- Materials
- UI Files
- Fonts 

@-
-----------------------------------------------------
SETUP GUIDE
A-
Create a .env file in the root directory (for example: MirageObfuscator/) with the following content:

APP_ENV=DEV
GLOBAL_PATH=http://localhost:3000/OBFUNCATION_KEY=ilovecheesecake

APP_ENV: leave as is
GLOBAL_PATH: change the port if 3000 is already in use
OBFUNCATION_KEY:x your private obfuscation key (keep it secret)

@-
-----------------------------------------------------
CONFIGUREYUR RESOURCE PACK
A-
Your resource pack must include a mirage_config.json file:

2x 
{
    "keyword": "cheesecake"
}

Any identifier or filename containing this keyword will be obfuscated.

Example identifiers: 
animation.*cheesecake*_player.first_person.slide_hold
sounds/*cheesecake_*misc
Example variables:
"cheesecake_start": {
    "animations": ["cheesecake_first_person_run_start"],
    "transitions": [
        {
            "glassline_hold": "q.all_animations_finished && q.modified_move_speed > 0.99 && q.is_on_ground && !q.is_sneaking && !v.cheesecake_is_wall_running && !q.is_jumping"
       },
        {
            "cheesecake_stop": "q.modified_move_speed < 0.99 || !(q.is_on_ground) || q.is_jumping || q.is_sneaking || v.cheesecake_is_wall_running"
       }
    ],
    "blend_transition": 0.2
}

@j-----------------------------------------------------
REQUIRED PACK STRUCTURE

Your ZIP file must contain the folders you want obfuscated and must be a valid Minecraft Bedrock resource pack.

Example structure:

Resourcepack.zip
- animations/
- entities/
- models/
- particles/
- sounds/
- pack_icon.png
- manifest.json
- mirage_config.json


@j-----------------------------------------------------
USING MIRAGEOBFUSCATOR

1. Open the MirageObfuscator website.
"2. Upload your resource pack ZIP.
3. All identifiers containing your keyword will be obfuscated.
