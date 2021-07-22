# Stale Branches be gone!

This Github actions is meant to keep repositories from accumulating stale old branches that linger on forever. This is very useful for repositories that have a large amount of contributors that aren't 100% active or may only contribute on rate occasions.

# How it works?

This Action will automatically create merge pull requests for branches that exceed a given number of days. Pull requests will remain open until the grace period exceeded. If a pull request exceeds the grace period, it will be closed automatically and the branch will be deleted.

## Inputs

Every available option.

| Input          | Defaults | Description                                                                                                         |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `expiry`       | 365      | The number of days before a branch is considered stale. (Default is one year)                                       |
| `grace`        | 14       | Grace period for the Pull Requests created before they are closed and the branch is deleted. (Default is two weeks) |
| `merge_target` | "main"   | The target branch used to target as the base of the PR.                                                             |
| `pr_title`     | string   | The title used followed by the branch name for PRs created when a branch is stale.                                  |
| `pr_message`   | string   | A custom message that will be appended to the PR body when creating one for a stale branch.                         |

## Example usage

```
on: [push]

jobs:
  stale-branches:
    runs-on: ubuntu-latest
    name: Stale branch management
    steps:
      - name: Clean up stale branches
        id: clean_stale_branches
        uses: etiennemartin/stale-branch-action@v0.1
        with:
          expiry: 365 # Days
          grace: 14 # days
          merge_target: "main"
          pr_title: "This is a custom title!"
          pr_message: "This is a customer Message!"
```
