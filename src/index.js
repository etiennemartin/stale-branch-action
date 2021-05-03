// const core = require('@actions/core');
const core = require('@actions/core');
const github = require('@actions/github');
const branches = require('./branches')
const pulls = require('./pulls')

function staleBranches(branches) {
  return {}
}

async function run() {
  const token = core.getInput('token')
  const expiry = core.getInput('expiry')
  const grace = core.getInput('grace')
  const prTitle = core.getInput('pr_title')
  const prMessage = core.getInput('pr_message')
  const defaultTargetBranch = core.getInput('merge_target')

  console.log(`Branch age limit: ${expiry} day(s).`);
  console.log(`PR Grace period: ${grace} day(s).`)
  console.log(`Target for merging: ${defaultTargetBranch}`)

  const client = github.getOctokit(token)
  const context = github.context
  const owner = context.repo.owner
  const repo = context.repo.repo
  
  var allBranches = await branches.getAllBranches(client, owner, repo)
  
  if (allBranches.length > 0) {
    console.log(`Found ${allBranches.length} unprotected branches`)

    var staleBranches = branches.staleBranches(allBranches, expiry)
    console.log(`Stale branches (${staleBranches.length})`)
    staleBranches.forEach(b => console.log(` > ${b.name}`))

    if (staleBranches.length > 0) {
      // Get all PRs
      var allPRs = await pulls.getAllPullRequests(client, owner, repo)
      console.log(`Fetched (${allPRs.length}) open PR(s).`)

      // Open new PRs for stales branches that don't have one already.
      toCreate = pulls.branchesWithoutPrs(allPRs, staleBranches)
      console.log(`Number of PRs to create: (${toCreate.length})`)

      if (toCreate && toCreate.length > 0) {
        await Promise.all(toCreate.map(b => {
          console.log(` > Creating PR for branch ${b.name}`)
          pulls.createPullRequest(
            client,
            owner,
            repo,
            b.name,
            defaultTargetBranch,
            "etiennemartin", // TODO: Pull this from Branch's last commit?
            `${prTitle} (${b.name})`,
            `**Branch:** ${b.name}\n**Grace period:** ${grace} day(s)\n\n${prMessage}`
          )
        }))
      }

      // Find PRs older than grace period
      if (allPRs && allPRs.length > 0) {
        var expiredPRs = pulls.expiredPullRequests(allPRs, staleBranches, grace)
        console.log(`Expired PRs (${expiredPRs.length})`)
        
        // Close stale PRs and Delete branches associated with them.
        if (expiredPRs && expiredPRs.length > 0) {
          console.log("About to start closing some PRs/Branches!")
          await Promise.all(expiredPRs.map(pr => {
            console.log(` > Closing PR > ${pr.title} #${pr.number}`)
            return pulls.closePullRequest(client, owner, repo, pr.number)
          }))

          await Promise.all(expiredPRs.map(pr => {
            console.log(` > Deleting Branch > ${pr.head.ref}`)
            return branches.closeBranch(client, owner, repo, pr.head.ref)
          }))
        }
      }
    } else {
      console.log("No stale branches! Woot!")
    }
  } else {
    console.log("No branches to worry about, sit back and relax! Things are good!")
  }
}

try {
  run();
} catch (err) {
  core.setFailed(`run() failed with error ${err}`);
}
