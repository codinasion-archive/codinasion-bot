// export handler
module.exports = handler;

async function handler(app, context) {
  if (
    context.payload.pull_request.user.type === "Bot" ||
    context.payload.pull_request.user.login === "harshraj8843"
  ) {
    return;
  }

  var new_comment = "";

  // get pull request data
  const pull_request_data = context.payload.pull_request;

  // get user data from pull request context
  const user_data = pull_request_data.user;

  // log activity
  app.log.info(
    `${user_data.login} (${pull_request_data.author_association}) has opened a pull request !!!`
  );

  // skip for owner and bots
  // pull request created by a collaborator
  if (pull_request_data.author_association === "COLLABORATOR") {
    // add labels to the pull request
    await context.octokit.issues.addLabels(
      context.issue({
        labels: ["triage", "team"],
      })
    );

    // new comment
    new_comment = await context.issue({
      body: `👋🏻 Hey @${user_data.login}

💖 Thanks for opening this pull request 💖

This PR will be reviewed and merged shortly.`,
    });
  }

  // pull request created by a member, contributor, non-member
  else if (
    pull_request_data.author_association === "MEMBER" ||
    "CONTRIBUTOR" ||
    "NONE"
  ) {
    // add labels to the pull request
    await context.octokit.issues.addLabels(
      context.issue({
        labels: ["triage"],
      })
    );

    // new comment
    new_comment = await context.issue({
      body: `👋🏻 Hey @${user_data.login}

💖 Thanks for opening this pull request 💖

This PR will be soon reviewed by a Codinasion team member and merged shortly.`,
    });
  }

  // pull request created by first time contributors
  else if (pull_request_data.author_association === "FIRST_TIME_CONTRIBUTOR") {
    // add labels to the pull request
    await context.octokit.issues.addLabels(
      context.issue({
        labels: ["triage", "first time"],
      })
    );

    // new comment
    new_comment = await context.issue({
      body: `👋🏻 Hey @${user_data.login}

💖 Thanks for opening this pull request 💖

This PR will be soon reviewed by a Codinasion team member and merged shortly.`,
    });
  }

  // create new comment
  new_comment !== "" &&
    (await context.octokit.issues.createComment(new_comment));

  // add reaction to the pull request
  await context.octokit.reactions.createForIssue(
    context.issue({
      content: "heart",
    })
  );
}
