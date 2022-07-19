// export handler
module.exports = handler;

async function handler(app, context) {
  if (
    context.payload.issue.user.type === "Bot" ||
    context.payload.issue.user.login === "harshraj8843"
  ) {
    return;
  }

  var new_comment = "";

  // get issue data
  const issue_data = context.payload.issue;

  // get user data from issue context
  const user_data = issue_data.user;

  // log activity
  app.log.info(
    `${user_data.login} (${issue_data.author_association}) has opened an issue !!!`
  );

  // skip for owner and bots
  // issue created by a collaborator
  if (issue_data.author_association === "COLLABORATOR") {
    // add labels to the issue
    await context.octokit.issues.addLabels(
      context.issue({
        labels: ["triage", "team"],
      })
    );

    // new comment
    new_comment = await context.issue({
      body: `
👋🏻 Hey @${user_data.login}

💖 Thanks for opening this issue 💖`,
    });
  }

  // issue created by a member, contributor, non-member
  else if (
    issue_data.author_association === "MEMBER" ||
    "CONTRIBUTOR" ||
    "NONE"
  ) {
    // add labels to the issue
    await context.octokit.issues.addLabels(
      context.issue({
        labels: ["triage"],
      })
    );

    // new comment
    new_comment = await context.issue({
      body: `
👋🏻 Hey @${user_data.login}

💖 Thanks for opening this issue 💖

A Codinasion team member should be by to give feedback soon.`,
    });
  }

  // issue created by first time contributors
  else if (issue_data.author_association === "FIRST_TIME_CONTRIBUTOR") {
    // add labels to the issue
    await context.octokit.issues.addLabels(
      context.issue({
        labels: ["triage", "first time"],
      })
    );

    // new comment
    new_comment = await context.issue({
      body: `
👋🏻 Hey @${user_data.login}

💖 Thanks for opening this issue 💖

A Codinasion team member should be by to give feedback soon.`,
    });
  }

  // create new comment
  new_comment !== "" &&
    (await context.octokit.issues.createComment(new_comment));

  // add reaction to the issue
  await context.octokit.reactions.createForIssue(
    context.issue({
      content: "heart",
    })
  );
}
