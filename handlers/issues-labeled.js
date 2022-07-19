// export handler
module.exports = handler;

async function handler(app, context) {
  if (context.payload.issue.user.login !== "harshraj8843") {
    return;
  }

  // get label
  const label = context.payload.label;

  // check if label is 'auto-track'
  // then auto create related issues
  if (label.name === "auto-track") {
    // get issue data
    const issue_data = context.payload.issue;

    // get body of the issue
    var issue_body = issue_data.body;

    // derive description from issue body
    const description = issue_body.split("### Tracking Issues")[0];

    // derive tracking issues from issue body
    const tracking_issues = issue_body.split("### Tracking Issues")[1];

    // get list of sentences from tracking issues
    const tracking_issues_sentences = tracking_issues.split("\r\n");

    // tracking issues json
    const tracking_issues_json = [];

    // iterate over tracking issues sentences
    tracking_issues_sentences &&
      (await Promise.all(
        await tracking_issues_sentences.map(async (each_sentence) => {
          // check for pattern '- [ ] '
          if (each_sentence.startsWith("- [ ] ")) {
            // get sentence
            const sentence = each_sentence.split("- [ ] ")[1];

            // get language tag from sentence
            // get words like C C++ C# Java Python GO JavaScript PHP Julia, etc
            var language_tag = sentence.split("Write a ")[1];
            language_tag = language_tag.split(" programme ")[0];

            // append to tracking issues json
            tracking_issues_json.push({
              language_tag: language_tag,
              sentence: sentence,
            });
          }
        })
      )) &&
      // iterate over tracking issues json
      tracking_issues_json &&
      (await Promise.all(
        await tracking_issues_json.map(async (each_object) => {
          // create new issue
          const new_issue = await context.issue({
            title: `${each_object.sentence}`,
            body: `${description}`,
            labels: [
              `${each_object.language_tag}`,
              "good first issue",
              "programme",
            ],
          });

          // create new issue and get issue number
          const created_issue = await context.octokit.issues.create(new_issue);
          await app.log.info("issue number => " + created_issue.data.number);

          issue_body = await issue_body.replace(
            `${each_object.sentence}`,
            `#${created_issue.data.number}`
          );
        })
      )) &&
      // update issue body
      (await context.octokit.issues.update(
        context.issue({
          body: `${issue_body}`,
        })
      ));
  }
}
