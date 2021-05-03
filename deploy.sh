echo "Building ..."
./build.sh

echo "Commit changes to Github..."
git add .
git commit -m "$1"
git push -u origin main

echo "Tagging changeset..."
./tag.sh
