/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

// import moment from "moment";
const moment = require("moment");

module.exports = (app) => {
  app.log.info("Yay, the app was loaded!!!");

  //**************** /////////// Issues /////////// ****************//

  // on opening an issue
  app.on("issues.opened", async (context) => {
    if (context.payload.issue.user.type === "Bot") {
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

    // end of issues.opened event
  });

  // on closing an issue
  app.on("issues.closed", async (context) => {
    if (context.payload.issue.user.type === "Bot") {
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
    const duration = await moment(issue_closed_at).diff(
      issue_created_at,
      "days"
    );

    // add new comment to the issue
    const new_comment = await context.issue({
      body: `This issue has been closed !!!

📆 Total duration: ${duration} days`,
    });

    // create new comment
    new_comment !== "" &&
      (await context.octokit.issues.createComment(new_comment));

    // end of issues.closed event
  });

  // on issue reopened
  app.on("issues.reopened", async (context) => {
    if (context.payload.issue.user.type === "Bot") {
      return;
    }

    //  check for label 'closed' and remove it
    const issue_data = context.payload.issue;
    const issue_labels = issue_data.labels;
    const closed_label = issue_labels.find((label) => label.name === "closed");
    if (closed_label) {
      await context.octokit.issues.removeLabel(
        context.issue({
          name: "closed",
        })
      );
    }

    // check for label 'triage' and add it
    const triage_label = issue_labels.find((label) => label.name === "triage");
    if (!triage_label) {
      await context.octokit.issues.addLabels(
        context.issue({
          labels: ["triage"],
        })
      );
    }

    // end of issues.reopened event
  });

  //**************** /////////// Pull Requests /////////// ****************//

  // on opening a pull request
  app.on("pull_request.opened", async (context) => {
    if (context.payload.pull_request.user.type === "Bot") {
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
    else if (
      pull_request_data.author_association === "FIRST_TIME_CONTRIBUTOR"
    ) {
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

    // end of pull_request.opened event
  });

  // on closing a pull request
  app.on("pull_request.closed", async (context) => {
    if (context.payload.pull_request.user.type === "Bot") {
      return;
    }

    // check merged or closed
    const pull_request_data = context.payload.pull_request;
    const merged = pull_request_data.merged;

    // if merged
    if (merged) {
      // get user data from pull request context
      const user_data = pull_request_data.user;

      // log activity
      app.log.info(
        `${user_data.login} (${pull_request_data.author_association}) has merged a pull request !!!`
      );

      // congrats first time contributors
      if (pull_request_data.author_association === "FIRST_TIME_CONTRIBUTOR") {
        const congrats_comment = await context.issue({
          body: `Congrats on merging your first pull request! 🎉🎉🎉`,
        });
        congrats_comment !== "" &&
          (await context.octokit.issues.createComment(congrats_comment));
      }

      // merge comment
      const new_comment = await context.issue({
        body: `Thanks very much for contributing!

Your pull request has been merged 🎉 You should see your changes appear on the site in approximately 24 hours. 

Support this project by giving it a star ⭐.

[Join Our Community](https://github.com/codinasion/.github/issues/new?assignees=&labels=welcome+🎉🎉🎉&template=invitation.yml&title=Please+invite+me+to+Codinasion)

If you're looking for your next contribution, check out our [help wanted issues](https://github.com/search?q=is%3Aopen+label%3A%22help+wanted%22+user%3Acodinasion&type=Issues) :zap:`,
      });
      new_comment !== "" &&
        (await context.octokit.issues.createComment(new_comment));

      // remove all pending reviewers
      const reviewers = pull_request_data.requested_reviewers;
      if (reviewers.length > 0) {
        await context.octokit.pulls.removeRequestedReviewers(
          context.pullRequest({
            reviewers: reviewers,
          })
        );
      }

      // remove [ 🚧 WIP ] from title
      const title = pull_request_data.title;
      if (title.includes("[ 🚧 WIP ]")) {
        const new_title = title.replace("[ 🚧 WIP ] ", "");
        await context.octokit.pulls.update(
          context.pullRequest({
            title: new_title,
          })
        );
      }

      // check for label "triage" and remove it
      const triage_label = pull_request_data.labels.find(
        (label) => label.name === "triage"
      );
      if (triage_label) {
        await context.octokit.issues.removeLabel(
          context.issue({
            name: "triage",
          })
        );
      }
    } else {
      // if closed

      // check for label 'triage' and remove it
      const labels = pull_request_data.labels;
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

      // create new comment
      const new_comment = await context.issue({
        body: `This pull request has been closed !!!`,
      });

      // create new comment
      new_comment !== "" &&
        (await context.octokit.issues.createComment(new_comment));

      // replace [ 🚧 WIP ] with [Closed] in title
      const pull_request_title = pull_request_data.title;
      const wip_title = pull_request_title.includes("[ 🚧 WIP ]");
      if (wip_title) {
        const new_title = pull_request_title.replace("[ 🚧 WIP ]", "[Closed]");
        await context.octokit.pulls.update(
          context.pullRequest({
            title: new_title,
          })
        );
      } else {
        // add [Closed] to the title
        const new_title = `[Closed] ${pull_request_title}`;
        await context.octokit.pulls.update(
          context.pullRequest({
            title: new_title,
          })
        );
      }
    }

    // end of pull_request.closed event
  });

  // on pull request reopened
  app.on("pull_request.reopened", async (context) => {
    if (context.payload.pull_request.user.type === "Bot") {
      return;
    }

    // get pull request data
    const pull_request_data = context.payload.pull_request;

    // get user data from pull request context
    const user_data = pull_request_data.user;

    // log activity
    app.log.info(
      `${user_data.login} (${pull_request_data.author_association}) has reopened a pull request !!!`
    );

    // check for label 'closed' and remove it
    const labels = pull_request_data.labels;
    const closed_label = labels.find((label) => label.name === "closed");
    if (closed_label) {
      await context.octokit.issues.removeLabel(
        context.issue({
          name: "closed",
        })
      );
    }

    // check for label 'triage' and add it
    const triage_label = labels.find((label) => label.name === "triage");
    if (!triage_label) {
      await context.octokit.issues.addLabels(
        context.issue({
          labels: ["triage"],
        })
      );
    }

    // create new comment
    const new_comment = await context.issue({
      body: `This pull request has been reopened !!!`,
    });

    new_comment !== "" &&
      (await context.octokit.issues.createComment(new_comment));

    // remove [ 🚧 WIP ] or [Closed] from title
    const title = pull_request_data.title;
    if (title.includes("[ 🚧 WIP ] ")) {
      const new_title = title.replace("[ 🚧 WIP ] ", "");
      await context.octokit.pulls.update(
        context.pullRequest({
          title: new_title,
        })
      );
    }
    if (title.includes("[Closed] ")) {
      const new_title = title.replace("[Closed] ", "");
      await context.octokit.pulls.update(
        context.pullRequest({
          title: new_title,
        })
      );
    }

    // end of pull_request.reopened event
  });

  // on unlabeled pull request
  app.on("pull_request.unlabeled", async (context) => {
    if (context.payload.pull_request.user.type === "Bot") {
      return;
    }

    // get pull request data
    const pull_request_data = context.payload.pull_request;

    // get user data from pull request context
    const user_data = pull_request_data.user;

    // log activity
    app.log.info(
      `${user_data.login} (${pull_request_data.author_association}) has unlabeled a pull request !!!`
    );

    // check for unlabeled label
    const unlabeled_label = context.payload.label.name;
    if (unlabeled_label === "triage") {
      // check for label 'closed'
      const labels = pull_request_data.labels;
      const closed_label = labels.find((label) => label.name === "closed");
      if (closed_label === undefined) {
        // update pull request title
        const new_title = `[ 🚧 WIP ] ${pull_request_data.title}`;
        await context.octokit.pulls.update(
          context.pullRequest({
            title: new_title,
          })
        );
      }
    }

    // end of pull_request.unlabeled event
  });

  //// For more information on building apps:
  //// https://probot.github.io/docs/

  //// To get your app running against GitHub, see:
  //// https://probot.github.io/docs/development/
};
