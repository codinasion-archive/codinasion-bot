# issues.opened
# node_modules/.bin/probot receive -e issues -p test/fixtures/issues.opened.json ./index.js

# issues.closed
# node_modules/.bin/probot receive -e issues -p test/fixtures/issues.closed.json ./index.js

# pull_request.opened
node_modules/.bin/probot receive -e pull_request -p test/fixtures/pull_request.opened.json ./index.js

# pull_request.unlabeled
# node_modules/.bin/probot receive -e pull_request -p test/fixtures/pull_request.unlabeled.json ./index.js
