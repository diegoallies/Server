require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/deploy', async (req, res) => {
  try {
    const {
      appName,
      herokuEmail,
      gitCommitMsg,
      gitBranch,
      sessionId,
      botName,
      ownerNumber,
      ownerName,
    } = req.body;

    // Check if all required fields are provided
    if (!appName || !herokuEmail || !gitCommitMsg || !gitBranch) {
      return res.status(400).json({
        message: 'Missing required fields. Please provide appName, herokuEmail, gitCommitMsg, and gitBranch.',
      });
    }

    const deploymentCommand = `
      #!/bin/bash

      APP_NAME="${appName}"
      HEROKU_EMAIL="${herokuEmail}"
      GIT_COMMIT_MSG="${gitCommitMsg}"
      GIT_BRANCH="${gitBranch}"
      SESSION_ID="${sessionId}"
      BOT_NAME="${botName}"
      OWNER_NUMBER="${ownerNumber}"
      OWNER_NAME="${ownerName}"

      echo "Initializing Git repository..."
      git init

      echo "Adding files to Git..."
      git add .

      echo "Creating Git commit..."
      git commit -m "$GIT_COMMIT_MSG"

      echo "Logging in to Heroku..."
      echo "$HEROKU_EMAIL" | heroku login -i

      echo "Creating Heroku app: $APP_NAME..."
      heroku create "$APP_NAME"

      echo "Adding Heroku remote..."
      git remote add heroku https://git.heroku.com/"$APP_NAME".git

      echo "Pushing code to Heroku..."
      git push heroku "$GIT_BRANCH":master --force

      echo "Setting environment variables on Heroku..."
      [ -n "$SESSION_ID" ] && heroku config:set SESSION_ID="$SESSION_ID" --app "$APP_NAME"
      [ -n "$BOT_NAME" ] && heroku config:set BOT_NAME="$BOT_NAME" --app "$APP_NAME"
      [ -n "$OWNER_NUMBER" ] && heroku config:set OWNER_NUMBER="$OWNER_NUMBER" --app "$APP_NAME"
      [ -n "$OWNER_NAME" ] && heroku config:set OWNER_NAME="$OWNER_NAME" --app "$APP_NAME"
      
      echo "Deployment completed successfully!"
    `;

    exec(deploymentCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ message: 'Deployment failed.', error: error.message });
      }

      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return res.status(500).json({ message: 'Deployment failed.', error: stderr });
      }

      console.log(`Stdout: ${stdout}`);
      res.json({ message: 'Deployment successful!', output: stdout });
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: 'Deployment failed.', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});