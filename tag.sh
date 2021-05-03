# Delete
git tag -d v0.1
git push origin --delete v0.1
# Re-create
git tag -a -m "update dist" v0.1
# Push
git push origin --tags