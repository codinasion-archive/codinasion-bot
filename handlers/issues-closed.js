const moment = require("moment");

// export handler
module.exports = handler;

async function handler(app, context) {
  if (
    context.payload.issue.user.type === "Bot" ||
    context.payload.issue.user.login === "harshraj8843"
  ) {
    return;
  }

  // check for label 'triage' and remove it
  const issue_data = context.payload.issue;
  const labels = issue_data.labels;
  const triage_label = labels.find((label) => label.name === "triage");
  if (triage_label) {
    await context.octokit.issues.removeLabel(
      context.issue({
        name: "triage",
      })
    );
  }

  // check for label 'closed' and add it
  const closed_label = labels.find((label) => label.name === "closed");
  if (!closed_label) {
    await context.octokit.issues.addLabels(
      context.issue({
        labels: ["closed"],
      })
    );
  }

  // get issue duration
  const issue_created_at = issue_data.created_at;
  const issue_closed_at = issue_data.closed_at;
  const duration = await moment(issue_closed_at).diff(issue_created_at, "days");

  // add new comment to the issue
  const new_comment = await context.issue({
    body: `This issue has been closed !!!

📆 Total duration: ${duration} days`,
  });

  // create new comment
  new_comment !== "" &&
    (await context.octokit.issues.createComment(new_comment));
}
