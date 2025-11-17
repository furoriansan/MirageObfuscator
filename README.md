# MirageObfuscator
Obfuscate your Minecraft Bedrock resourcepack

What will be obfuscated:
- Animations
- AnimationControllers
- Attachables
- Entities
- Geometries
- Particles
- Render Controllers
- Sounds
What won't be obfuscated:
- Fogs
- Materials
- UI Files
- Fonts

How does it work?

In the root folder that contains all files, in my case 'MirageObfuscator' create an .env file with the following variables:
APP_ENV=DEV // Just leave this
GLOBAL_PATH=http://localhost:3000/ // If this port is free leave it, if not change the port to e.g. 3069.
OBFUSCATION_KEY=ilovecheesecake // Your obfuscation key, do not share this or others will be able to de-obfuscate your pack.

Next you'll want to make sure your resourcepack contains a ``mirage_config.json`` file which is structured like following:
```
{
    "keyword": "cheesecake" // Every identifier / filename that includes this will be obfuscated
}
```
This means you need to **manually** rename all the files and identifiers you want to have obfuscated.
E.g. animation.*cheesecake*_player.first_person.slide_hold or sounds/*cheesecake*_misc.
It also supports variables e.g:
```
				"cheesecake_start": {
					"animations": ["cheesecake_first_person_run_start"],
					"transitions": [
						{"glassline_hold": "q.all_animations_finished && q.modified_move_speed > 0.99 && q.is_on_ground && !q.is_sneaking && !v.cheesecake_is_wall_running && !q.is_jumping"},
						{cheesecake_stop": "q.modified_move_speed < 0.99 || !q.is_on_ground || q.is_jumping || q.is_sneaking || v.cheesecake_is_wall_running"}
					],
					"blend_transition": 0.2
				},
```

Your resourcepack must also follow a specific file structure, the zip file must contan all folders you want to obfuscate.
It obviously must be a valid resourcepack with valid syntax.
E.g.[Resourcepack.zip] => [sounds,models,entities, animations,pack_icon.png,mirage_config.json, manifest.json]

Once you're all set load up the website and upload your resourcepack.

