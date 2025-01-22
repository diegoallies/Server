require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/deploy', async (req, res) => {
  try {
    const { appName, herokuEmail, gitCommitMsg, gitBranch, sessionId, botName, ownerNumber, ownerName } = req.body;

    const deploymentCommand = `
      #!/bin/bash

      # Script to Deploy to Heroku Automatically
      # Dynamically prompts the user for inputs

      # Note: Heroku app name must be lowercase and contain only letters, digits, and dashes.
      # Note: Heroku app name must start with a letter, end with a letter or digit.

      # Heroku app name (already provided)
      APP_NAME="${appName}"

      # Heroku email (already provided)
      HEROKU_EMAIL="${herokuEmail}"

      # Git commit message (already provided)
      GIT_COMMIT_MSG="${gitCommitMsg}"

      # Git branch name (already provided)
      GIT_BRANCH="${gitBranch}"

      # Optional environment variables (already provided)
      SESSION_ID="${sessionId}"
      BOT_NAME="${botName}"
      OWNER_NUMBER="${ownerNumber}"
      OWNER_NAME="${ownerName}"

      # 2. Initialize a new Git repository (if not already initialized)
      # echo "Initializing a new Git repository..."
      # git init

      # 3. Add all files to Git
      echo "Adding files to Git..."
      git add .

      # 4. Create a commit
      echo "Creating commit..."
      git commit -m "${GIT_COMMIT_MSG}"

      # 5. Log in to Heroku (Browser-based login)
      echo "Logging in to Heroku..."
      heroku login -i "${HEROKU_EMAIL}" # Use provided email

      # 6. Create a new Heroku app
      echo "Creating new Heroku app with name '${APP_NAME}'..."
      heroku create "${APP_NAME}"

      # 7. Add Heroku remote
      echo "Adding Heroku remote..."
      git remote add heroku https://git.heroku.com/"${APP_NAME}".git

      # 8. Push changes to Heroku (Deploy the app)
      echo "Pushing code to Heroku..."
      git push heroku "${GIT_BRANCH}":master --force

      # 9. Set all environment variables on Heroku
      echo "Setting Heroku environment variables..."

      # Set all user-defined environment variables
      [ -n "${SESSION_ID}" ] && heroku config:set SESSION_ID="${SESSION_ID}" --app "${APP_NAME}"
      [ -n "${BOT_NAME}" ] && heroku config:set BOT_NAME="${BOT_NAME}" --app "${APP_NAME}"
      [ -n "${OWNER_NUMBER}" ] && heroku config:set OWNER_NUMBER="${OWNER_NUMBER}" --app "${APP_NAME}"
      [ -n "${OWNER_NAME}" ] && heroku config:set OWNER_NAME="${OWNER_NAME}" --app "${APP_NAME}"

      # Set default config variables (adjust these as needed)
      heroku config:set PREFIX="." --app "${APP_NAME}"
      heroku config:set CUSTOM_REACT="false" --app "${APP_NAME}"
      heroku config:set CUSTOM_REACT_EMOJIS="💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍" --app "${APP_NAME}"
      heroku config:set DELETE_LINKS="false" --app "${APP_NAME}"
      heroku config:set DESCRIPTION="*© Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Encrypto-27*" --app "${APP_NAME}"
      heroku config:set ALIVE_IMG="https://i.ibb.co/Hr5gqMN/IMG-20250120-WA0066.jpg" --app "${APP_NAME}"
      heroku config:set LIVE_MSG="> [🎐] ENCRYPTO-27-AI ɪs ᴏɴʟɪɴᴇ*⚡" --app "${APP_NAME}"
      heroku config:set READ_MESSAGE="false" --app "${APP_NAME}"
      heroku config:set AUTO_REACT="false" --app "${APP_NAME}"
      heroku config:set ANTI_BAD="false" --app "${APP_NAME}"
      heroku config:set AUTO_STATUS_SEEN="true" --app "${APP_NAME}"
      heroku config:set AUTO_STATUS_REPLY="false" --app "${APP_NAME}"
      heroku config:set AUTO_STATUS_MSG="*[❄️] Hi there, 𝔼ℕℂℝ𝕐ℙ𝕋-𝟚𝟟 𝔸𝕀 has viewed your Status🎐*" --app "${APP_NAME}"
      heroku config:set MODE="public" --app "${APP_NAME}"
      heroku config:set ANTI_LINK="true" --app "${APP_NAME}"
      heroku config:set AUTO_VOICE="true" --app "${APP_NAME}"
      heroku config:set AUTO_STICKER="true" --app "${APP_NAME}"
      heroku config:set AUTO_REPLY="true" --app "${APP_NAME}"
      heroku config:set ALWAYS_ONLINE="true" --app "${APP_NAME}"
      heroku config:set PUBLIC_MODE="true" --app "${APP_NAME}"
      heroku config:set AUTO_TYPING="true" --app "${APP_NAME}"
      heroku config:set READ_CMD="true" --app "${APP_NAME}"
      heroku config:set AUTO_RECORDING="true" --app "${APP_NAME}"

      # 10. Open the app in the browser (optional)
      # echo "Opening app in browser..."
      # heroku open --app "${APP_NAME}"

      echo "All tasks completed successfully!"
    `;

    try {
      const { stdout, stderr } = await exec(deploymentCommand);

      if (stderr) {
        console.error(stderr);
        return res.status(500).json({ message: 'Deployment failed.', error: stderr });
      }

      console.log(stdout);
      res.json({ message: 'Deployment successful!' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Deployment failed.', error: error.message });
    }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Deployment failed.', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
