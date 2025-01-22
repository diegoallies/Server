require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const app = express();
const port = process.env.PORT || 3000;

// Promisify exec for better async handling
const execPromise = util.promisify(exec);

// Middleware to parse JSON requests
app.use(express.json());

// POST route for deployment
app.post('/deploy', async (req, res) => {
  try {
    const { appName, gitCommitMsg, gitBranch, sessionId, botName, ownerNumber, ownerName } = req.body;

    // Validate required fields
    if (!appName || !gitCommitMsg || !gitBranch) {
      return res.status(400).json({
        message: 'Missing required fields. Please provide appName, gitCommitMsg, and gitBranch.',
      });
    }

    // Save deployed app name to a file
    fs.appendFileSync('deployed_apps.txt', `${appName}\n`, 'utf8');

    const deploymentCommand = `
      #!/bin/bash

      APP_NAME="${appName}"
      HEROKU_EMAIL="blacodzacollins@gmail.com"
      HEROKU_API_KEY="HRKU-da40b814-bde5-48a9-a0b5-d8c32cdb4e2d"
      GIT_COMMIT_MSG="${gitCommitMsg}"
      GIT_BRANCH="${gitBranch}"
      SESSION_ID="${sessionId || ''}"
      BOT_NAME="${botName || ''}"
      OWNER_NUMBER="${ownerNumber || ''}"
      OWNER_NAME="${ownerName || ''}"

      echo "Initializing Git repository..."
      git init

      echo "Adding files to Git..."
      git add .

      echo "Creating Git commit..."
      git commit -m "$GIT_COMMIT_MSG"

      echo "Logging in to Heroku..."
      echo $HEROKU_API_KEY | heroku auth:token
      echo $HEROKU_API_KEY | heroku login --interactive

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

    // Execute deployment command
    const { stdout, stderr } = await execPromise(deploymentCommand, { maxBuffer: 1024 * 1024 });

    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res.status(500).json({ message: 'Deployment failed.', error: stderr });
    }

    console.log(`Stdout: ${stdout}`);
    res.json({ message: 'Deployment successful!', output: stdout });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: 'Deployment failed.', error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});