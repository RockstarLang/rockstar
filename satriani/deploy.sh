BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" ~= "master" ]]; then
    echo 'Skipping deploy for non-master branch.'
else
    echo 'Deploying satriani-browser.js to codewithrockstar.com'
    node node_modules/gh-pages/bin/gh-pages.js -r git@github.com:dylanbeattie/codewithrockstar.com.git --add --src satriani-browser.js -m 'Updated satriani-bundle.js from main repo' -b master -d js
fi