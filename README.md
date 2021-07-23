# Stale Branches be gone!

This Github actions is meant to keep repositories from accumulating stale old branches that linger on forever. This is very useful for repositories that have a large amount of contributors that aren't 100% active or may only contribute on rate occasions.

# How it works?

This Action will automatically create merge pull requests for branches that exceed a given number of days. Pull requests will remain open until the grace period exceeded. If a pull request exceeds the grace period, it will be closed automatically and the branch will be deleted.

## :warning::warning: WARNING :warning::warning:

Enabling the `delete_branches` flag in the configuration is a destructive :fire: action. Enabling this feature will delete the branch when the PR is automatically closed due to exceeding it's grace period.

## Inputs

Every available option.

| Input             | Defaults | Description                                                                                                         |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `delete_branches` | false    | Determines if the branch is deleted when closing associated PRs. WARNING: making this true is destructive!          |
| `expiry`          | 365      | The number of days before a branch is considered stale. (Default is one year)                                       |
| `grace`           | 14       | Grace period for the Pull Requests created before they are closed and the branch is deleted. (Default is two weeks) |
| `merge_target`    | "main"   | The target branch used to target as the base of the PR.                                                             |
| `pr_title`        | string   | The title used followed by the branch name for PRs created when a branch is stale.                                  |
| `pr_message`      | string   | A custom message that will be appended to the PR body when creating one for a stale branch.                         |

## Example usage

```
on:
  schedule:
    - cron: '0 0 * * *' # Everday at midnight

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
          delete_branches: false # WARNING: true value is destructive
```
