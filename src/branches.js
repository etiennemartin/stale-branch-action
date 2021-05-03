const helpers = require('./helpers');

// Fetches all branches for the current repo and returns a smaller summary object for each branch
async function getAllBranches(client, owner, repo) {
  // TODO: Iterate over all results
  var response = await client.rest.repos.listBranches({ owner, repo, protected: false, per_page: 100, page: 1 })

  // Only un-protected branches excluding master and main
  var filtered = response.data.filter(b => !b.protected && (b.name != "master" && b.name != "main"))
  return await Promise.all(filtered.map(b => getBranch(client, owner, repo, b.name)))
}

// Fetches branch information for a given branch name
async function getBranch(client, owner, repo, branch) {
  try {
    var response = await client.rest.repos.getBranch({ owner, repo, branch })
  } catch (error) {
    console.log(`Failed to find branch ${branch} with error: ${error}`)
  }
  
  return response.data
}

// Returns a list of all branches older than the expiry
function staleBranches(branches, expiryInDays) {
  var expiry = helpers.expiryDate(expiryInDays)

  stale = branches.filter(branch => {
    last_commit = Date.parse(branch.commit.commit.committer.date)
    return last_commit < expiry
  })

  return stale
}

async function closeBranch(client, owner, repo, branch) {
  return await client.rest.git.deleteRef({owner, repo, ref: `heads/${branch}`})
}

module.exports = { 
  getAllBranches, 
  getBranch, 
  staleBranches,
  closeBranch
}
