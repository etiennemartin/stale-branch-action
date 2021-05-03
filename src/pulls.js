const helpers = require('./helpers')

async function getAllPullRequests(client, owner, repo) {
  // TODO: Iterate over all results
  var response = await client.rest.pulls.list({owner, repo, open: "open", per_page: 100, page: 1})
  return response.data
}

// Given a list of PRs, determine if one exists for a given branch, if so it will return it.
function pullRequestExists(pullRequests, branchName) {
  return pullRequests.find(pr => pr.head == branchName)
}

// Determines if a given PR was last updated after the grace period
function isPullRequestExpired(pullRequest, gracePeriodDays) {
  var expiry = helpers.expiryDate(gracePeriodDays)
  return Date.parse(pullRequest.updated_at) < expiry
}

// Given a list of pull requests and branches, this method will return a list of PRs associated to a given
// branch that exceeds the grace period.
function expiredPullRequests(pullRequests, branches, gracePeriodDays) {
  // Only PRs linked to branches passed in
  var expiredPrs = pullRequests.filter(pr => branches.some(b => b.name == pr.head.ref))
  // Older than the grace period
  return expiredPrs.filter(pr => isPullRequestExpired(pr, gracePeriodDays))
}

// Returns a list of branches without PR associated with them.
function branchesWithoutPrs(pullRequests, branches) {
  return branches.filter(b => { 
    return pullRequests.some(pr => pr.head.ref == b.name) == false
  })
}

// Assigns a reviewer to a PR
async function assignReviewer(client, owner, repo, pull_number, assignee) {
  await client.rest.pulls.requestReviewers({
    owner,
    repo,
    pull_number,
    reviewers: [assignee]
  }) 
}

// Makes a request to close a given PR.
async function closePullRequest(client, owner, repo, pull_number) {
  await client.rest.pulls.update({
    owner,
    repo,
    pull_number,
    state: "closed"
  })
}

// Opens a new pull request.
async function createPullRequest(client, owner, repo, head, base, assignee, title, message) {
  try {
    var response = await client.rest.pulls.create({
      owner, repo, title, head, base, body: `${message}\n\n @${assignee}`, draft: false
    })

    if (response.data.number) {
      await assignReviewer(client, owner, repo, response.data.number, assignee)
    } else {
      console.log("Failed to assign reviewer due to missing PR number from response of creation.")
    }
  } catch (error) {
    console.log(`Failed to create Pr for branch ${head} against ${base}, error: ${error}`)
    // Delete branch?
  }
}

module.exports = { 
  getAllPullRequests, 
  pullRequestExists, 
  isPullRequestExpired,
  expiredPullRequests,
  branchesWithoutPrs,
  closePullRequest,
  createPullRequest
}